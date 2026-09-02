import React, { useEffect, useRef, useState } from 'react';

export interface BgSettings {
  mode: 'dots' | 'aurora' | 'minimal';
  blur: number; // in px: 0, 8, 16, 24
  opacity: number; // in percentage: 20, 40, 60, 80, 100
}

export const DEFAULT_BG_SETTINGS: BgSettings = {
  mode: 'dots',
  blur: 0,
  opacity: 60,
};

export const BG_SETTINGS_STORAGE_KEY = 'app_portal_bg_settings_v1';

export const getStoredBgSettings = (): BgSettings => {
  try {
    const saved = localStorage.getItem(BG_SETTINGS_STORAGE_KEY);
    if (saved) return { ...DEFAULT_BG_SETTINGS, ...JSON.parse(saved) };
  } catch {
    // fallback
  }
  return DEFAULT_BG_SETTINGS;
};

export const saveStoredBgSettings = (settings: BgSettings) => {
  localStorage.setItem(BG_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('app:bg-settings-changed'));
};

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [settings, setSettings] = useState<BgSettings>(getStoredBgSettings);

  // Listen to background setting changes in real time
  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getStoredBgSettings());
    };
    window.addEventListener('app:bg-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('app:bg-settings-changed', handleSettingsChange);
  }, []);

  useEffect(() => {
    if (settings.mode === 'minimal') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 140,
    };

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDots();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Dot Grid Construction (22px to 25px spacing)
    const SPACING = 24;
    interface Dot {
      ox: number; // original X
      oy: number; // original Y
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
      phase: number;
    }

    let dots: Dot[] = [];

    const initDots = () => {
      dots = [];
      const cols = Math.floor(width / SPACING) + 2;
      const rows = Math.floor(height / SPACING) + 2;
      const offsetX = (width - cols * SPACING) / 2;
      const offsetY = (height - rows * SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = offsetX + c * SPACING;
          const oy = offsetY + r * SPACING;
          dots.push({
            ox,
            oy,
            x: ox,
            y: oy,
            vx: 0,
            vy: 0,
            baseRadius: 1.1,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    initDots();

    let time = 0;

    // Animation Render Loop
    const render = () => {
      time += 0.02;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      ctx.clearRect(0, 0, width, height);

      // Aurora Mode
      if (settings.mode === 'aurora') {
        const grad1 = ctx.createRadialGradient(
          width * 0.3 + Math.sin(time * 0.5) * 120,
          height * 0.4 + Math.cos(time * 0.4) * 90,
          20,
          width * 0.3,
          height * 0.4,
          width * 0.6
        );
        grad1.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
        grad1.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        const grad2 = ctx.createRadialGradient(
          width * 0.7 + Math.cos(time * 0.6) * 100,
          height * 0.6 + Math.sin(time * 0.5) * 80,
          20,
          width * 0.7,
          height * 0.6,
          width * 0.5
        );
        grad2.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
        grad2.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);

        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Interactive Dot Matrix Mode (Separation ~24px, follows mouse)
      const maxDist = mouse.radius;
      const opacityMultiplier = settings.opacity / 100;

      // Draw subtle mouse ambient glow
      if (mouse.x > -500) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, maxDist * 1.5);
        mouseGlow.addColorStop(0, `rgba(99, 102, 241, ${0.12 * opacityMultiplier})`);
        mouseGlow.addColorStop(0.5, `rgba(16, 185, 129, ${0.05 * opacityMultiplier})`);
        mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, maxDist * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        // Ambient gentle wave
        const wave = Math.sin(time + d.ox * 0.015 + d.oy * 0.015) * 1.2;

        // Mouse distance
        const dx = mouse.x - d.x;
        const dy = mouse.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          // Dots gently react and illuminate near mouse
          const force = (1 - dist / maxDist) * 16;
          const angle = Math.atan2(dy, dx);
          // Elastic spring towards mouse movement
          d.vx -= Math.cos(angle) * force * 0.2;
          d.vy -= Math.sin(angle) * force * 0.2;
        }

        // Return to home position with spring physics
        d.vx += (d.ox - d.x) * 0.08;
        d.vy += (d.oy + wave - d.y) * 0.08;

        // Damping
        d.vx *= 0.78;
        d.vy *= 0.78;

        d.x += d.vx;
        d.y += d.vy;

        // Color and size calculation based on proximity to mouse
        let alpha = 0.18 * opacityMultiplier;
        let radius = d.baseRadius;
        let fillStyle = `rgba(161, 161, 170, ${alpha})`;

        if (dist < maxDist) {
          const proximity = 1 - dist / maxDist;
          alpha = (0.2 + proximity * 0.7) * opacityMultiplier;
          radius = d.baseRadius + proximity * 1.8;
          // Gradient between emerald and indigo glow
          if (proximity > 0.6) {
            fillStyle = `rgba(129, 140, 248, ${alpha})`;
          } else {
            fillStyle = `rgba(52, 211, 153, ${alpha})`;
          }
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [settings]);

  if (settings.mode === 'minimal') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        filter: settings.blur > 0 ? `blur(${settings.blur}px)` : 'none',
        opacity: settings.opacity / 100,
      }}
      className="fixed inset-0 pointer-events-none z-0 transition-[filter,opacity] duration-500 select-none"
    />
  );
};
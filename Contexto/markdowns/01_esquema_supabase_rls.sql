-- ============================================================================
-- PORTAL MULTIPROPÓSITO: ESQUEMA DE BASE DE DATOS Y RLS EN SUPABASE
-- Módulos: Autenticación, To-Do (Snapshots Markdown) y Finanzas ($950 Reserva)
-- ============================================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLA: profiles (Perfiles de usuario y configuración del Fondo Base)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    protected_reserve_base NUMERIC(12, 2) NOT NULL DEFAULT 950.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, protected_reserve_base)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        950.00
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 2. TABLA: transactions (Ingresos y Egresos con Fondos Físicos y Digitales)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    fund_type TEXT NOT NULL CHECK (fund_type IN ('physical', 'digital')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    counterparty_concept TEXT NOT NULL, -- De qué/quién (ingreso) o Para qué/quién (egreso)
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas de finanzas
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(user_id, type);

-- Habilitar RLS en transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para transactions
CREATE POLICY "Los usuarios pueden ver sus propias transacciones" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias transacciones" 
    ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias transacciones" 
    ON public.transactions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias transacciones" 
    ON public.transactions FOR DELETE 
    USING (auth.uid() = user_id);


-- ============================================================================
-- 3. TABLA: emergency_withdrawals (Auditoría de Retiros que afectan el Fondo $950)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.emergency_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    amount_withdrawn NUMERIC(12, 2) NOT NULL CHECK (amount_withdrawn > 0),
    urgency_reason TEXT NOT NULL, -- Motivo/Justificación obligatoria de urgencia
    previous_reserve NUMERIC(12, 2) NOT NULL,
    new_reserve NUMERIC(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS en emergency_withdrawals
ALTER TABLE public.emergency_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus retiros de emergencia" 
    ON public.emergency_withdrawals FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden registrar retiros de emergencia" 
    ON public.emergency_withdrawals FOR INSERT 
    WITH CHECK (auth.uid() = user_id);


-- ============================================================================
-- 4. TABLA: todo_daily_logs (Snapshots diarios de tareas archivadas en Markdown)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.todo_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    agenda_id TEXT NOT NULL,
    agenda_name TEXT NOT NULL,
    markdown_content TEXT NOT NULL, -- Resumen completo en formato Markdown
    tasks_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de tareas
    total_tasks INT NOT NULL DEFAULT 0,
    completed_tasks INT NOT NULL DEFAULT 0,
    completion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_date_agenda UNIQUE(user_id, date, agenda_id)
);

-- Índices para búsqueda cronológica de To-Do
CREATE INDEX IF NOT EXISTS idx_todo_logs_user_date ON public.todo_daily_logs(user_id, date DESC);

-- Habilitar RLS en todo_daily_logs
ALTER TABLE public.todo_daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus bitácoras diarias To-Do" 
    ON public.todo_daily_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus bitácoras diarias To-Do" 
    ON public.todo_daily_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus bitácoras diarias To-Do" 
    ON public.todo_daily_logs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus bitácoras diarias To-Do" 
    ON public.todo_daily_logs FOR DELETE 
    USING (auth.uid() = user_id);
# 🌐 Guía Paso a Paso: Subir a GitHub y Desplegar Gratis en la Web

Aprende a publicar tu aplicación en la nube para que cualquier persona en el mundo pueda acceder desde su PC, celular o tablet mediante un enlace público HTTPS (o tu propio dominio).

---

## 🐙 PASO 1: Subir el Proyecto a GitHub

1. Abre una terminal (PowerShell o Git Bash) en la carpeta del proyecto:
   ```bash
   cd "D:\IDE VAULT\AppToDo"
   ```
2. Inicializa el repositorio y haz el primer commit:
   ```bash
   git init
   git add .
   git commit -m "feat: Portal Multiproposito AppToDo y Finanzas con Supabase"
   ```
3. Ve a [GitHub.com](https://github.com) y crea un nuevo repositorio (ej. `apptodo-portal`). **No** marques la opción de agregar README ni .gitignore (ya los tenemos).
4. Conecta y sube tu código con los comandos que te da GitHub:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/apptodo-portal.git
   git push -u origin main
   ```

---

## 🚀 PASO 2: Desplegar Gratis en Vercel (Recomendado — 2 Minutos)

**Vercel** es la plataforma más rápida, moderna y 100% gratuita para aplicaciones React / Vite.

1. Entra a [Vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Selecciona tu repositorio `apptodo-portal` y haz clic en **"Import"**.
4. En la sección **Environment Variables (Variables de Entorno)**, agrega:
   * **Nombre:** `VITE_SUPABASE_URL` | **Valor:** `https://hcqeymdhgelodybtyays.supabase.co`
   * **Nombre:** `VITE_SUPABASE_ANON_KEY` | **Valor:** *(Tu clave anon pública de Supabase)*
5. Haz clic en el botón azul **"Deploy"**.
6. ¡Listo! En 30 segundos Vercel te entregará una URL pública segura con HTTPS (ejemplo: `https://apptodo-portal.vercel.app`).

---

## ⚡ PASO 3: Desplegar Gratis en Netlify (Alternativa)

1. Entra a [Netlify.com](https://netlify.com) e inicia sesión con GitHub.
2. Haz clic en **"Add new site"** -> **"Import an existing project"**.
3. Selecciona tu repositorio `apptodo-portal`.
4. Configuración de Build:
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
5. En **Site configuration -> Environment variables**, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
6. Haz clic en **"Deploy Site"**.

---

## 🌍 PASO 4: Conectar un Dominio Propio (Gratis o Personalizado)

Si deseas que tu aplicación tenga un dominio personalizado (ej. `www.mitodo.com` o `tareas.tuempresa.pe`):

1. En tu panel de **Vercel** o **Netlify**, ve a **Settings -> Domains**.
2. Escribe tu dominio (ej. `app.tudominio.com`).
3. Vercel te dará 2 registros DNS (un registro `CNAME` o `A`).
4. Ve a tu proveedor de dominio (Namecheap, GoDaddy, Cloudflare, Nic.pe) y agrega esos 2 registros.
5. En 10 minutos tu aplicación estará funcionando bajo tu propio dominio con certificado SSL (candadito verde HTTPS) gratuito e ilimitado.

---

## 📱 PASO 5: Uso en Celulares y Tablets

La aplicación es **100% Responsive (Mobile-First)**:
* Cualquier persona puede abrir el enlace desde Google Chrome o Safari en su teléfono móvil.
* Pueden hacer clic en **"Agregar a pantalla de inicio"** en el navegador de su teléfono para usarla como una aplicación nativa (PWA).
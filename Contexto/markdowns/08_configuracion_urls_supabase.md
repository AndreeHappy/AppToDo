# 🔗 Configuración de URLs de Redirección en Supabase (Fix localhost:3000)

Explicación del motivo por el cual los correos redirigen a `localhost:3000` y cómo solucionarlo en 1 minuto.

---

## 🧐 ¿Por qué ocurrió el error `localhost:3000 rechaza la conexión`?

Por defecto, todos los proyectos nuevos en Supabase vienen configurados con la URL de redirección predeterminada:
`http://localhost:3000`

Cuando un usuario hace clic en el enlace **"Sign in"** o **"Confirm your email"** en su correo, Supabase intenta abrir esa dirección por defecto. Como tu aplicación está desplegada en **Vercel** (o en tu puerto local `http://localhost:5173`), el navegador no encuentra nada en el puerto `3000` y muestra el error de conexión rechazada.

---

## 🛠️ Solución Paso a Paso en Supabase:

1. Entra a tu panel de Supabase en este enlace directo:
   👉 **[Configuración de URL de Autenticación en Supabase](https://supabase.com/dashboard/project/hcqeymdhgelodybtyays/auth/url-configuration)**

2. En el campo **Site URL**:
   * Cambia `http://localhost:3000` por la URL pública de tu aplicación en Vercel (ejemplo: `https://app-to-do-beta.vercel.app` o la URL que te asignó Vercel).

3. En la sección **Redirect URLs** (URLs de Redirección Permitidas):
   * Haz clic en **"Add URL"** y agrega:
     * `https://*.vercel.app/**` (Permite cualquier despliegue en Vercel)
     * `http://localhost:5173/**` (Permite pruebas en tu computadora)
     * Tu URL exacta de Vercel (ej. `https://tu-proyecto.vercel.app/**`)

4. Haz clic en el botón verde **Save Changes**.

---

## 📩 Notificación No Invasiva y Reenvío de Correos (Implementado en la App)

* **Banner al registrarse:** Cuando una persona crea su cuenta con la verificación activada, la app le muestra un aviso amigable y no invasivo:
  > *"📩 ¡Cuenta creada con éxito! Hemos enviado un enlace de confirmación a tu correo. Por favor revisa tu bandeja de entrada o spam para activar tu acceso."*
* **Botón de Reenvío en 1 Clic:** Si por alguna razón el enlace expiró o no le llegó, al intentar iniciar sesión le aparecerá un botón directo:
  > *"Reenviar correo de verificación ahora"*.
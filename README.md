# Portal Multipropósito: To-Do Diario & Finanzas Personales

Plataforma web modular de alto rendimiento construida con **React, TypeScript, Vite, Tailwind CSS, Framer Motion y Supabase**. Integra autenticación de usuarios, gestor de tareas diarias con bitácoras automáticas en Markdown y un módulo financiero con protección de fondo de reserva intocable ($950).

---

## Estructura del Proyecto y Carpeta Contexto

```
D:\IDE VAULT\AppToDo\
├── Contexto/
│   ├── markdowns/
│   │   ├── 01_esquema_supabase_rls.sql      <-- Script SQL completo para Supabase (Tablas + RLS + Triggers)
│   │   ├── 02_modelo_datos_entidades.md     <-- Diccionario de datos y diagrama ERD
│   │   ├── 03_arquitectura_portal.md        <-- Arquitectura de Auth, Hub y módulos
│   │   ├── 04_reglas_finanzas_reserva.md    <-- Fórmulas financieras y protocolo de urgencias
│   │   └── 05_flujo_todo_markdown_sync.md   <-- Flujo de snapshots diarios To-Do en Markdown
│   └── imagenes/
│       ├── 01_portal_hub_dashboard.jpg      <-- Referencia visual del Portal Hub
│       └── 02_finance_module_reference.jpg  <-- Referencia visual del Módulo Financiero
├── src/
│   ├── components/
│   │   ├── auth/ (Login y Registro con Supabase)
│   │   ├── dashboard/ (Selector de Módulos Hub)
│   │   ├── finance/ (Balances, Transacciones, Fondo $950 y Auditorías)
│   │   └── todo/ (Agendas, Fechas, Prioridades Rojo/Amarillo/Verde)
│   ├── context/ (AuthProvider y estado global)
│   ├── lib/ (Cliente Supabase + Fallback local)
│   ├── types/ (Modelos e interfaces TypeScript)
│   ├── utils/ (Fechas y almacenamiento)
│   ├── App.tsx
│   └── main.tsx
├── INICIAR_APPTODO.bat                      <-- Acceso directo con 1 clic
├── .env.example                             <-- Plantilla de variables de entorno
└── package.json
```

---

## 1. Ejecución Local Rápida

### Opción A: Con 1 solo clic (Recomendado en Windows)
Haz doble clic sobre el archivo:
`INICIAR_APPTODO.bat` (Iniciará el servidor de desarrollo y abrirá automáticamente tu navegador en `http://localhost:5173`).

### Opción B: Desde la terminal
```bash
cd "D:\IDE VAULT\AppToDo"
npm install
npm run dev
```

> **Nota:** La aplicación incluye un **Modo Local / Demo Reactivo**, por lo que puedes iniciar sesión o registrarte inmediatamente sin necesidad de configurar Supabase en el primer instante.

---

## 2. Conexión con Supabase Cloud

Para habilitar la persistencia multiusuario en la nube:

1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Ve al apartado **SQL Editor** en Supabase, copia el contenido del archivo [`Contexto/markdowns/01_esquema_supabase_rls.sql`](./Contexto/markdowns/01_esquema_supabase_rls.sql) y haz clic en **Run**.
3. En tu proyecto de Supabase, ve a **Project Settings -> API** y copia tu `Project URL` y `anon public key`.
4. En la raíz de este proyecto, crea o edita tu archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://tu-id-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```
5. Reinicia el servidor con `npm run dev`. La aplicación detectará automáticamente Supabase Cloud y activará la sincronización en tiempo real.

---

## 3. Lógica del Módulo de Finanzas

* **Soporte Bivalente:** Registro de dinero en **Efectivo / Físico** y **Digital / Bancario**.
* **Fondo Protegido ($950):** El sistema mantiene bloqueados \$950 como reserva de ahorro intocable.
* **Saldo Libre para Gastos:** Dinero disponible que puedes gastar libremente ($\text{Saldo Total} - \$950$).
* **Protocolo de Urgencia:** Si un egreso supera el saldo libre, el sistema bloquea la acción y exige la confirmación con un **"Motivo / Justificación de Urgencia"** obligatorio, guardando la auditoría inmutable en `emergency_withdrawals`.

---

## 4. Sincronización del To-Do y Snapshots en Markdown

* Cada día de trabajo genera automáticamente un snapshot en Markdown estructurado (`todo_daily_logs`).
* Las tareas pendientes del día anterior pueden transferirse con 1 clic como punto de partida para el día siguiente.
* Puedes copiar el resumen en Markdown con el botón inferior para pegarlo en Obsidian o cualquier gestor de notas.

---

## 5. Despliegue a Producción

### A. Despliegue en Vercel (Recomendado)
1. Sube tu código a un repositorio de GitHub / GitLab.
2. Importa el proyecto en [Vercel](https://vercel.com).
3. En la sección **Environment Variables**, agrega:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Haz clic en **Deploy**.

### B. Despliegue en Netlify
1. Conecta el repositorio en [Netlify](https://netlify.com).
2. Configura:
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
3. Agrega las variables de entorno de Supabase y despliega.

### C. Compilación local para Servidor Nginx / Apache
```bash
npm run build
```
Sube el contenido generado en la carpeta `dist/` a tu servidor web.

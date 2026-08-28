# AppToDo — Portal Multipropósito de Productividad y Finanzas Personales

AppToDo es una plataforma web integral diseñada para centralizar la gestión de tareas diarias por agendas y el control financiero de flujo de caja con fondos blindados de ahorro. Construida con una arquitectura moderna basada en React 19, TypeScript, Tailwind CSS, Supabase y Vite.

---

## Tabla de Contenidos

- [Características Principales](#características-principales)
  - [1. Dashboard Hub Central](#1-dashboard-hub-central)
  - [2. Módulo To-Do (Gestor de Tareas y Agendas)](#2-módulo-to-do-gestor-de-tareas-y-agendas)
  - [3. Módulo de Finanzas Personales](#3-módulo-de-finanzas-personales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración de Base de Datos (Supabase)](#configuración-de-base-de-datos-supabase)
- [Instalación Local](#instalación-local)
- [Variables de Entorno](#variables-de-entorno)
- [Despliegue en Producción](#despliegue-en-producción)
- [Seguridad](#seguridad)

---

## Características Principales

### 1. Dashboard Hub Central
- **Navegación Modular:** Centro de mando que permite alternar entre el módulo de tareas y el módulo financiero.
- **Métricas en Tiempo Real:** Visualización en vivo del saldo total disponible y la cantidad de tareas pendientes para la jornada.
- **Sistema de Temas:** Soporte completo e instantáneo para Modo Oscuro (Obsidian Dark) y Modo Claro de alto contraste.
- **Persistencia de Sesión:** Mantiene al usuario en su módulo de trabajo al recargar y regresa al Hub al cerrar sesión.

### 2. Módulo To-Do (Gestor de Tareas y Agendas)
- **Múltiples Agendas:** Organización independiente de quehaceres (ej. Tesis, Trabajo, Personal) con creación y eliminación dinámica.
- **Diseño Estilo Notas de Papel:** Visualización limpia con lomo de color lateral indicador de prioridad (Urgente, Importante, Rápida).
- **Control de Fechas y Bitácoras Diarias:** Registro por fechas pasadas (con bloqueo de solo lectura y opción de desbloqueo manual).
- **Importador y Exportador Markdown:** Generación automática de bitácoras diarias formateadas en Markdown listas para exportar o importar.
- **Función de Arrastre de Pendientes:** Permite transferir tareas pendientes del día anterior con un solo clic.

### 3. Módulo de Finanzas Personales
- **Flujo de Caja Bimonetario:** Registro de Ingresos y Egresos con distinción de tipo de fondo (Efectivo/Físico y Digital/Bancos).
- **Protección de Fondo de Ahorro (Base Configurable):** Reserva protegida (ej. S/. 1,000.00) que se mantiene intacta frente a gastos comunes.
- **Cálculo de Saldo Libre:** Diferenciación entre dinero total y dinero efectivamente disponible para gastar sin afectar la reserva.
- **Gastos Pendientes Programados a Futuro:** Registro de compromisos financieros con fecha y hora futura que se descuentan automáticamente al cumplirse el plazo.
- **Bloqueo Preventivo de Sobregiro:** Validación en tiempo real que previene registrar gastos superiores al fondo físico o digital disponible.
- **Protocolo de Urgencia:** Registro de retiros excepcionales con auditoría de motivos cuando un gasto excede el saldo libre.
- **Paginación y Exportación a Excel:** Filtros avanzados por tipo/fondo, paginación configurable (5, 10, 20 o Ver Todos) y descarga directa en formato CSV compatible con Microsoft Excel (UTF-8 con BOM).

---

## Tecnologías Utilizadas

- **Frontend:** React 19, TypeScript, Vite
- **Estilos:** Tailwind CSS, Framer Motion
- **Iconografía:** Phosphor Icons
- **Backend & Autenticación:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Despliegue:** Vercel

---

## Estructura del Proyecto

```
AppToDo/
├── src/
│   ├── components/
│   │   ├── auth/          # Vistas de login, registro y recuperación de clave
│   │   ├── dashboard/     # Dashboard Hub central
│   │   ├── finance/       # Tarjetas de saldo, historial, modal de movimientos y auditoría
│   │   ├── todo/          # Tableros de tareas, agendas, selector de fechas y modal Markdown
│   │   └── ui/            # Componentes compartidos y badge de estado
│   ├── constants/         # Categorías financieras y paletas de colores
│   ├── context/           # Providers de Autenticación, Finanzas, Tareas y Temas
│   ├── lib/               # Cliente de conexión con Supabase
│   ├── styles/            # Tokens de diseño y variantes de componentes
│   ├── types/             # Definiciones e interfaces de TypeScript
│   ├── utils/             # Funciones utilitarias para fechas y formato de moneda
│   ├── App.tsx            # Enrutador principal del portal
│   └── main.tsx           # Punto de entrada de la aplicación
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Configuración de Base de Datos (Supabase)

Para desplegar la base de datos en Supabase, ejecuta el siguiente script SQL en el **SQL Editor** de tu proyecto:

```sql
-- 1. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  protected_reserve_base NUMERIC(12, 2) DEFAULT 950.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Movimientos Financieros
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'pending_expense')),
  fund_type TEXT NOT NULL CHECK (fund_type IN ('physical', 'digital')),
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  counterparty_concept TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  scheduled_datetime TIMESTAMPTZ,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Retiros de Urgencia (Auditoría)
CREATE TABLE IF NOT EXISTS emergency_withdrawals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id TEXT,
  amount_withdrawn NUMERIC(12, 2) NOT NULL,
  urgency_reason TEXT NOT NULL,
  previous_reserve NUMERIC(12, 2) NOT NULL,
  new_reserve NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Bitácoras Diarias To-Do
CREATE TABLE IF NOT EXISTS todo_daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  agenda_id TEXT NOT NULL,
  agenda_name TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  tasks_snapshot JSONB DEFAULT '[]'::jsonb,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  completion_rate INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date, agenda_id)
);

-- 5. Habilitar Seguridad por Fila (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_daily_logs ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Aislamiento de Datos por Usuario
CREATE POLICY "Users can access own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can access own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own emergencies" ON emergency_withdrawals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own daily logs" ON todo_daily_logs
  FOR ALL USING (auth.uid() = user_id);
```

---

## Instalación Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/AndreeHappy/AppToDo.git
   cd AppToDo
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con las credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## Seguridad

- **Encriptación de Contraseñas:** Administrada de forma nativa por Supabase Auth con hashing seguro (Bcrypt/Argon2).
- **Aislamiento Multi-inquilino (RLS):** Cada usuario solo puede consultar y modificar sus propias tareas y registros financieros a nivel de base de datos.
- **Prevención de Inyección SQL:** Todas las operaciones utilizan parámetros parametrizados a través del cliente oficial de Supabase.

---

## Licencia

Distribuido bajo la Licencia MIT.
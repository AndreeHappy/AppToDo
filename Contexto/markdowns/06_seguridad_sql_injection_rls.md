# 🛡️ Seguridad, Prevención de Inyecciones SQL y Protección de Datos

Explicación técnica de la arquitectura de seguridad implementada en **AppToDo & Finanzas** con Supabase y PostgreSQL.

---

## 🔒 1. ¿Por qué el sistema es inmune a Inyecciones SQL (SQL Injection)?

En aplicaciones tradicionales vulnerables, las consultas se construyen concatenando texto inseguro:
❌ *Vulnerable (Tradicional):* `SELECT * FROM tasks WHERE user_id = '` + input + `'`

En nuestra aplicación con **Supabase (PostgREST)**:
✔️ **Consultas Parametrizadas Nativas:** Cada operación (`.from('transactions').insert(...)`, `.select(...)`, `.update(...)`) es procesada por PostgREST como una llamada a procedimiento binario con parámetros tipados. 
✔️ **Imposibilidad de Inyección:** Los valores ingresados por el usuario (conceptos, notas, títulos) se tratan estrictamente como **datos planos**, jamás como código ejecutable SQL.

---

## 👥 2. Aislamiento de Usuarios: Row Level Security (RLS)

Aunque múltiples personas usen la misma URL pública y la misma base de datos, **ningún usuario puede ver ni modificar los datos de otro**.

### ¿Cómo funciona RLS?
A nivel del motor de base de datos PostgreSQL, cada tabla tiene activada la política:

```sql
CREATE POLICY "Los usuarios solo ven sus propios datos"
    ON public.transactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

1. Cuando un usuario inicia sesión, Supabase le entrega un **Token JWT firmado criptográficamente**.
2. Al hacer cualquier petición, PostgreSQL extrae el identificador `auth.uid()` del token.
3. Si un usuario malicioso intenta consultar `id` de otro usuario, la base de datos devuelve `0 filas` o `403 Forbidden` a nivel de servidor.

---

## 🔑 3. ¿Es seguro que la clave `anon` de Supabase esté en el Frontend?

**Sí, es 100% seguro por diseño de Supabase.**

* **Clave `anon` (Pública):** Está diseñada para estar en el cliente web. No tiene permisos de administrador; sus permisos están restringidos estrictamente por las políticas **RLS** que creamos.
* **Clave `service_role` (Privada/Secreta):** Esta clave **NUNCA** se coloca en el frontend ni en GitHub. Se mantiene segura en el panel de Supabase para operaciones administrativas de backend.
* **Archivo `.env` Protegido:** El archivo `.gitignore` excluye `.env` para que nunca se suban credenciales por error a repositorios públicos.
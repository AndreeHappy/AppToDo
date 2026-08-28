# 💰 Reglas de Negocio del Módulo de Finanzas Personales

Detalle de las fórmulas matemáticas, gestión de fondos físicos vs. digitales y política de protección del fondo de **$950**.

---

## 📐 1. Ecuaciones de Saldo y Fondos

Cada transacción pertenece a uno de dos tipos de fondo:
* **Fondo Físico ($F_{fis}$):** Dinero en efectivo, billetera física o caja chica.
* **Fondo Digital ($F_{dig}$):** Cuentas bancarias, billeteras virtuales (Yape, Plin, PayPal, etc.).

$$\text{Saldo Total} = (\sum \text{Ingresos}_{fis} + \sum \text{Ingresos}_{dig}) - (\sum \text{Egresos}_{fis} + \sum \text{Egresos}_{dig})$$

$$\text{Saldo Físico} = \sum \text{Ingresos}_{fis} - \sum \text{Egresos}_{fis}$$
$$\text{Saldo Digital} = \sum \text{Ingresos}_{dig} - \sum \text{Egresos}_{dig}$$

---

## 🛡️ 2. Lógica del Fondo Protegido de $950

* **Base de Reserva:** Configurada en **\$950.00** por defecto en el perfil de usuario.
* **Reserva Activa:** $\text{Fondo Protegido} = \min(\text{Saldo Total}, \$950.00)$
* **Saldo Libre para Gastos:** $\text{Saldo Libre} = \max(0, \text{Saldo Total} - \$950.00)$

```
[==================== Saldo Total ====================]
[---- Fondo Protegido ($950) ----][---- Saldo Libre ----]
       (Bloqueado / Ahorro)         (Dinero para gastos)
```

---

## 🚨 3. Protocolo de Retiro de Urgencia

Cuando el usuario registra un egreso cuyo importe $M$ excede el Saldo Libre ($\text{Saldo Libre} < M$):

1. **Bloqueo Visual:** La aplicación no procesa el egreso directamente.
2. **Modal de Confirmación de Urgencia:**
   * Muestra advertencia clara del impacto en la reserva de \$950.
   * Campo obligatorio: **"Motivo / Excusa de Urgencia"** (Mínimo 5 caracteres explicativos).
3. **Registro Inmutable de Auditoría:**
   * Se guarda el egreso en `transactions`.
   * Se registra la entrada en `emergency_withdrawals` con la justificación y fecha.
   * Se actualiza visualmente la tarjeta de fondo protegido mostrando el estado de contingencia.
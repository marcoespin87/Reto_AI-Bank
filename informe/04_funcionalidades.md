# Funcionalidades de la App

## Pantallas y flujos

---

### Autenticación

**Login y Registro** (`/(auth)/login`, `/(auth)/register`)

- Registro con email y contraseña
- Inicio de sesión con email/contraseña
- Inicio de sesión con Google (OAuth2)
- Sesión persistente: el usuario no necesita volver a loguearse
- Validación de formularios y manejo de errores

---

### Inicio — Dashboard

**Pantalla principal** (`/(tabs)/index`)

Muestra un resumen completo del estado del usuario:

- **Tarjeta bancaria digital** con saldo actual en tiempo real
- **Acciones rápidas**: Transferir, Pagar, Recargar
- **Progreso de mAiles**: cuántos lleva acumulados esta temporada
- **Resumen semanal de gasto**: barra de progreso
- **Cromos recientes**: los últimos 3 cromos obtenidos con su rareza
- **Últimas transacciones**: movimientos recientes con icono por categoría

---

### Banco — Operaciones financieras

**Pantalla de banco** (`/(tabs)/banco`)

Toda la operativa bancaria de la app:

- **Ver saldo y número de cuenta** (con opción de copiar)
- **Transferir**: ingresa número de cuenta de 16 dígitos del destinatario, valida que exista, descuenta saldo y acredita al destinatario
- **Pagar servicios**: registra el pago como transacción
- **Compras online**: registra la compra

**Mecánica de recompensas al gastar:**
```
Por cada $100 gastados  → 10 mAiles
Por cada $20 gastados   → 1 cromo aleatorio del álbum
```

Cuando se obtienen cromos, aparece el **SobreModal** (animación de sobre que se abre y revela cada cromo con su rareza).

- **Historial de transacciones**: filtrable por últimos 7 o 30 días

---

### Álbum — Colección de cromos

**Pantalla de álbum** (`/(tabs)/album`)

Sistema de colección estilo álbum de figuritas:

- **28 cromos** en total para completar el álbum
- **3 niveles de rareza** con colores y bordes diferenciados:
  - Común (gris) → más frecuente
  - Raro (azul) → menos frecuente
  - Épico (dorado) → muy difícil de obtener
- **Filtro** por rareza (Todos / Épico / Raro / Común)
- **Cromos bloqueados** muestran "?" hasta ser obtenidos
- **Cantidad** de duplicados (x2, x3) si tiene varios del mismo
- **Progreso** en porcentaje hacia el álbum completo
- **Banner dorado** al completar el álbum
- Vista de detalle por cromo al tocar

---

### Mundial — Predicciones de partidos

**Pantalla del mundial** (`/(tabs)/mundial`)

Sistema de predicciones para partidos del Mundial FIFA 2026:

- **Información del partido**: equipos, estadio, fecha
- **Estadísticas**: últimos 5 resultados, historial H2H, ranking FIFA, jugadores destacados
- **Forma actual** de cada equipo
- **Interfaz de predicción**: botones +/- para ingresar marcador predicho
- **Sistema de racha**: bonus de mAiles por predicciones consecutivas correctas
- **Historial**: no permite predecir dos veces el mismo partido
- **AI Coach** (chatbot): análisis del partido con recomendaciones de predicción

---

### Grupo — Ligas grupales

**Pantalla de grupo** (`/(tabs)/grupo`)

Sistema de competencia en equipo:

- **Crear grupo** con nombre personalizado
- **Unirse a grupo** mediante código de invitación
- **Lista de miembros** con sus mAiles aportados, medalla y estrellas
- **Sistema de votación**: los miembros activos aprueban o rechazan nuevas solicitudes de ingreso
- **Objetivos del grupo**: metas colectivas con barra de progreso
- **Renombrar grupo** (solo para el creador)

---

### Perfil — Cuenta y estadísticas

**Pantalla de perfil** (`/(tabs)/perfil`)

Vista completa del progreso del usuario:

- **Avatar** con inicial del nombre y anillo en color de la liga
- **Estadísticas**: total de mAiles, predicciones realizadas, temporadas, racha máxima
- **Progreso de medalla**: barra de avance (estrellitas) hacia la siguiente medalla
- **6 niveles de medalla** con indicador visual (desbloqueadas, actual, bloqueadas)
- **Beneficios por medalla**: multiplicadores de mAiles, accesos exclusivos, upgrades
- **Acceso al premio personalizado** → botón "Mi Premio de Temporada"
- **Configuración**: notificaciones, seguridad, idioma, cerrar sesión

---

### Premios — Premio personalizado por IA

**Pantalla de premios** (`/(tabs)/premios`)

La funcionalidad diferenciadora de la app:

- Carga el perfil completo del usuario desde Supabase
- Llama al modelo de ML (FastAPI) con 35+ parámetros del usuario
- **Muestra el premio personalizado** con:
  - Categoría y color temático
  - Nombre del premio con emoji
  - **% de afinidad** (qué tan bien encaja el premio con el perfil)
  - **% de confianza** del modelo en la predicción
  - **Razones explicadas**: por qué el modelo eligió ese premio
  - **Top 3 categorías** con barras de probabilidad
  - **2 premios alternativos** dentro de la misma categoría
- Pull-to-refresh para recalcular
- Estado de carga y manejo de errores si la API no está disponible

---

## Sistema de mAiles (puntos)

Los mAiles son la moneda de engagement de la app:

| Acción | mAiles ganados |
|---|---|
| Gastar $100 | 10 mAiles |
| Predicción correcta | Variable (+ bonus por racha) |
| Completar objetivo de grupo | Según el objetivo |
| Obtener cromo épico | Bonus especial |

**Multiplicadores por medalla:**
| Medalla | Multiplicador |
|---|---|
| 1 | × 1.0 |
| 2 | × 1.1 |
| 3 | × 1.2 |
| 4 | × 1.5 |
| 5 | × 2.0 |
| 6 | × 3.0 |

---

## Sistema de medallas

6 niveles de progresión, cada uno con 5 estrellas. Se avanza ganando estrellas mediante compras y actividad:

| Medalla | Nombre | Beneficios clave |
|---|---|---|
| 1 | Bronce I | Acceso básico, mAiles × 1.0 |
| 2 | Bronce II | Ligas grupales desbloqueadas |
| 3 | Plata I | mAiles × 1.2, acceso anticipado preventas |
| 4 | Plata II | mAiles × 1.5, sala VIP aeropuertos |
| 5 | Oro | mAiles × 2.0, upgrades de vuelo |
| 6 | Diamante | mAiles × 3.0, palco VIP, beneficios ilimitados |

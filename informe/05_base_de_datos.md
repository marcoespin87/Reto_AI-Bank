# Base de Datos

## Motor y proveedor

**PostgreSQL** alojado en **Supabase** (cloud).

- URL del proyecto: `https://yrlhuzuoulnkmypziiha.supabase.co`
- Acceso desde la app mediante el SDK `@supabase/supabase-js`
- Autenticación mediante JWT (tokens)
- Row Level Security (RLS) habilitado

---

## Diagrama de entidades principales

```
economic_tiers ──────── users ──────────── transactions
                          │
                 ┌────────┼─────────┬──────────────┐
                 │        │         │              │
           group_members  │   predictions    user_stickers
                 │        │                       │
               groups   seasons               stickers
                 │        │
      ┌──────────┤    ┌───┴────────┐
      │          │    │            │
group_join_votes │  matches    rewards
                 │    │            │
         group_objective  match_stats  season_winners
           _progress
```

---

## Tablas y su propósito

### `users` — Tabla central
La tabla más importante. Contiene el perfil completo del usuario incluyendo todos los campos que el modelo de IA necesita.

```sql
id                        -- PK autoincremental
nombre, email             -- identidad
fecha_nacimiento, edad    -- datos demográficos
fecha_registro            -- antigüedad como cliente
economic_tier_id          -- FK → economic_tiers

-- Financiero
saldo                     -- balance actual
mailes_acumulados         -- puntos ganados
mailes_canjeados
numero_cuenta             -- número único de 16 dígitos
gasto_mensual_usd         -- gasto promedio mensual
frecuencia_transacciones_mes
antiguedad_cliente_meses
num_productos_bancarios
score_crediticio          -- AAA | AA | A | B | C
tiene_credito_activo
tiene_cuenta_ahorro
meses_sin_mora

-- Distribución de gasto (para el modelo ML)
pct_gasto_tecnologia
pct_gasto_viajes
pct_gasto_restaurantes
pct_gasto_entretenimiento
pct_gasto_supermercado
pct_gasto_salud
pct_gasto_educacion
pct_gasto_hogar
pct_gasto_otros

-- Gamificación (para el modelo ML)
predicciones_correctas_pct
racha_maxima_predicciones
cromos_coleccionados
cromos_epicos_obtenidos
objetivos_completados

-- Comportamiento social (para el modelo ML)
participo_en_grupo
rol_en_grupo
votos_emitidos
dias_activo_temporada

-- Demográfico (para el modelo ML)
genero, ciudad, nivel_educacion, ocupacion, estado_civil

-- Digital (para el modelo ML)
usa_app_movil
sesiones_app_semana
notificaciones_activadas
compras_online_pct
dispositivo_preferido
```

### `transactions` — Movimientos bancarios
```sql
id, user_id (FK)
monto, categoria         -- tipo: Transferencia | Pago | Compra Online
fecha
mailes_generados         -- mAiles que generó esta transacción
```

### `stickers` — Cromos del álbum
```sql
id, match_id (FK)
nombre, imagen_url
rareza                   -- comun | raro | epico
```

### `user_stickers` — Cromos del usuario
```sql
id, user_id (FK), sticker_id (FK)
fecha_obtencion
origen                   -- gasto | prediccion | racha | medalla
```

### `groups` — Grupos de competencia
```sql
id, nombre
temporada_id (FK), creador_id (FK), liga_id (FK)
tipo_formacion           -- libre | matching
max_miembros
codigo_invitacion
```

### `group_members` — Miembros de grupos
```sql
id, group_id (FK), user_id (FK)
estado                   -- activo | pendiente | rechazado
fecha_ingreso
mailes_aportados
medalla_actual           -- nivel de medalla (1-6)
estrellas_actuales       -- progreso dentro de la medalla (0-5)
```

### `group_join_votes` — Votaciones de ingreso
```sql
id, group_id (FK), candidato_id (FK), votante_id (FK)
voto                     -- aprobado | rechazado
fecha
```

### `predictions` — Predicciones de partidos
```sql
id, user_id (FK), match_id (FK), group_id (FK)
res_predicho_local, res_predicho_visitante
es_correcto              -- boolean, se actualiza al terminar el partido
mailes_ganados
```

### `matches` — Partidos del Mundial
```sql
id, season_id (FK)
equipo_local, equipo_visitante
fecha_partido
resultado_local, resultado_visitante
```

### `match_stats` — Estadísticas por partido
```sql
id, match_id (FK)
equipo                   -- local | visitante
ultimos_5_resultados     -- JSON
h2h_ganados, h2h_empatados, h2h_perdidos
goles_anotados_temporada, goles_recibidos_temporada
ranking_fifa
jugadores_destacados     -- JSON
forma_actual
```

### `economic_tiers` — Niveles económicos
```sql
id, nombre               -- Bronce | Plata | Oro | Diamante
descripcion
umbral_gasto_min, umbral_gasto_max
```

### `seasons` — Temporadas
```sql
id, nombre
fecha_inicio, fecha_fin
estado                   -- activa | finalizada
```

### `ligas` — Ligas por temporada
```sql
id, season_id (FK), economic_tier_id (FK)
nombre, descripcion
```

### `liga_medals` — Estructura de medallas
```sql
id, liga_id (FK)
numero_medalla, nombre_medalla
umbral_compras_por_estrella
```

### `liga_objectives` — Objetivos de liga
```sql
id, liga_id (FK)
nombre, descripcion
tipo                     -- racha_compra | umbral_gasto_grupal | tasa_prediccion | coleccion_stickers
valor_objetivo
recompensa_mailes
periodo                  -- semanal | mensual | temporada
es_objetivo_maximo
```

### `group_objective_progress` — Progreso en objetivos
```sql
id, group_id (FK), objective_id (FK)
progreso_actual
completado               -- boolean
fecha_completado
```

### `rewards` — Catálogo de premios
```sql
id, temporada_id (FK), liga_id (FK)
nombre, descripcion
tipo                     -- tecnologia | viajes | experiencias | premium
```

### `season_winners` — Ganadores por temporada
```sql
id, season_id (FK), liga_id (FK), user_id (FK), group_id (FK), reward_id (FK)
fecha_asignacion
```

---

## Cómo se conecta desde la app

```ts
// lib/supabase.ts — un solo cliente compartido por toda la app
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://yrlhuzuoulnkmypziiha.supabase.co',
  'eyJ...',  // anon key (solo lectura pública)
  { auth: { storage: ExpoSecureStoreAdapter } }
);
```

Todas las pantallas importan este cliente:
```ts
import { supabase } from '../../lib/supabase';

// Leer
const { data } = await supabase.from('users').select('*').eq('email', email).single();

// Escribir
await supabase.from('transactions').insert({ user_id, monto, categoria });

// Actualizar
await supabase.from('users').update({ saldo: nuevoSaldo }).eq('id', userId);
```

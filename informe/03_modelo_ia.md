# Modelo de Inteligencia Artificial

## Objetivo

El modelo determina, al final de cada temporada, **qué premio personalizado le corresponde a cada usuario ganador** según su comportamiento real dentro de la app.

No todos los usuarios ganan lo mismo. El modelo analiza 49 características del usuario y predice cuál categoría de premio maximiza su satisfacción y afinidad.

---

## Arquitectura del modelo (dos etapas)

```
Perfil del usuario (35 campos desde Supabase)
              ↓
    ┌─────────────────────┐
    │  build_input_df.py  │  ← Feature engineering
    │  (49 features)      │
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │  Modelo 1: ML       │  ← LightGBM / XGBoost pipeline
    │  Clasifica en       │     Precisión: 84.2%
    │  9 categorías       │
    └─────────────────────┘
              ↓
       categoría ganada
              ↓
    ┌─────────────────────┐
    │  Modelo 2: Reglas   │  ← reglas_premios.py
    │  Premio específico  │     Score de afinidad 0-100
    │  dentro de la cat.  │
    └─────────────────────┘
              ↓
         Premio final + razones
```

---

## Modelo 1 — Clasificación ML

### Algoritmo
Pipeline de scikit-learn con preprocesamiento + clasificador LightGBM/XGBoost.

### Las 9 categorías de salida

| Categoría | Premios típicos |
|---|---|
| `tecnologia` | Smartphone, laptop, smartwatch, tablet |
| `viajes_nacionales` | Hotel Galápagos, Tour Amazonía, Ruta del Sol |
| `viajes_internacionales` | Vuelo LATAM, Cancún, Europa, Crucero Caribe |
| `gastronomia` | Cena premium Quito/Guayaquil, cata de vinos |
| `experiencias_entretenimiento` | Conciertos, partido Liga Pro VIP, rally |
| `salud_bienestar` | Gym, spa, chequeo médico, app bienestar |
| `educacion_desarrollo` | Idiomas, Coursera, diplomado, emprendimiento |
| `hogar_lifestyle` | Electrodoméstico, decoración, robot aspirador |
| `premium_financiero` | Fondos mutuos, seguro de vida, Tarjeta Black |

### Los 49 features (agrupados en bloques)

**Bloque A — Perfil financiero (9 features)**
```
liga_tier, gasto_mensual_usd, frecuencia_transacciones_mes,
antiguedad_cliente_meses, num_productos_bancarios, score_crediticio,
tiene_credito_activo, tiene_cuenta_ahorro, meses_sin_mora
```

**Bloque B — Porcentajes de gasto por categoría (9 features)**
```
pct_gasto_tecnologia, pct_gasto_viajes, pct_gasto_restaurantes,
pct_gasto_entretenimiento, pct_gasto_supermercado, pct_gasto_salud,
pct_gasto_educacion, pct_gasto_hogar, pct_gasto_otros
```

**Bloque C — Gamificación (8 features)**
```
medalla_final, estrellas_finales, mailes_acumulados,
predicciones_correctas_pct, racha_maxima_predicciones,
cromos_coleccionados, cromos_epicos_obtenidos, objetivos_completados
```

**Bloque D — Comportamiento social (4 features)**
```
participo_en_grupo, rol_en_grupo, votos_emitidos, dias_activo_temporada
```

**Bloque E — Demográfico (5 features)**
```
edad, genero, ciudad, nivel_educacion, ocupacion
```

**Bloque F — Digital (5 features)**
```
usa_app_movil, sesiones_app_semana, notificaciones_activadas,
compras_online_pct, dispositivo_preferido
```

**Features derivadas (9 features)** — calculadas automáticamente
```
engagement_score        = predicciones × 30% + cromos × 25% + días × 25% + objetivos × 20%
valor_cliente_score     = log(gasto) × log(antigüedad) × num_productos
mailes_por_mes          = mailes_acumulados / antigüedad_meses
perfil_digital          = uso_app × 3 + notificaciones × 2 + compras_online × 5 + sesiones × 5
ratio_gasto_dominante   = max(pct_gasto_*)
es_perfil_premium       = tier ∈ [Oro, Diamante] AND score ∈ [AAA, AA] AND gasto > $800
perfil_dominante        = inferido de liga_tier y distribución de gasto
categoria_gasto_dominante / secundaria
```

---

## Modelo 2 — Motor de reglas

Una vez que el Modelo 1 asigna la categoría, el motor de reglas selecciona el **premio específico** dentro de esa categoría.

Cada premio tiene entre 3 y 4 reglas con puntajes. El premio con mayor score gana.

### Ejemplo: categoría `gastronomia`

```python
# cena_restaurante_premium_quito
si ciudad en ['Quito', 'Ibarra', 'Ambato']  → +40 puntos
si pct_gasto_restaurantes > 0.15            → +30 puntos
si edad entre 25 y 50                       → +20 puntos
si liga_tier en ['Plata', 'Oro']            → +10 puntos
# Máximo posible: 100 puntos

# cena_restaurante_premium_guayaquil
si ciudad en ['Guayaquil', 'Manta']         → +40 puntos
si pct_gasto_restaurantes > 0.15            → +30 puntos
...
```

El ganador es el de mayor puntaje. Los 2 siguientes se muestran como "alternativas".

---

## API del modelo

El modelo se expone como una API HTTP con FastAPI.

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Verifica que el servidor y modelos están activos |
| GET | `/categorias` | Lista las 9 categorías con sus premios |
| POST | `/segmentar` | Recibe perfil → devuelve premio personalizado |
| POST | `/segmentar/batch` | Procesa hasta 50 usuarios a la vez |

### Request — POST /segmentar
```json
{
  "liga_tier": "Plata",
  "gasto_mensual_usd": 450,
  "pct_gasto_tecnologia": 0.35,
  "ciudad": "Quito",
  "edad": 28,
  ...
}
```

### Response
```json
{
  "categoria": "tecnologia",
  "confianza_pct": 72.4,
  "premio_id": "smartphone_flagship",
  "premio_nombre": "📱 Smartphone Flagship",
  "afinidad_pct": 100,
  "razones": [
    "Alto gasto en tech (+35)",
    "Perfil joven (+25)",
    "Comprador digital (+20)",
    "Tier alto (+20)"
  ],
  "alternativas": [
    { "premio": "laptop", "nombre": "💻 Laptop", "afinidad": 85 },
    { "premio": "smartwatch", "nombre": "⌚ Smartwatch", "afinidad": 75 }
  ],
  "top3_categorias": [
    ["tecnologia", 72.4],
    ["educacion_desarrollo", 15.1],
    ["premium_financiero", 8.3]
  ]
}
```

---

## Integración con la app

La pantalla `premios.tsx` orquesta todo el proceso:

```
1. supabase.from('users').select(*)         → datos reales del usuario
2. supabase.from('group_members').select()  → medalla y estrellas
3. Construye payload (35 campos)
4. fetch('POST', /segmentar, payload)       → llama al modelo
5. Renderiza resultado en pantalla
```

La tabla `users` en Supabase fue diseñada para contener **todos los campos** que necesita el modelo, lo que permite hacer la consulta en un solo SELECT sin necesidad de joins complejos.

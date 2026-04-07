# AI Bank Gamificación — API Frontend Guide

> **Audience:** React Native frontend developers  
> **Base URL:** `http://localhost:3000/api/v1`  
> **Health Check:** `GET http://localhost:3000/health`  
> **Version:** 1.0 — Reviewed against real implementation (2026-04-06)

---

## Table of Contents

1. [Standard Response Format](#1-standard-response-format)
2. [Business Rules Reference](#2-business-rules-reference)
3. [Epic 1 — Identity & Profile](#3-epic-1--identity--profile)
   - [POST /personas — Register user](#31-post-personas--register-user)
   - [GET /personas/:id — Get person by ID](#32-get-personasid--get-person-by-id)
   - [PATCH /personas/:id — Update demographic data](#33-patch-personasid--update-demographic-data)
   - [GET /perfil/:id — Get gamified profile by profile ID](#34-get-perfilid--get-gamified-profile-by-profile-id)
   - [GET /perfil/persona/:id_persona — Get profile by person ID](#35-get-perfilpersonaid_persona--get-profile-by-person-id)
4. [Epic 2 — Economy (Consumption & Rewards)](#4-epic-2--economy-consumption--rewards)
   - [POST /consumo — Register consumption](#41-post-consumo--register-consumption)
   - [GET /consumo/persona/:id_persona — Consumption history](#42-get-consumopersonaid_persona--consumption-history)
5. [Epic 3 — Leagues & Seasons](#5-epic-3--leagues--seasons)
   - [GET /ligas — List all leagues](#51-get-ligas--list-all-leagues)
   - [GET /ligas/:id/ranking — League ranking](#52-get-ligasidranking--league-ranking)
   - [GET /ligas/ranking/global — Global ranking](#53-get-ligasrankingglobal--global-ranking)
   - [GET /temporadas — List seasons](#54-get-temporadas--list-seasons)
   - [GET /temporadas/activa — Get active season](#55-get-temporadasactiva--get-active-season)
   - [POST /temporadas — Create season (Admin)](#56-post-temporadas--create-season-admin)
   - [POST /temporadas/:id/cerrar — Close season (Admin)](#57-post-temporadasidcerrar--close-season-admin)
6. [Epic 4 — Matches & Predictions](#6-epic-4--matches--predictions)
   - [GET /partidos — List matches](#61-get-partidos--list-matches)
   - [POST /partidos — Create match (Admin)](#62-post-partidos--create-match-admin)
   - [GET /partidos/:id — Get match by ID](#63-get-partidosid--get-match-by-id)
   - [PUT /partidos/:id/resultado — Set match result (Admin)](#64-put-partidosidresultado--set-match-result-admin)
   - [POST /pronosticos — Register prediction](#65-post-pronosticos--register-prediction)
   - [GET /pronosticos/perfil/:id_perfil — List predictions by profile](#66-get-pronosticosperfilid_perfil--list-predictions-by-profile)
   - [GET /pronosticos/:id — Get prediction by ID](#67-get-pronosticosid--get-prediction-by-id)
7. [Epic 5 — Collectible Cards (Cromos)](#7-epic-5--collectible-cards-cromos)
   - [GET /cromos — Global card catalog](#71-get-cromos--global-card-catalog)
   - [GET /cromos/perfil/:id_perfil — User card collection](#72-get-cromosperfilid_perfil--user-card-collection)
8. [Epic 6 — Prizes & Rewards](#8-epic-6--prizes--rewards)
   - [GET /premios — Personalized prize catalog (ML)](#81-get-premios--personalized-prize-catalog-ml)
   - [POST /premios/canjear — Redeem prize](#82-post-premioscanjear--redeem-prize)
9. [Epic 7 — Transfers & Groups](#9-epic-7--transfers--groups)
   - [POST /transferencias — Register bank transfer](#91-post-transferencias--register-bank-transfer)
   - [GET /transferencias/persona/:id_persona — Transfer history](#92-get-transferenciaspersonaid_persona--transfer-history)
   - [POST /grupos — Create group](#93-post-grupos--create-group)
   - [GET /grupos/:id — Get group with member ranking](#94-get-gruposid--get-group-with-member-ranking)
   - [POST /grupos/:id/miembros — Join group](#95-post-gruposidmiembros--join-group)
10. [Discrepancies Between Swagger and Implementation](#10-discrepancies-between-swagger-and-implementation)
11. [Known Gaps, Design Issues & Recommendations](#11-known-gaps-design-issues--recommendations)

---

## 1. Standard Response Format

Every endpoint wraps its response in a common envelope. Learn this pattern once and it applies everywhere.

### Success (single object or array)

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

### Success (paginated list)

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 87,
    "total_pages": 9
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

### Error

```json
{
  "success": false,
  "error": "Bad Request",
  "message": "El monto debe ser mayor a 0.",
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

**Error label mapping:**

| HTTP Status | `error` field |
|-------------|--------------|
| 400 | `Bad Request` |
| 401 | `Unauthorized` |
| 402 | `Payment Required` |
| 403 | `Forbidden` |
| 404 | `Not Found` |
| 409 | `Conflict` |
| 422 | `Unprocessable Entity` |
| 500 | `Internal Server Error` |

### Pagination defaults

| Parameter | Default | Max |
|-----------|---------|-----|
| `page` | 1 | — |
| `limit` | 10 | 100 |

> **Note:** The swagger documents `limit` default as 20, but the actual implementation defaults to **10** in most use cases. Always send explicit `page` and `limit` in your requests.

---

## 2. Business Rules Reference

These rules drive all reward calculations across the system.

| Rule | Formula | Notes |
|------|---------|-------|
| Miles per consumption | `floor(monto) * 8` | 8 miles per $1 USD |
| Points per consumption | `floor(monto) * 10` | 10 points per $1 USD |
| Cards per consumption | `floor(monto / 10)` | 1 card per $10 USD |
| Card rarity | Comun 75% / Raro 20% / Epico 5% | Random per card |
| Miles per transfer | `floor(monto) * 8` | Only for the sender |
| Prediction bonus | +500 points | Only for exact score + winner match |
| Miles to USD | `miles * 0.01` | 1 mile = $0.01 USD |

**League thresholds (points-based):**

| League | Minimum Points | Maximum Points |
|--------|---------------|---------------|
| Bronce | 0 | 4,999 |
| Plata | 5,000 | 14,999 |
| Oro | 15,000 | 29,999 |
| Diamante | 30,000 | ∞ |

**Key facts:**
- Miles **never expire** and **never reset** between seasons.
- Points **reset to 0** when a season is closed.
- Miles are the **only currency** for prize redemption (points cannot be used).
- The league is recalculated in real time on every points change.

---

## 3. Epic 1 — Identity & Profile

---

### 3.1 POST /personas — Register user

**US-01** | Creates a person record and automatically creates the associated gamified profile in Liga Bronce.

```
POST http://localhost:3000/api/v1/personas
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `nombre` | string | YES | non-empty | Full name |
| `mail` | string | YES | valid email | Must be unique |
| `celular` | string | YES | non-empty | |
| `numero_cuenta` | string | YES | non-empty | Must be unique |
| `username` | string | NO | 3–50 chars, `[a-zA-Z0-9_]` only | Auto-generated as `user_{id}` if omitted |
| `nacimiento` | string (date) | NO | ISO date `YYYY-MM-DD` | |
| `nacionalidad` | string | NO | | |
| `residencia` | string | NO | | |
| `ciudad` | string | NO | | |
| `empresa` | string | NO | | |
| `cargo` | string | NO | | |
| `edad` | integer | NO | 0–120 | |
| `genero` | string | NO | `M`, `F`, `otro` | |
| `nivel_educacion` | string | NO | `primaria`, `secundaria`, `universitario`, `posgrado`, `ninguno` | |
| `ocupacion` | string | NO | | |
| `num_productos_bancarios` | integer | NO | >= 0, default 0 | |
| `score_crediticio` | number | NO | 0–1000 | |
| `tiene_credito_activo` | boolean | NO | default false | |
| `tiene_cuenta_ahorro` | boolean | NO | default false | |
| `meses_sin_mora` | integer | NO | >= 0, default 0 | |
| `usa_app_movil` | boolean | NO | default false | |
| `notificaciones_activadas` | boolean | NO | default false | |
| `dispositivo_preferido` | string | NO | `Android`, `iOS`, `Web` | |
| `sesiones_app_semana` | integer | NO | >= 0 | |

**Minimum request example:**

```json
{
  "nombre": "María García",
  "mail": "maria@example.com",
  "celular": "0991234567",
  "numero_cuenta": "ECU-001-2025",
  "username": "maria_garcia"
}
```

**Full request example:**

```json
{
  "nombre": "María García",
  "mail": "maria@example.com",
  "celular": "0991234567",
  "numero_cuenta": "ECU-001-2025",
  "nacimiento": "1997-03-15",
  "nacionalidad": "Ecuatoriana",
  "residencia": "Quito",
  "ciudad": "Quito",
  "edad": 29,
  "genero": "F",
  "nivel_educacion": "universitario",
  "ocupacion": "empleado_privado",
  "usa_app_movil": true,
  "dispositivo_preferido": "Android",
  "username": "maria_garcia"
}
```

#### Response — 201 Created

```json
{
  "success": true,
  "data": {
    "persona": {
      "id_persona": 1,
      "nombre": "María García",
      "mail": "maria@example.com",
      "celular": "0991234567",
      "numero_cuenta": "ECU-001-2025",
      "nacimiento": "1997-03-15",
      "nacionalidad": "Ecuatoriana",
      "residencia": "Quito",
      "ciudad": "Quito",
      "edad": 29,
      "genero": "F",
      "nivel_educacion": "universitario",
      "ocupacion": "empleado_privado",
      "usa_app_movil": true,
      "dispositivo_preferido": "Android",
      "fecha_creacion": "2026-04-06",
      "updated_at": "2026-04-06T14:30:00.000Z"
    },
    "perfil": {
      "id_perfil": 1,
      "id_persona": 1,
      "username": "maria_garcia",
      "millas": 0,
      "puntos": 0,
      "id_liga": 1,
      "fecha_inicio": "2026-04-06",
      "liga": {
        "id_liga": 1,
        "nombre": "Bronce",
        "rango_inicio": 0,
        "rango_fin": 4999
      }
    }
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Error Responses

| Status | Scenario | Example message |
|--------|---------|----------------|
| 400 | Missing required field or invalid email | `"mail debe ser un email válido"` |
| 409 | Mail already registered | `"El mail 'maria@example.com' ya está registrado."` |
| 409 | Account number already registered | `"El número de cuenta 'ECU-001-2025' ya está registrado."` |
| 409 | Username already taken | `"El username 'maria_garcia' ya está registrado."` |
| 500 | Liga Bronce not seeded in DB | `"Liga Bronce no encontrada en la base de datos."` |

```json
{
  "success": false,
  "error": "Conflict",
  "message": "El mail 'maria@example.com' ya está registrado.",
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Frontend Usage Notes

- Call this during the onboarding flow. Store `id_persona` and `id_perfil` from the response in your app state.
- If `username` is omitted, the server auto-generates `user_{id_persona}`. Let the user choose a username on the registration screen.
- After creation, immediately redirect to profile view using the returned `id_perfil`.

---

### 3.2 GET /personas/:id — Get person by ID

```
GET http://localhost:3000/api/v1/personas/1
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 | YES |

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id_persona": 1,
    "nombre": "María García",
    "mail": "maria@example.com",
    "celular": "0991234567",
    "numero_cuenta": "ECU-001-2025",
    "nacimiento": "1997-03-15",
    "nacionalidad": "Ecuatoriana",
    "residencia": "Quito",
    "ciudad": "Quito",
    "empresa": null,
    "cargo": null,
    "edad": 29,
    "genero": "F",
    "nivel_educacion": "universitario",
    "ocupacion": "empleado_privado",
    "num_productos_bancarios": 0,
    "score_crediticio": null,
    "tiene_credito_activo": false,
    "tiene_cuenta_ahorro": false,
    "meses_sin_mora": 0,
    "usa_app_movil": true,
    "notificaciones_activadas": false,
    "sesiones_app_semana": 0,
    "compras_online_pct": null,
    "dispositivo_preferido": "Android",
    "mailes_acumuladas": 0,
    "medalla_final": null,
    "estrellas_finales": 0,
    "predicciones_correctas_pct": null,
    "racha_maxima_predicciones": 0,
    "cromos_coleccionados": 0,
    "cromos_epicos_obtenidos": 0,
    "participo_en_grupo": false,
    "rol_en_grupo": null,
    "dias_activo_temporada": 0,
    "fecha_creacion": "2026-04-06",
    "updated_at": "2026-04-06T14:30:00.000Z"
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Error Responses

| Status | Scenario |
|--------|---------|
| 400 | `id` is not a positive integer |
| 404 | Person not found |

#### Frontend Usage Notes

- Use to display personal/bank information on the user's account screen.
- This returns raw `persona` data without gamification info. For gamification (miles, points, league), use `GET /perfil/persona/:id_persona`.

---

### 3.3 PATCH /personas/:id — Update demographic data

Updates only demographic fields. Cannot change miles, points, league, mail, or account number.

```
PATCH http://localhost:3000/api/v1/personas/1
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 | YES |

#### Request Body

Only include the fields you want to update. All fields are optional.

| Updateable Field | Type | Notes |
|-----------------|------|-------|
| `nombre` | string | |
| `nacimiento` | string (date) | `YYYY-MM-DD` |
| `nacionalidad` | string | |
| `residencia` | string | |
| `celular` | string | |
| `empresa` | string | |
| `cargo` | string | |
| `ciudad` | string | |
| `nivel_educacion` | string | enum values |
| `ocupacion` | string | |
| `usa_app_movil` | boolean | |
| `notificaciones_activadas` | boolean | |
| `sesiones_app_semana` | integer | |
| `dispositivo_preferido` | string | `Android`, `iOS`, `Web` |

**NOT updateable via this endpoint:** `mail`, `numero_cuenta`, `millas`, `puntos`, `id_liga`

**Example request:**

```json
{
  "ciudad": "Guayaquil",
  "notificaciones_activadas": true,
  "dispositivo_preferido": "iOS"
}
```

#### Response — 200 OK

Returns the full updated `persona` object (same shape as GET /personas/:id).

```json
{
  "success": true,
  "data": {
    "id_persona": 1,
    "nombre": "María García",
    "ciudad": "Guayaquil",
    "notificaciones_activadas": true,
    "dispositivo_preferido": "iOS",
    "updated_at": "2026-04-06T15:00:00.000Z"
  },
  "timestamp": "2026-04-06T15:00:00.000Z"
}
```

#### Error Responses

| Status | Scenario |
|--------|---------|
| 400 | Invalid `id` |
| 404 | Person not found |

#### Frontend Usage Notes

- Use on the profile edit screen. Only send fields the user actually modified.
- Sending unknown fields is safe — they are silently ignored by the allowlist in the repository.

---

### 3.4 GET /perfil/:id — Get gamified profile by profile ID

Returns the full gamified profile including miles, points, current league, and joined persona data.

```
GET http://localhost:3000/api/v1/perfil/1
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 (profile ID) | YES |

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id_perfil": 1,
    "id_persona": 1,
    "username": "maria_garcia",
    "millas": 2840,
    "puntos": 5200,
    "id_liga": 2,
    "fecha_inicio": "2026-04-06",
    "updated_at": "2026-04-06T14:30:00.000Z",
    "liga_nombre": "Plata",
    "rango_inicio": 5000,
    "rango_fin": 14999
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Important:** The `data` object is the raw DB row from a JOIN between `perfil` and `liga`. Fields `liga_nombre`, `rango_inicio`, `rango_fin` are from the liga join. There is no nested `liga` object or `millas_usd_equivalente` computed field — calculate it in the frontend: `millas * 0.01`.

#### Error Responses

| Status | Scenario |
|--------|---------|
| 400 | Invalid `id` |
| 404 | Profile not found |

#### Frontend Usage Notes

- Use this when you already know the `id_perfil` (stored in app state after login/registration).
- For the equivalent USD value display: `(data.millas * 0.01).toFixed(2)`.
- Check `data.liga_nombre` to show the user's badge (Bronce / Plata / Oro / Diamante).

---

### 3.5 GET /perfil/persona/:id_persona — Get profile by person ID

Identical response shape to `GET /perfil/:id` but looked up by the person's ID instead of the profile ID.

```
GET http://localhost:3000/api/v1/perfil/persona/1
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id_persona` | integer >= 1 | YES |

#### Response — 200 OK

Same shape as `GET /perfil/:id`.

#### Error Responses

| Status | Scenario |
|--------|---------|
| 400 | Invalid `id_persona` |
| 404 | Profile not found for this person |

#### Frontend Usage Notes

- Use when you only have `id_persona` and need gamification data.
- Prefer this over `GET /perfil/:id` when coming from the persona lookup flow.

---

## 4. Epic 2 — Economy (Consumption & Rewards)

---

### 4.1 POST /consumo — Register consumption

**US-03** | Registers a bank transaction and atomically distributes miles, points, and cards (cromos) to the user.

```
POST http://localhost:3000/api/v1/consumo
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id_persona` | integer >= 1 | YES | The person making the purchase |
| `monto` | float > 0 | YES | Amount in USD |
| `descripcion` | string | NO | Transaction description |
| `id_producto_persona` | integer | NO | FK to `productopersona` table (bank card/product used) |
| `ubicacion` | string | NO | Transaction location |
| `diferido` | boolean | NO | Whether installment; default `false` |
| `id_tag` | integer | NO | Category tag FK for ML classification |

**Example request:**

```json
{
  "id_persona": 1,
  "monto": 150.00,
  "descripcion": "Compra en Amazon - Electrónicos",
  "id_producto_persona": 3,
  "ubicacion": "Online",
  "diferido": false,
  "id_tag": 1
}
```

#### Response — 201 Created

```json
{
  "success": true,
  "data": {
    "consumo": {
      "id_consumo": 42,
      "monto": 150,
      "descripcion": "Compra en Amazon - Electrónicos",
      "fecha": "2026-04-06T14:30:00.000Z"
    },
    "recompensas": {
      "millas_generadas": 1200,
      "puntos_generados": 1500,
      "cromos_generados": 15,
      "detalle_cromos": [
        { "rareza": "comun", "nombre": "Ecuador - Jugador #3", "id_cromos": 7 },
        { "rareza": "raro", "nombre": "Brasil - Jugador #10", "id_cromos": 34 },
        { "rareza": "epico", "nombre": "Argentina - Jugador #10", "id_cromos": 198 }
      ]
    },
    "perfil_actualizado": {
      "millas": 4040,
      "puntos": 6700,
      "liga_anterior": "Plata",
      "liga_actual": "Plata",
      "cambio_liga": false
    }
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

**Reward calculation for $150.00:**
- Miles: `floor(150) * 8 = 1200`
- Points: `floor(150) * 10 = 1500`
- Cards: `floor(150 / 10) = 15`

If points cross a league threshold (e.g., from 4,800 to 6,300 puntos), `cambio_liga` will be `true` and `liga_actual` will show the new league name. Show the user a congratulatory animation in this case.

**Note:** `detalle_cromos` may have fewer entries than `cromos_generados` if the DB has no cromos of that rarity seeded. Each cromo is assigned independently with the 75/20/5 probability.

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | `monto` is 0 or negative | `"El monto debe ser mayor a 0."` |
| 400 | Missing `id_persona` or `monto` | Validation error |
| 404 | Person not found | `"Persona con id 99 no encontrada."` |
| 404 | Profile not found for person | `"Perfil para persona 99 no encontrado."` |

#### Business Rules Applied

1. Rewards use `floor()` so $1.99 = $1 for calculation purposes.
2. If `id_tag` is provided, a row is inserted in `tagsconsumo` with `certeza=100`.
3. League is recalculated atomically. A `perfilesliga` history row is inserted only on league change.
4. A `logs_puntos` row is inserted with concept `"CONSUMO"`.
5. The entire operation is wrapped in a DB transaction; on error, everything rolls back.

#### Frontend Usage Notes

- Trigger this when the user makes a bank purchase (or when the backend receives the transaction webhook).
- Show a reward animation displaying miles, points, and cromos earned.
- If `cambio_liga === true`, show a league promotion screen.
- The `detalle_cromos` array lets you show each newly obtained card with its rarity badge.

---

### 4.2 GET /consumo/persona/:id_persona — Consumption history

**US-04** | Returns a paginated, filterable list of the user's transaction history.

```
GET http://localhost:3000/api/v1/consumo/persona/1?page=1&limit=10&fecha_inicio=2026-01-01&fecha_fin=2026-04-06
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id_persona` | integer >= 1 | YES |

#### Query Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `page` | integer >= 1 | 1 | |
| `limit` | integer 1–100 | 10 | |
| `fecha_inicio` | string (ISO date) | — | Filter from this date (inclusive) |
| `fecha_fin` | string (ISO date) | — | Filter to this date (inclusive) |

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_consumo": 42,
      "id_persona": 1,
      "monto": "150.00",
      "descripcion": "Compra en Amazon - Electrónicos",
      "fecha": "2026-04-06T14:30:00.000Z",
      "diferido": false,
      "ubicacion": "Online",
      "id_producto_persona": 3,
      "created_at": "2026-04-06T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "total_pages": 3
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** The raw consumo row from the DB does not include pre-calculated `millas_generadas`, `puntos_generados`, or `cromos_generados`. These were only returned at creation time. To display rewards per transaction you would need to calculate them in the frontend: `floor(monto) * 8`, `floor(monto) * 10`, `floor(monto / 10)`.

#### Error Responses

| Status | Scenario |
|--------|---------|
| 400 | Invalid path/query parameters |

#### Frontend Usage Notes

- Use for the transaction history screen.
- Show date range filters for the user to browse by period.
- Calculate and display reward equivalents client-side from `monto`.

---

## 5. Epic 3 — Leagues & Seasons

---

### 5.1 GET /ligas — List all leagues

Returns the four leagues with their point thresholds.

```
GET http://localhost:3000/api/v1/ligas
```

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    { "id_liga": 1, "nombre": "Bronce", "rango_inicio": 0, "rango_fin": 4999, "created_at": "..." },
    { "id_liga": 2, "nombre": "Plata", "rango_inicio": 5000, "rango_fin": 14999, "created_at": "..." },
    { "id_liga": 3, "nombre": "Oro", "rango_inicio": 15000, "rango_fin": 29999, "created_at": "..." },
    { "id_liga": 4, "nombre": "Diamante", "rango_inicio": 30000, "rango_fin": 999999, "created_at": "..." }
  ],
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Frontend Usage Notes

- Fetch once on app startup and cache. Used for displaying league icons/labels and building progress bars showing how many points the user needs to reach the next league.
- Example: if user has 6,000 points (Plata), next league (Oro) requires 15,000. Progress = `(6000 - 5000) / (15000 - 5000) = 10%`.

---

### 5.2 GET /ligas/:id/ranking — League ranking

**US-05** | Returns paginated list of profiles in a specific league, ordered by points descending.

```
GET http://localhost:3000/api/v1/ligas/2/ranking?page=1&limit=10
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 (liga ID) | YES |

#### Query Parameters

| Parameter | Default |
|-----------|---------|
| `page` | 1 |
| `limit` | 10 |

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_perfil": 3,
      "username": "carlos_2026",
      "puntos": 12500,
      "millas": "15000",
      "id_liga": 2,
      "id_persona": 3,
      "persona_nombre": "Carlos Rodríguez",
      "liga_nombre": "Plata",
      "rango_inicio": 5000,
      "rango_fin": 14999,
      "fecha_inicio": "2026-01-01",
      "updated_at": "2026-04-06T10:00:00.000Z"
    }
  ],
  "liga": {
    "id_liga": 2,
    "nombre": "Plata",
    "rango_inicio": 5000,
    "rango_fin": 14999,
    "created_at": "..."
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 48,
    "total_pages": 5
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** The response includes both `data` (ranking rows) and `liga` (league details) at the top level alongside `pagination`. The position within the ranking is determined by the array index + `(page - 1) * limit + 1`.

#### Error Responses

| Status | Scenario |
|--------|---------|
| 404 | League with given ID not found |

#### Frontend Usage Notes

- Use for the league leaderboard screen. Highlight the current user's row.
- To show the user their position: search for their `id_perfil` in the returned array or call with a large limit if the dataset is small.

---

### 5.3 GET /ligas/ranking/global — Global ranking

Returns all profiles across all leagues, ordered by points descending.

```
GET http://localhost:3000/api/v1/ligas/ranking/global?page=1&limit=10
```

#### Query Parameters

Same as league ranking.

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_perfil": 5,
      "username": "top_player",
      "puntos": 45000,
      "millas": "80000",
      "id_liga": 4,
      "persona_nombre": "Ana Torres",
      "liga_nombre": "Diamante"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1248,
    "total_pages": 125
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** There is no `liga` object in the global ranking response (unlike league-specific ranking).

#### Frontend Usage Notes

- Use on the global leaderboard tab. Allows users to see their overall standing regardless of league.

---

### 5.4 GET /temporadas — List seasons

```
GET http://localhost:3000/api/v1/temporadas
```

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_temporada": 1,
      "nombre": "Mundial 2026",
      "fecha_inicio": "2026-06-11",
      "fecha_fin": "2026-07-19",
      "estado": "activa",
      "created_at": "2026-04-01T00:00:00.000Z"
    },
    {
      "id_temporada": 2,
      "nombre": "Pre-Mundial 2026",
      "fecha_inicio": "2026-01-01",
      "fecha_fin": "2026-04-05",
      "estado": "cerrada",
      "created_at": "2025-12-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Important:** `estado` is a **computed field** (not stored in DB). It is calculated as: `fecha_fin >= CURRENT_DATE ? 'activa' : 'cerrada'`. After `POST /temporadas/:id/cerrar`, the `fecha_fin` is set to yesterday, so the season will show `'cerrada'`.

#### Frontend Usage Notes

- Use to show the season history list and let users browse past performance.

---

### 5.5 GET /temporadas/activa — Get active season

```
GET http://localhost:3000/api/v1/temporadas/activa
```

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id_temporada": 1,
    "nombre": "Mundial 2026",
    "fecha_inicio": "2026-06-11",
    "fecha_fin": "2026-07-19",
    "estado": "activa",
    "created_at": "2026-04-01T00:00:00.000Z"
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Response — 404 Not Found (no active season)

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Perfil para persona 0 no encontrado.",
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** When no active season exists, the use case throws a 404. Handle this gracefully on the frontend by showing an empty state.

#### Frontend Usage Notes

- Call on app startup to know the current tournament context.
- Store `id_temporada` to use when listing matches: `GET /partidos?id_temporada=1`.

---

### 5.6 POST /temporadas — Create season (Admin)

**US-06** | Creates a new tournament season. Only one active season can exist at a time.

```
POST http://localhost:3000/api/v1/temporadas
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `nombre` | string | YES | Season name |
| `fecha_inicio` | string (ISO date) | YES | `YYYY-MM-DD` |
| `fecha_fin` | string (ISO date) | YES | Must be after `fecha_inicio` |

**Example:**

```json
{
  "nombre": "Mundial 2026",
  "fecha_inicio": "2026-06-11",
  "fecha_fin": "2026-07-19"
}
```

#### Response — 201 Created

```json
{
  "success": true,
  "data": {
    "id_temporada": 1,
    "nombre": "Mundial 2026",
    "fecha_inicio": "2026-06-11",
    "fecha_fin": "2026-07-19",
    "estado": "activa",
    "created_at": "2026-04-06T14:30:00.000Z"
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | `fecha_fin` before `fecha_inicio` | `"fecha_fin debe ser posterior a fecha_inicio."` |
| 400 | Missing required fields | validation error |
| 409 | An active season already exists | `"Ya existe una temporada activa. Ciérrala antes de crear una nueva."` |

#### Frontend Usage Notes

- Admin-only screen. Close the current season first (`POST /temporadas/:id/cerrar`) before creating a new one.

---

### 5.7 POST /temporadas/:id/cerrar — Close season (Admin)

**US-07** | Atomically closes a season: saves all points snapshots, records final leagues, and resets all profiles' points to 0. Miles are never touched.

```
POST http://localhost:3000/api/v1/temporadas/1/cerrar
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 | YES |

#### Request Body

None required.

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "procesados": 1248,
    "temporada": {
      "id_temporada": 1,
      "nombre": "Mundial 2026",
      "fecha_inicio": "2026-06-11",
      "fecha_fin": "2026-04-05",
      "estado": "cerrada",
      "created_at": "2026-04-01T00:00:00.000Z"
    }
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** The swagger shows a `mensaje` and `perfiles_procesados` shape, but the actual implementation returns `procesados` (integer) and `temporada` wrapped in the standard `data` envelope.

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | Season already closed (fecha_fin < today) | `"La temporada ya está cerrada (fecha_fin es anterior a hoy)."` |
| 404 | Season not found | `"Temporada con id 99 no encontrada."` |

#### What happens internally

1. For every `perfil`: inserts a `logs_puntos` row with concept `"CIERRE_TEMPORADA"`.
2. For every `perfil`: inserts a `perfilesliga` row (historical league snapshot).
3. Sets `perfil.puntos = 0` for ALL profiles.
4. Sets `temporada.fecha_fin = CURRENT_DATE - 1 day` (this makes `estado` compute as `'cerrada'`).
5. All operations are in a single DB transaction.

#### Frontend Usage Notes

- Admin-only. Show a confirmation dialog before calling this — it is irreversible.
- After closing, inform users that points have reset for the new season. Miles remain unchanged.

---

## 6. Epic 4 — Matches & Predictions

---

### 6.1 GET /partidos — List matches

Returns a paginated list of matches. Supports filtering by season and by future-only.

```
GET http://localhost:3000/api/v1/partidos?id_temporada=1&solo_futuros=true&page=1&limit=20
```

#### Query Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `page` | integer >= 1 | 1 | |
| `limit` | integer 1–100 | 10 | |
| `id_temporada` | integer | — | Filter by season |
| `solo_futuros` | boolean | — | If `true`, returns only matches with future dates (eligible for prediction) |

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_partido": 5,
      "id_temporada": 1,
      "id_pais_local": 1,
      "id_pais_visitante": 2,
      "fecha": "2026-06-15T18:00:00.000Z",
      "goles_local": null,
      "goles_visitante": null,
      "ganador": null,
      "estado": "pendiente",
      "estadio": null,
      "pais_local_nombre": "Ecuador",
      "pais_local_bandera": null,
      "pais_visitante_nombre": "Brasil",
      "pais_visitante_bandera": null,
      "created_at": "2026-04-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 48,
    "total_pages": 5
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** The actual data shape differs from the swagger schema. Fields are flat (not nested `pais_local: { id_paises, nombre }`) — instead you get `pais_local_nombre`, `pais_local_bandera`, `pais_visitante_nombre`, `pais_visitante_bandera` as flat columns. The `partido` table also has `estado` (`pendiente` or `finalizado`) and `estadio` columns not documented in the swagger.

#### Frontend Usage Notes

- Use `solo_futuros=true` on the predictions screen to show only matches available for prediction.
- `goles_local`, `goles_visitante`, and `ganador` are `null` until the admin sets the result.
- `estado` can be `"pendiente"` or `"finalizado"`.

---

### 6.2 POST /partidos — Create match (Admin)

**US-08** | Creates a new match associated with a season.

```
POST http://localhost:3000/api/v1/partidos
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id_temporada` | integer >= 1 | YES | Must exist |
| `id_pais_local` | integer >= 1 | YES | Must differ from `id_pais_visitante` |
| `id_pais_visitante` | integer >= 1 | YES | |
| `fecha` | string (ISO 8601 datetime) | YES | e.g. `"2026-06-15T18:00:00Z"` |
| `estadio` | string | NO | Stadium name |

**Example:**

```json
{
  "id_temporada": 1,
  "id_pais_local": 1,
  "id_pais_visitante": 2,
  "fecha": "2026-06-15T18:00:00Z",
  "estadio": "Estadio Azteca"
}
```

#### Response — 201 Created

Returns the full match object with joined country names (same shape as GET /partidos item).

```json
{
  "success": true,
  "data": {
    "id_partido": 5,
    "id_temporada": 1,
    "id_pais_local": 1,
    "id_pais_visitante": 2,
    "fecha": "2026-06-15T18:00:00.000Z",
    "goles_local": null,
    "goles_visitante": null,
    "ganador": null,
    "estado": "pendiente",
    "estadio": "Estadio Azteca",
    "pais_local_nombre": "Ecuador",
    "pais_local_bandera": null,
    "pais_visitante_nombre": "Brasil",
    "pais_visitante_bandera": null,
    "created_at": "2026-04-06T14:30:00.000Z"
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | Same local and visiting country | `"Los paises local y visitante deben ser diferentes."` |
| 400 | Missing required fields | validation error |
| 404 | Season not found | `"Temporada con id 99 no encontrada."` |

> **Note:** The implementation does NOT validate that `id_pais_local` and `id_pais_visitante` exist in the `paises` table before inserting. A FK constraint error from the DB would surface as a 500. The swagger says 404 for unknown countries, but the code does not implement this check.

---

### 6.3 GET /partidos/:id — Get match by ID

```
GET http://localhost:3000/api/v1/partidos/5
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 | YES |

#### Response — 200 OK

Same shape as single item in `GET /partidos` list.

#### Error Responses

| Status | Scenario |
|--------|---------|
| 404 | Match not found |

---

### 6.4 PUT /partidos/:id/resultado — Set match result (Admin)

**US-09** | Sets the official match score and automatically evaluates all predictions, awarding +500 points to correct predictors.

```
PUT http://localhost:3000/api/v1/partidos/5/resultado
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 | YES |

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `goles_local` | integer >= 0 | YES | |
| `goles_visitante` | integer >= 0 | YES | |
| `ganador` | string | YES | Must be consistent with goals: `"local"` if local wins, `"visitante"` if visiting wins, `"empate"` if tied |

**Consistency rule for `ganador`:**
- `goles_local > goles_visitante` → `ganador` must be `"local"`
- `goles_visitante > goles_local` → `ganador` must be `"visitante"`
- `goles_local === goles_visitante` → `ganador` must be `"empate"`

**Example:**

```json
{
  "goles_local": 2,
  "goles_visitante": 1,
  "ganador": "local"
}
```

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "partido": {
      "id_partido": 5,
      "id_temporada": 1,
      "id_pais_local": 1,
      "id_pais_visitante": 2,
      "fecha": "2026-06-15T18:00:00.000Z",
      "goles_local": 2,
      "goles_visitante": 1,
      "ganador": "local",
      "estado": "finalizado"
    },
    "evaluacion": {
      "total_pronosticos": 320,
      "pronosticos_correctos": 47,
      "puntos_distribuidos": 23500
    }
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | `ganador` inconsistent with goals | `"El campo ganador debe ser 'empate' según el marcador."` |
| 404 | Match not found | `"Partido con id 99 no encontrado."` |
| 409 | Match already has a result | `"El partido ya tiene un resultado registrado."` |

#### What happens internally

For each prediction on this match:
- `pronosticos.es_correcto` is set to `true` or `false`.
- If correct: `perfil.puntos += 500`, `logs_puntos` inserted with `"PRONOSTICO_CORRECTO"`.
- League is recalculated for each correct predictor.
- All updates are in a single DB transaction.

#### Frontend Usage Notes

- Admin-only. After setting a result, notify users their predictions have been evaluated.
- `puntos_distribuidos = pronosticos_correctos * 500`.

---

### 6.5 POST /pronosticos — Register prediction

**US-10** | Registers a user's prediction for a future match. One prediction per user per match.

```
POST http://localhost:3000/api/v1/pronosticos
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id_perfil` | integer >= 1 | YES | The predictor's profile ID |
| `id_partido` | integer >= 1 | YES | Must be a future, pending match |
| `score_local` | integer >= 0 | YES | Predicted goals for home team |
| `score_visitante` | integer >= 0 | YES | Predicted goals for visiting team |
| `ganador` | string | YES | Must match scores: `"local"`, `"visitante"`, or `"empate"` |

**Example:**

```json
{
  "id_perfil": 1,
  "id_partido": 5,
  "score_local": 2,
  "score_visitante": 1,
  "ganador": "local"
}
```

#### Response — 201 Created

```json
{
  "success": true,
  "data": {
    "id_pronosticos": 88,
    "id_perfil": 1,
    "id_partido": 5,
    "score_local": 2,
    "score_visitante": 1,
    "ganador": "local",
    "fecha": "2026-04-06T14:30:00.000Z",
    "es_correcto": null,
    "mailes_ganados": "0"
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

`es_correcto` is `null` until `PUT /partidos/:id/resultado` is called.

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | `ganador` inconsistent with scores | `"El campo ganador debe ser 'empate' según el marcador pronosticado."` |
| 400 | Scores are negative | `"Los scores no pueden ser negativos."` |
| 404 | Profile not found | `"Perfil con id 99 no encontrado."` |
| 404 | Match not found | `"Partido con id 99 no encontrado."` |
| 409 | Match already finished | `"No se puede pronosticar un partido ya finalizado."` |
| 409 | Match date has passed | `"No se puede pronosticar un partido que ya comenzó."` |
| 409 | User already predicted this match | `"Ya existe un pronóstico de este perfil para este partido."` |

> **Note:** The swagger uses status 400 for past-match prediction, but the actual implementation throws 409.

#### Frontend Usage Notes

- Show matches with a "Predict" button only when `partido.fecha > now()` and `partido.estado === "pendiente"`.
- Validate the `ganador` field client-side before submitting to avoid unnecessary round trips.
- After submitting, show the prediction card with `es_correcto: null` (pending) state.

---

### 6.6 GET /pronosticos/perfil/:id_perfil — List predictions by profile

```
GET http://localhost:3000/api/v1/pronosticos/perfil/1?page=1&limit=10&id_temporada=1
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id_perfil` | integer >= 1 | YES |

#### Query Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `page` | integer >= 1 | 1 | |
| `limit` | integer 1–100 | 10 | |
| `id_temporada` | integer | — | Filter predictions by tournament season |

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_pronosticos": 88,
      "id_perfil": 1,
      "id_partido": 5,
      "score_local": 2,
      "score_visitante": 1,
      "ganador": "local",
      "fecha": "2026-04-06T14:30:00.000Z",
      "es_correcto": true,
      "mailes_ganados": "0",
      "partido_fecha": "2026-06-15T18:00:00.000Z",
      "partido_estado": "finalizado",
      "pais_local": "Ecuador",
      "pais_visitante": "Brasil"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 14,
    "total_pages": 2
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Frontend Usage Notes

- Use on the user's "My Predictions" screen.
- `es_correcto: null` = result pending, `true` = won 500 points, `false` = incorrect.

---

### 6.7 GET /pronosticos/:id — Get prediction by ID

```
GET http://localhost:3000/api/v1/pronosticos/88
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 | YES |

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id_pronosticos": 88,
    "id_perfil": 1,
    "id_partido": 5,
    "score_local": 2,
    "score_visitante": 1,
    "ganador": "local",
    "fecha": "2026-04-06T14:30:00.000Z",
    "es_correcto": null,
    "mailes_ganados": "0",
    "partido_fecha": "2026-06-15T18:00:00.000Z",
    "partido_estado": "pendiente"
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Error Responses

| Status | Scenario |
|--------|---------|
| 404 | Prediction not found |

---

## 7. Epic 5 — Collectible Cards (Cromos)

---

### 7.1 GET /cromos — Global card catalog

**US-12** | Returns all available cards in the system with optional filters.

```
GET http://localhost:3000/api/v1/cromos?frecuencia=epico&page=1&limit=20
```

#### Query Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `page` | integer >= 1 | 1 | |
| `limit` | integer 1–100 | 10 | |
| `frecuencia` | string | — | `comun`, `raro`, or `epico` |
| `id_pais` | integer | — | Filter by country |

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_cromos": 198,
      "nombre": "Argentina - Jugador #10",
      "frecuencia": "epico",
      "url_imagen": "https://cdn.aibank.com/cromos/arg-10.png",
      "imagen": null,
      "id_pais": 5,
      "pais_nombre": "Argentina",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "total_catalogo": 200,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "total_pages": 1
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** The response has an extra top-level `total_catalogo` field (total count of all cromos in the system, unfiltered). The `data` array items have both `url_imagen` and `imagen` fields from the DB; `url_imagen` is the primary field per schema, `imagen` appears to be an alias from the DB column.

#### Frontend Usage Notes

- Use to build a "Card Encyclopedia" screen showing all cards.
- Use `frecuencia` filter to switch between rarity tabs.
- Compare with the user's collection (`GET /cromos/perfil/:id_perfil`) to show which cards they're missing.

---

### 7.2 GET /cromos/perfil/:id_perfil — User card collection

**US-11** | Returns the user's collected cards with statistics about their album completion.

```
GET http://localhost:3000/api/v1/cromos/perfil/1?frecuencia=raro&page=1&limit=20
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id_perfil` | integer >= 1 | YES |

#### Query Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `page` | integer >= 1 | 1 | |
| `limit` | integer 1–100 | 10 | |
| `frecuencia` | string | — | `comun`, `raro`, or `epico` — filters the returned cards |

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_cromos_perfil": 12,
      "id_perfil": 1,
      "id_cromo": 34,
      "fecha": "2026-04-06T14:30:00.000Z",
      "cromo_nombre": "Brasil - Jugador #10",
      "frecuencia": "raro",
      "imagen": null,
      "pais_nombre": "Brasil",
      "created_at": "2026-04-06T14:30:00.000Z"
    }
  ],
  "perfil": {
    "id_perfil": 1,
    "username": "maria_garcia"
  },
  "stats": {
    "total_obtenidos": 87,
    "total_catalogo": 200,
    "porcentaje_completado": 43.5
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 17,
    "total_pages": 2
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** The actual response differs from the swagger schema. The top level has `data` (paginated cards), `perfil` (profile summary), `stats` (completion stats), and `pagination`. The swagger showed `estadisticas` with per-rarity counts; the real implementation only provides `total_obtenidos`, `total_catalogo`, and `porcentaje_completado`. Per-rarity counts are not available from this endpoint — you would need to call with `frecuencia` filters separately.

#### Error Responses

| Status | Scenario |
|--------|---------|
| 404 | Profile not found |

#### Frontend Usage Notes

- Use on the "My Album" screen.
- `stats.porcentaje_completado` drives the album progress bar.
- `total_obtenidos` counts all collected cards including duplicates; this is the raw count from `cromosperfil`.
- Use `frecuencia` filter to show tabs by rarity without re-fetching all cards.

---

## 8. Epic 6 — Prizes & Rewards

---

### 8.1 GET /premios — Personalized prize catalog (ML)

**US-13** | Returns available prizes personalized by the user's ML-derived affinity category and league. Falls back to full catalog if the ML service is unavailable.

```
GET http://localhost:3000/api/v1/premios?id_perfil=1
```

#### Query Parameters

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| `id_perfil` | integer >= 1 | NO | If provided, enables ML personalization and league filtering. If omitted, returns unfiltered catalog |

#### Special Response Header

| Header | Value | Meaning |
|--------|-------|---------|
| `X-ML-Fallback` | `"true"` | ML service was unavailable; catalog is unfiltered by category |

#### Response — 200 OK (with ML)

```json
{
  "success": true,
  "data": [
    {
      "id_premios": 3,
      "nombre": "Auriculares Bluetooth Premium",
      "id_liga": 2,
      "id_tag": 1,
      "id_perfil": null,
      "millas_costo": 15000,
      "otorgado_en": "2026-04-01T00:00:00.000Z",
      "created_at": "2026-04-01T00:00:00.000Z",
      "tag_descripcion": "tecnologia",
      "liga_nombre": "Plata"
    }
  ],
  "ml_categoria": "tecnologia",
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Response — 200 OK (ML fallback)

Same structure but `ml_categoria` will be `null` and the `X-ML-Fallback: true` header is set.

```json
{
  "success": true,
  "data": [ ... ],
  "ml_categoria": null,
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

Check the `X-ML-Fallback` response header:

```javascript
// React Native / Axios example
const response = await axios.get('/api/v1/premios?id_perfil=1');
const isFallback = response.headers['x-ml-fallback'] === 'true';
if (isFallback) {
  // Show a generic catalog notice
}
```

#### Error Responses

| Status | Scenario |
|--------|---------|
| 404 | Profile not found (when `id_perfil` provided) |

#### Important Notes on the `premios` Table

The `premios` table in the database has a **dual purpose**:
1. **Catalog entries** — prizes that can be redeemed (with `id_perfil = null`, `millas_costo > 0`).
2. **Canje records** — rows inserted when a user redeems a prize (with `id_perfil` set).

The `millas_costo` column must be added to the DB via:
```sql
ALTER TABLE public.premios ADD COLUMN millas_costo integer NOT NULL DEFAULT 0 CHECK (millas_costo >= 0);
```

When fetching the catalog, prizes are filtered by `id_liga` (user's current league) if `id_perfil` is provided. A user in Liga Bronce will only see prizes for Liga Bronce. Higher-league prizes are not shown.

#### Frontend Usage Notes

- Pass `id_perfil` always for a personalized experience.
- Cache `ml_categoria` to display to the user: "Recommendations based on your {ml_categoria} spending".
- Show each prize's `millas_costo` and calculate USD equivalent: `millas_costo * 0.01`.
- Compare `millas_costo` against the user's current `perfil.millas` to disable/grey-out prizes they cannot afford.

---

### 8.2 POST /premios/canjear — Redeem prize

**US-14** | Deducts miles from the user's profile and records the prize redemption. Miles only — points cannot be used.

```
POST http://localhost:3000/api/v1/premios/canjear
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id_perfil` | integer >= 1 | YES | |
| `id_premio` | integer >= 1 | YES | The prize ID from the catalog |

> **CRITICAL DISCREPANCY:** The swagger schema documents this field as `id_premios`. The actual route validation uses `id_premio` (no trailing 's'). The use case reads `data.id_premio`. **Send `id_premio`** (without the 's').

**Example:**

```json
{
  "id_perfil": 1,
  "id_premio": 3
}
```

#### Response — 200 OK

> **Note:** The swagger specifies status 201, but the actual implementation returns **200 OK**.

```json
{
  "success": true,
  "data": {
    "canje": {
      "id_premios": 99,
      "nombre": "Auriculares Bluetooth Premium",
      "id_liga": 2,
      "id_tag": 1,
      "id_perfil": 1,
      "millas_costo": 15000,
      "otorgado_en": "2026-04-06T14:30:00.000Z",
      "created_at": "2026-04-06T14:30:00.000Z"
    },
    "premio": {
      "id_premios": 3,
      "nombre": "Auriculares Bluetooth Premium",
      "millas_costo": 15000,
      "id_liga": 2,
      "id_tag": 1,
      "tag_descripcion": "tecnologia",
      "liga_nombre": "Plata"
    },
    "millas_utilizadas": 15000,
    "millas_restantes": 2840
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

The `canje` object is the new row inserted in `premios` (with `id_perfil` set). The `premio` object is the original catalog entry.

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | Missing fields | validation error |
| 402 | Insufficient miles | `"Millas insuficientes. Necesitas 15000 millas, tienes 2840."` |
| 404 | Profile not found | `"Perfil con id 99 no encontrado."` |
| 404 | Prize not found in catalog | `"Premio con id 99 no encontrado."` |

#### Business Rules

1. `perfil.millas >= premio.millas_costo` is required. Checked in application layer, not just DB constraint.
2. The deduction and the new prize row insertion are in a single DB transaction.
3. After redemption, `millas_restantes` is the user's new balance.

#### Frontend Usage Notes

- Show a confirmation dialog before redeeming.
- Display `millas_restantes` after successful redemption to update the user's displayed balance.
- If you get a 402, show an "Insufficient miles" message with how many more miles the user needs: `millas_costo - perfil.millas`.

---

## 9. Epic 7 — Transfers & Groups

---

### 9.1 POST /transferencias — Register bank transfer

**US-15** | Records a bank transfer and awards miles to the sender (not the recipient).

```
POST http://localhost:3000/api/v1/transferencias
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id_persona_emisora` | integer >= 1 | YES | Sender — cannot equal `id_persona_receptora` |
| `id_persona_receptora` | integer >= 1 | YES | Recipient |
| `monto` | float > 0 | YES | Transfer amount in USD |
| `descripcion` | string | NO | Transfer notes (accepted but stored where available) |

**Example:**

```json
{
  "id_persona_emisora": 1,
  "id_persona_receptora": 2,
  "monto": 200.00
}
```

#### Response — 201 Created

```json
{
  "success": true,
  "data": {
    "transferencia": {
      "id_transferencias": 15,
      "id_persona_emisora": 1,
      "id_persona_receptora": 2,
      "monto": "200.00",
      "mailes_generados": "0",
      "estado": "Pendiente",
      "fecha_transferencia": "2026-04-06T14:30:00.000Z",
      "created_at": "2026-04-06T14:30:00.000Z"
    },
    "millas_generadas_emisor": 1600,
    "emisor": {
      "id_persona": 1,
      "nombre": "María García"
    },
    "receptor": {
      "id_persona": 2,
      "nombre": "Carlos Rodríguez"
    }
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** The swagger shows `mailes_generados` inside `transferencia` as the calculated value. In practice, the `mailes_generados` column in the `transferencias` DB table defaults to `0` at insert time (the repository does not update it). The actual miles awarded to the sender's profile is returned as `millas_generadas_emisor` in the response. The `transferencia.mailes_generados` field may always show `"0"`.

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | `monto <= 0` | `"El monto debe ser mayor a 0."` |
| 400 | Same sender and receiver | `"El emisor y receptor no pueden ser la misma persona."` |
| 404 | Sender not found | `"Persona emisora con id 99 no encontrada."` |
| 404 | Receiver not found | `"Persona receptora con id 99 no encontrada."` |
| 404 | Sender has no profile | `"Perfil del emisor no encontrado."` |
| 404 | Receiver has no profile | `"Perfil del receptor no encontrado."` |

#### Business Rules

- Miles formula: `floor(monto) * 8` — same as consumption.
- Only the sender receives miles; the receiver gets nothing.
- Transfer initial state is always `"Pendiente"`.
- Both sender and receiver must exist AND have profiles.

#### Frontend Usage Notes

- Use on the transfer screen. Display the miles the sender will earn before confirming.
- After successful transfer, update the displayed miles balance using `millas_generadas_emisor`.

---

### 9.2 GET /transferencias/persona/:id_persona — Transfer history

```
GET http://localhost:3000/api/v1/transferencias/persona/1?page=1&limit=10
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id_persona` | integer >= 1 | YES |

#### Query Parameters

| Parameter | Default |
|-----------|---------|
| `page` | 1 |
| `limit` | 10 |

#### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id_transferencias": 15,
      "id_persona_emisora": 1,
      "id_persona_receptora": 2,
      "monto": "200.00",
      "mailes_generados": "0",
      "estado": "Pendiente",
      "fecha_transferencia": "2026-04-06T14:30:00.000Z",
      "created_at": "2026-04-06T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Frontend Usage Notes

- Shows both sent and received transfers for the person (the repository filters by `id_persona` as either sender or receiver — confirm this with backend if needed).

---

### 9.3 POST /grupos — Create group

**US-16** | Creates a new group. The creator automatically becomes an admin member.

```
POST http://localhost:3000/api/v1/grupos
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `nombre` | string | YES | Must be unique system-wide |
| `id_perfil_creador` | integer >= 1 | YES | Profile of the creator |
| `descripcion` | string | NO | Group description |

> **CRITICAL DISCREPANCY:** The swagger documents the field as `id_perfil`. The actual route validation requires `id_perfil_creador`. The use case reads `data.id_perfil_creador`. **Send `id_perfil_creador`**.

**Example:**

```json
{
  "nombre": "Los Campeones",
  "id_perfil_creador": 1,
  "descripcion": "El mejor grupo del torneo"
}
```

#### Response — 201 Created

```json
{
  "success": true,
  "data": {
    "id_grupo": 7,
    "nombre": "Los Campeones",
    "descripcion": "El mejor grupo del torneo",
    "id_perfil_creador": 1,
    "created_at": "2026-04-06T14:30:00.000Z"
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

> **Note:** The `grupo` table in the DB has `id_perfil_creador` as the FK column (not `id_perfil` as the swagger states). The repository also attempts to insert into `grupomiembro` to register the creator as admin, but degrades gracefully if that table doesn't exist.

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | Missing required fields | validation error |
| 404 | Creator profile not found | `"Perfil con id 99 no encontrado."` |
| 409 | Group name already taken | `"Ya existe un grupo con el nombre 'Los Campeones'."` |

---

### 9.4 GET /grupos/:id — Get group with member ranking

```
GET http://localhost:3000/api/v1/grupos/7
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 | YES |

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id_grupo": 7,
    "nombre": "Los Campeones",
    "id_perfil_creador": 1,
    "creador_username": "maria_garcia",
    "created_at": "2026-04-06T14:30:00.000Z",
    "ranking_miembros": [
      {
        "id_perfil": 1,
        "rol": "admin",
        "username": "maria_garcia",
        "puntos": 6700,
        "millas": "4040",
        "persona_nombre": "María García",
        "liga_nombre": "Plata"
      },
      {
        "id_perfil": 3,
        "rol": "miembro",
        "username": "carlos_2026",
        "puntos": 3200,
        "millas": "1800",
        "persona_nombre": "Carlos Rodríguez",
        "liga_nombre": "Bronce"
      }
    ]
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

`ranking_miembros` is ordered by `puntos DESC`. If the `grupomiembro` table does not exist in the DB, this array will be empty but the request won't fail.

#### Error Responses

| Status | Scenario |
|--------|---------|
| 404 | Group not found |

#### Frontend Usage Notes

- Use to display the group detail screen with internal leaderboard.
- The `ranking_miembros` depends on the `grupomiembro` table existing in the DB.

---

### 9.5 POST /grupos/:id/miembros — Join group

Adds a user's profile as a member of an existing group.

```
POST http://localhost:3000/api/v1/grupos/7/miembros
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | integer >= 1 (group ID) | YES |

#### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id_perfil` | integer >= 1 | YES | Profile joining the group |

**Example:**

```json
{
  "id_perfil": 3
}
```

#### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "grupo": {
      "id_grupo": 7,
      "nombre": "Los Campeones"
    },
    "miembro": {
      "id_perfil": 3,
      "username": "carlos_2026",
      "rol": "miembro"
    }
  },
  "timestamp": "2026-04-06T14:30:00.000Z"
}
```

#### Error Responses

| Status | Scenario | Message |
|--------|---------|---------|
| 400 | Missing `id_perfil` | `"id_perfil es requerido."` |
| 404 | Group not found | `"Grupo con id 99 no encontrado."` |
| 404 | Profile not found | `"Perfil con id 99 no encontrado."` |
| 409 | Already a member | `"El perfil ya es miembro de este grupo."` |

#### Frontend Usage Notes

- Use a "Join Group" button on the group discovery screen.
- After joining, redirect the user to `GET /grupos/:id` to see the updated ranking.

---

## 10. Discrepancies Between Swagger and Implementation

The following table documents every confirmed difference between the OpenAPI specification (`swagger.yaml`) and the real implementation.

| # | Location | Swagger Says | Implementation Does | Impact |
|---|---------|-------------|---------------------|--------|
| 1 | `POST /premios/canjear` — request body | Field name: `id_premios` | Field name: `id_premio` (no 's') | **Breaking** — frontend must send `id_premio` |
| 2 | `POST /premios/canjear` — status code | 201 Created | 200 OK | Minor — no functional impact |
| 3 | `POST /grupos` — request body | Field name: `id_perfil` | Field name: `id_perfil_creador` | **Breaking** — frontend must send `id_perfil_creador` |
| 4 | `POST /pronosticos` — error on past match | Status 400 | Status 409 | Minor — handle both |
| 5 | `POST /temporadas/:id/cerrar` — response shape | `{ mensaje, perfiles_procesados, temporada }` | `{ procesados, temporada }` wrapped in `data` | Minor — field names differ |
| 6 | `GET /perfil/:id` — response | Nested `liga` object + `millas_usd_equivalente` computed field | Flat row with `liga_nombre`, `rango_inicio`, `rango_fin` columns | Structural — compute equivalent client-side |
| 7 | `GET /partidos` — response | Nested `pais_local: { id_paises, nombre }` | Flat `pais_local_nombre`, `pais_local_bandera` fields | Structural |
| 8 | `GET /cromos/perfil/:id_perfil` — response | `{ estadisticas: { total_cromos, comunes, raros, epicos, ... } }` | `{ stats: { total_obtenidos, total_catalogo, porcentaje_completado } }` | Structural — no per-rarity breakdown in single call |
| 9 | `GET /premios` — response | `{ categoria_afinidad, liga_usuario, premios: [...] }` | `{ data: [...], ml_categoria, timestamp }` — wrapped in standard envelope | Structural |
| 10 | `GET /ligas/:id/ranking` — response | `{ liga, data, pagination }` — `data` at root | `{ success, data, liga, pagination, timestamp }` | Minor — `liga` is at root alongside `data` |
| 11 | `GET /partidos` — `es_futuro` field | Boolean `es_futuro` on each match | Not present — use `fecha > now()` client-side | Functional gap |
| 12 | `POST /partidos` — `id_pais_*` validation | Returns 404 if country doesn't exist | No country existence check; DB FK error → 500 | Risk of unhelpful error |
| 13 | `GET /consumo/persona/:id_persona` — limit default | Swagger: 20 | Implementation: 10 | Minor |
| 14 | `POST /transferencias` — `mailes_generados` | Stored in `transferencia.mailes_generados` | Always `0` in DB row; real value in `millas_generadas_emisor` | Data discrepancy |
| 15 | `username` on persona registration | Required field | Optional — auto-generated if missing | Relaxation (no impact on compliant clients) |

---

## 11. Known Gaps, Design Issues & Recommendations

### Gap 1: `premios.millas_costo` column missing from DB schema

**Issue:** The `premios` table does not have a `millas_costo` column per the documented `BASE.txt` schema. The `CanjearPremioUseCase` reads `premio.millas_costo` and the `PgPremioRepository` uses `COALESCE(pr.millas_costo, 0)`. If this column has not been added, `millas_costo` will always be 0 and all redemptions will succeed for free.

**Required migration:**
```sql
ALTER TABLE public.premios
  ADD COLUMN millas_costo integer NOT NULL DEFAULT 0 CHECK (millas_costo >= 0);
```

**Frontend note:** Confirm with backend that this migration has run before building the prize redemption flow.

---

### Gap 2: `grupo` table stores only the creator — no membership table

**Issue:** The `grupo` table only stores `id_perfil_creador`. The `grupomiembro` table is referenced in the code but may not exist in production. The `GET /grupos/:id` endpoint returns an empty `ranking_miembros` array silently if `grupomiembro` is missing.

**Required migration:**
```sql
CREATE TABLE public.grupomiembro (
  id_grupomiembro  serial PRIMARY KEY,
  id_grupo         integer NOT NULL REFERENCES public.grupo(id_grupo),
  id_perfil        integer NOT NULL REFERENCES public.perfil(id_perfil),
  rol              character varying NOT NULL DEFAULT 'miembro',
  fecha_ingreso    timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (id_grupo, id_perfil)
);
```

**Frontend note:** `POST /grupos/:id/miembros` and `GET /grupos/:id` ranking depend on this table. Show a graceful empty state if `ranking_miembros` is empty.

---

### Gap 3: No endpoint to list all groups

There is no `GET /grupos` endpoint to browse/search available groups. Users cannot discover groups without knowing the group ID. 

**Recommendation:** Add `GET /grupos?page=1&limit=20&search=campeones` for group discovery.

---

### Gap 4: `partido` table has `estado` and `estadio` columns not in swagger

The actual DB table (`partido`) has `estado` (`pendiente` | `finalizado`) and `estadio` (stadium name) columns that exist in the implementation but are not documented in the swagger schema. `CreatePartidoUseCase` and `PgPartidoRepository` both handle `estadio`.

**Frontend note:** You can send `estadio` when creating matches. Use `partido.estado === 'finalizado'` to check if a match is complete.

---

### Gap 5: No authentication / authorization

The entire API has no authentication layer (no JWT, no API key). All endpoints are publicly accessible. The swagger and user stories reference an "Admin" role for certain operations, but there is no middleware enforcing this.

**Recommendation:** Add JWT middleware before deploying to production, with role checks for admin-only endpoints (`POST /temporadas`, `POST /temporadas/:id/cerrar`, `POST /partidos`, `PUT /partidos/:id/resultado`).

---

### Gap 6: `pronosticos` — past-match check uses status 409 instead of 400

The swagger documents a 400 for attempting to predict a past match. The implementation throws 409. Frontend should handle both.

---

### Gap 7: Season "close" mutates `fecha_fin` instead of adding a `cerrada_at` or `estado` column

The `CerrarTemporadaUseCase` closes a season by setting `fecha_fin = CURRENT_DATE - 1 day`. This approach means the season's actual end date is permanently overwritten. The `estado` field is computed from `fecha_fin`, so it works, but historical reporting of the original end date is lost.

**Recommendation:** Add a `cerrada_at timestamp` column or a `estado` enum column to preserve the original `fecha_fin`.

---

### Gap 8: `consumo` historial does not return reward details per transaction

The `GET /consumo/persona/:id_persona` endpoint returns raw `consumo` rows without `millas_generadas`, `puntos_generados`, or `cromos_generados`. These were only computed and returned at creation time (`POST /consumo`). 

**Frontend workaround:** Calculate client-side: `floor(monto) * 8` for miles, `floor(monto) * 10` for points, `floor(monto / 10)` for cards.

---

### Gap 9: `mailes_generados` in `transferencias` table is always 0

The `CreateTransferenciaUseCase` updates `perfil.millas` directly but does not update `transferencias.mailes_generados`. The actual miles credited to the sender is available in the creation response as `millas_generadas_emisor`, but the stored DB value will always be `0`.

**Recommendation:** Update the repository to set `mailes_generados` at insert time.

---

### Gap 10: No `GET /personas` list endpoint

There is no endpoint to list all registered persons. Only individual lookup by `id` is supported.

---

### Recommended Frontend Integration Order

For a React Native developer starting from scratch, implement screens in this order:

1. **Registration** (`POST /personas`) → store `id_persona`, `id_perfil`
2. **Profile Home** (`GET /perfil/:id`) → display miles, points, league
3. **Consumption registration** (`POST /consumo`) → trigger from bank webhook
4. **Transaction history** (`GET /consumo/persona/:id`)
5. **Leagues screen** (`GET /ligas`, `GET /ligas/ranking/global`)
6. **Active season + matches** (`GET /temporadas/activa`, `GET /partidos`)
7. **Make prediction** (`POST /pronosticos`)
8. **My predictions** (`GET /pronosticos/perfil/:id`)
9. **Card collection** (`GET /cromos/perfil/:id`, `GET /cromos`)
10. **Prize catalog** (`GET /premios?id_perfil=1`)
11. **Prize redemption** (`POST /premios/canjear`)
12. **Transfer** (`POST /transferencias`)
13. **Groups** (`POST /grupos`, `GET /grupos/:id`, `POST /grupos/:id/miembros`)

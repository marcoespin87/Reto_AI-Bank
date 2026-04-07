# Arquitectura Técnica

## Diagrama general

```
┌──────────────────────────────────────────────────────────────┐
│                    USUARIO FINAL                             │
│              (iPhone / Android / Simulador)                  │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│              APLICACIÓN MÓVIL — React Native + Expo          │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Inicio  │ │  Banco   │ │ Mundial  │ │   Premios    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  Álbum   │ │  Grupo   │ │  Perfil  │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│                                                              │
│         lib/supabase.ts          lib/api.ts                  │
└───────────────┬──────────────────────┬───────────────────────┘
                │                      │
                ▼                      ▼
┌──────────────────────┐   ┌──────────────────────────────────┐
│  SUPABASE (nube)     │   │  FASTAPI (local / servidor)      │
│                      │   │                                  │
│  PostgreSQL          │   │  POST /segmentar                 │
│  Auth (JWT + Google) │   │  GET  /health                    │
│  Row Level Security  │   │  GET  /categorias                │
│                      │   │                                  │
│  18 tablas           │   │  build_input_df.py               │
│                      │   │  modelo_categoria_premio.pkl     │
│                      │   │  reglas_premios.py               │
└──────────────────────┘   └──────────────────────────────────┘
```

---

## Stack tecnológico

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React Native | 0.76 | Framework base de la app |
| Expo | 54.0 | Toolchain, build y APIs nativas |
| Expo Router | 6.0 | Navegación file-based |
| TypeScript | 5.9 | Tipado estático |
| NativeWind | 4.2 | Estilos con Tailwind CSS |
| Expo Reanimated | — | Animaciones (cromos, sobres) |
| AsyncStorage / SecureStore | — | Persistencia local de sesión |

### Backend / Base de datos

| Tecnología | Uso |
|---|---|
| Supabase | BaaS: base de datos + auth + API REST automática |
| PostgreSQL | Motor de base de datos relacional |
| Supabase Auth | Gestión de sesiones con JWT y OAuth2 (Google) |

### Modelo de IA

| Tecnología | Uso |
|---|---|
| Python 3.x | Lenguaje del modelo y API |
| FastAPI | Servidor HTTP que expone el modelo |
| scikit-learn | Pipeline de preprocesamiento |
| LightGBM / XGBoost | Clasificador de categoría de premio |
| pandas / numpy | Feature engineering |
| joblib | Serialización del modelo (.pkl) |

---

## Estructura de carpetas

```
Reto_AI-Bank/
│
├── projectAibank/              ← App móvil React Native
│   ├── app/
│   │   ├── _layout.tsx         ← Control de autenticación y navegación
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── (tabs)/
│   │       ├── index.tsx       ← Inicio (dashboard)
│   │       ├── banco.tsx       ← Transacciones bancarias
│   │       ├── album.tsx       ← Colección de cromos
│   │       ├── mundial.tsx     ← Predicciones de partidos
│   │       ├── grupo.tsx       ← Ligas grupales
│   │       ├── perfil.tsx      ← Perfil y configuración
│   │       └── premios.tsx     ← Premio personalizado por IA
│   ├── components/
│   │   └── SobreModal.tsx      ← Animación de apertura de sobres
│   └── lib/
│       ├── supabase.ts         ← Cliente de base de datos
│       └── api.ts              ← URL de la API del modelo
│
├── modelo_segmentacion/        ← Modelo ML en Python
│   ├── api.py                  ← Servidor FastAPI
│   ├── build_input_df.py       ← Feature engineering (49 features)
│   ├── reglas_premios.py       ← Motor de reglas para premios específicos
│   ├── modelo_categoria_premio.pkl   ← Modelo entrenado
│   └── label_encoder_categoria.pkl  ← Encoder de categorías
│
└── informe/                    ← Documentación del proyecto
```

---

## Flujo de datos principal

### Autenticación
```
Usuario ingresa credenciales
        ↓
supabase.auth.signIn()
        ↓
Supabase valida y devuelve JWT
        ↓
Token guardado en SecureStore (iOS) / localStorage (web)
        ↓
app/_layout.tsx detecta sesión → redirige a pantalla principal
```

### Transacción bancaria
```
Usuario ingresa monto
        ↓
Valida saldo en Supabase
        ↓
INSERT transactions (monto, categoria, mailes_generados)
UPDATE users (saldo - monto, mailes + ganados)
        ↓
Si monto ≥ $20 → INSERT user_stickers (cromos aleatorios)
        ↓
SobreModal muestra animación de revelación
```

### Premio personalizado
```
Pantalla premios carga
        ↓
SELECT users JOIN economic_tiers (perfil completo)
SELECT group_members (medalla y estrellas)
        ↓
Construye payload con 35+ campos
        ↓
POST http://localhost:8000/segmentar
        ↓
build_input_df.py → 49 features
modelo.predict() → categoría de premio
reglas_premios.py → premio específico (score 0-100)
        ↓
Respuesta JSON → renderiza tarjeta de premio
```

---

## Decisiones de arquitectura

| Decisión | Justificación |
|---|---|
| Supabase en lugar de backend propio | Reduce tiempo de desarrollo; provee auth, DB y API en uno |
| Expo Router (file-based) | Navegación declarativa, más mantenible |
| Modelo ML separado en FastAPI | Independencia: el modelo puede actualizarse sin tocar la app |
| Campos de perfil en tabla `users` | Simplicidad: un solo SELECT obtiene todo el perfil para el modelo |
| Tema oscuro navy + dorado | Identidad visual bancaria premium coherente con FIFA |

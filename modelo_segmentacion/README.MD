# 🏦 AI-Bank mAiles — Segmentación de Premios

Sistema de personalización de premios para ganadores de temporada.  
Combina un modelo de Machine Learning con un sistema de reglas de negocio,
expuesto como API HTTP para conectarse con cualquier frontend (React, etc.).

---

## 📁 Qué es cada archivo y para qué sirve

```
modelo/
│
├── 🧠 modelo_categoria_premio.pkl     El modelo entrenado. Contiene todo el
│                                      conocimiento aprendido de 30,000 usuarios.
│                                      Predice en cuál de las 9 categorías de
│                                      premio encaja el usuario.
│                                      → Lo genera el notebook de Colab.
│
├── 🏷️  label_encoder_categoria.pkl    Traduce la predicción numérica del modelo
│                                      (ej: 3) al nombre real de la categoría
│                                      (ej: "gastronomia").
│                                      → Lo genera el notebook de Colab.
│
├── 📋 modelo_metadata.json            Información del modelo: qué features usa,
│                                      cuántas clases tiene, métricas de evaluación.
│                                      No es obligatorio para predecir.
│                                      → Lo genera el notebook de Colab.
│
├── 🔧 build_input_df.py               Convierte el diccionario del usuario al
│                                      DataFrame con las 49 columnas exactas que
│                                      el modelo necesita. Incluye el cálculo de
│                                      todas las features derivadas.
│                                      → Se importa en api.py.
│
├── 📏 reglas_premios.py               El Modelo 2. Una vez que el modelo ML
│                                      decide la categoría, este archivo elige
│                                      el premio específico dentro de ella usando
│                                      reglas de negocio (scoring 0-100).
│                                      → Se importa en api.py.
│
├── 🌐 api.py                          El servidor FastAPI. Une todo: recibe el
│                                      perfil del usuario desde React, llama al
│                                      modelo, aplica las reglas, y devuelve el
│                                      resultado en JSON.
│                                      → Es el único archivo que se corre.
│
└── 📦 requirements.txt                Lista de librerías Python necesarias.
                                       Se instala una sola vez.
```

---

## 🔄 Cómo se conectan entre sí

```
App React
    │
    │  POST /segmentar
    │  { liga_tier, gasto_mensual, edad, ciudad... }
    ▼
api.py  ──────────────────────────────────────────────────┐
    │                                                      │
    │ importa                    importa                   │
    ▼                            ▼                         │
build_input_df.py          reglas_premios.py               │
    │                            │                         │
    │ Convierte JSON         Calcula score 0-100            │
    │ a DataFrame            por cada premio                │
    │ (49 columnas)          Elige el ganador               │
    ▼                            ▲                         │
modelo_categoria_premio.pkl      │                         │
    │                            │                         │
    │ Predice categoría ─────────┘                         │
    │ "gastronomia" (84%)                                  │
    ▼                                                      │
label_encoder_categoria.pkl                                │
    │                                                      │
    │ Convierte número → nombre de categoría               │
    └──────────────────────────────────────────────────────┘
    │
    │  { categoria, premio, razones, confianza }
    ▼
App React  →  muestra el resultado al usuario
```

---

## ⚙️ Paso 1 — Obtener los archivos del modelo

Antes de cualquier cosa necesitas los tres archivos que genera el notebook de Colab.

**En Colab**, al final del notebook ejecuta la celda de descarga:
```python
from google.colab import files
files.download('modelo_categoria_premio.pkl')
files.download('label_encoder_categoria.pkl')
files.download('modelo_metadata.json')
```

Coloca los tres archivos descargados **en esta misma carpeta** `modelo/`.

La estructura debe quedar así:
```
modelo/
├── api.py
├── build_input_df.py
├── reglas_premios.py
├── requirements.txt
├── modelo_categoria_premio.pkl     ← descargado de Colab ✓
├── label_encoder_categoria.pkl     ← descargado de Colab ✓
└── modelo_metadata.json            ← descargado de Colab ✓
```

---

## ⚙️ Paso 2 — Instalar dependencias Python

Abre una terminal en la carpeta `modelo/` y ejecuta:

```bash
# Crear entorno virtual (recomendado para no mezclar con otros proyectos)
python -m venv venv

# Activar el entorno virtual
source venv/bin/activate       # Mac / Linux
venv\Scripts\activate          # Windows

# Instalar todas las librerías necesarias
pip install -r requirements.txt
```

Esto instala FastAPI, scikit-learn, LightGBM, XGBoost, pandas, numpy y todo lo que el modelo necesita.

---

## ⚙️ Paso 3 — Correr el servidor

```bash
uvicorn api:app --reload --port 8000
```

Cuando el servidor esté listo verás esto en la terminal:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
✅ Modelos cargados correctamente
```

Si ves un error en este paso, casi siempre es porque los `.pkl` no están
en la misma carpeta que `api.py`.

---

## ⚙️ Paso 4 — Verificar que funciona

Abre el navegador y entra a:

```
http://localhost:8000/health
```

Debes ver:
```json
{
  "status": "ok",
  "modelo": "AIBank mAiles Segmentación v1.0",
  "n_clases": 9
}
```

También puedes probar el endpoint completo de forma interactiva en:
```
http://localhost:8000/docs
```
FastAPI genera automáticamente una interfaz donde puedes enviar requests
y ver las respuestas sin necesitar React ni Postman.

---

## ⚙️ Paso 5 — Conectar con React

El servidor ya está corriendo en `http://localhost:8000`.
Desde React haces un `fetch` POST con el perfil del usuario.

### Crear el servicio de conexión

Crea un archivo `src/services/segmentacion.js` en tu proyecto React:

```javascript
// src/services/segmentacion.js

const API_URL = "http://localhost:8000"

export async function segmentarUsuario(perfil) {
  const response = await fetch(`${API_URL}/segmentar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(perfil)
  })

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status}`)
  }

  return response.json()
}

export async function obtenerCategorias() {
  const response = await fetch(`${API_URL}/categorias`)
  return response.json()
}
```

### Usarlo en un componente React

```javascript
// src/components/PremioTemporada.jsx

import { useState } from "react"
import { segmentarUsuario } from "../services/segmentacion"

// Perfil de ejemplo — en la app real viene del usuario logueado
const PERFIL_MARIA = {
  liga_tier: "Plata",
  gasto_mensual_usd: 520,
  frecuencia_transacciones_mes: 18,
  antiguedad_cliente_meses: 24,
  num_productos_bancarios: 3,
  score_crediticio: "AA",
  tiene_credito_activo: 1,
  tiene_cuenta_ahorro: 1,
  meses_sin_mora: 24,
  pct_gasto_tecnologia: 0.08,
  pct_gasto_viajes: 0.05,
  pct_gasto_restaurantes: 0.22,
  pct_gasto_entretenimiento: 0.15,
  pct_gasto_supermercado: 0.28,
  pct_gasto_salud: 0.07,
  pct_gasto_educacion: 0.05,
  pct_gasto_hogar: 0.06,
  pct_gasto_otros: 0.04,
  medalla_final: 3,
  estrellas_finales: 3,
  mailes_acumulados: 2840,
  predicciones_correctas_pct: 0.58,
  racha_maxima_predicciones: 4,
  cromos_coleccionados: 87,
  cromos_epicos_obtenidos: 5,
  objetivos_completados: 6,
  participo_en_grupo: 1,
  rol_en_grupo: "miembro",
  votos_emitidos: 2,
  dias_activo_temporada: 95,
  edad: 29,
  genero: "F",
  ciudad: "Quito",
  nivel_educacion: "universitario",
  ocupacion: "empleado_privado",
  usa_app_movil: 1,
  sesiones_app_semana: 6,
  notificaciones_activadas: 1,
  compras_online_pct: 0.35,
  dispositivo_preferido: "Android"
}

export default function PremioTemporada() {
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando]   = useState(false)
  const [error, setError]         = useState(null)

  const handleSegmentar = async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await segmentarUsuario(PERFIL_MARIA)
      setResultado(data)
    } catch (e) {
      setError("No se pudo conectar con el modelo. ¿Está corriendo el servidor?")
    } finally {
      setCargando(false)
    }
  }

  return (
    <div>
      <button onClick={handleSegmentar} disabled={cargando}>
        {cargando ? "Analizando perfil..." : "Ver mi premio personalizado"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {resultado && (
        <div>
          <h2>{resultado.premio_nombre}</h2>
          <p>Categoría: {resultado.categoria} — {resultado.confianza_pct}% de confianza</p>
          <p>Afinidad con el premio: {resultado.afinidad_pct}/100</p>

          <h3>Por qué este premio:</h3>
          <ul>
            {resultado.razones.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <h3>Alternativas en la misma categoría:</h3>
          <ul>
            {resultado.alternativas.map((alt, i) => (
              <li key={i}>{alt.nombre} — {alt.afinidad}/100</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

---

## 📨 Qué devuelve el endpoint `/segmentar`

```json
{
  "categoria":     "gastronomia",
  "confianza_pct": 84.2,

  "premio_id":     "cena_restaurante_premium_quito",
  "premio_nombre": "🍽️ Cena Premium Quito",
  "afinidad_pct":  100,

  "razones": [
    "Ciudad Quito (+40)",
    "Alto gasto en restaurantes (+30)",
    "Rango etario 25-45 (+20)",
    "Tier Plata (+10)"
  ],

  "alternativas": [
    { "premio": "voucher_delivery_3meses", "nombre": "🛵 Voucher Delivery (3 meses)", "afinidad": 65 },
    { "premio": "experiencia_cata_vinos",  "nombre": "🍷 Cata de Vinos",              "afinidad": 30 }
  ],

  "probabilidades": {
    "gastronomia":                   84.2,
    "experiencias_entretenimiento":   8.1,
    "tecnologia":                     3.4,
    "salud_bienestar":                2.1,
    "viajes_nacionales":              1.0,
    "educacion_desarrollo":           0.6,
    "hogar_lifestyle":                0.3,
    "premium_financiero":             0.2,
    "viajes_internacionales":         0.1
  },

  "top3_categorias": [
    ["gastronomia", 84.2],
    ["experiencias_entretenimiento", 8.1],
    ["tecnologia", 3.4]
  ]
}
```

---

## 🗂️ Las 9 categorías de premio

| Categoría | Premios específicos |
|---|---|
| `tecnologia` | Smartphone, Laptop, Smartwatch, Streaming, Tablet |
| `viajes_nacionales` | Galápagos, Amazonía, Cuenca, Ruta del Sol, Vuelo interno |
| `viajes_internacionales` | LATAM, Cancún, Europa, Crucero Caribe |
| `gastronomia` | Cena Quito, Cena Guayaquil, Cata de vinos, Delivery |
| `experiencias_entretenimiento` | Conciertos, Liga Pro VIP, Rally Quito, Cine familiar |
| `salud_bienestar` | Gimnasio, Spa, Chequeo médico, App bienestar |
| `educacion_desarrollo` | Idiomas, Coursera, Diplomado, Emprendimiento |
| `hogar_lifestyle` | Electrodoméstico, Decoración, Ferretería, Robot aspirador |
| `premium_financiero` | Fondos mutuos, Seguro de vida, Tarjeta Black, Cashback |

---

## ❗ Problemas comunes

**`FileNotFoundError: modelo_categoria_premio.pkl`**
Los archivos `.pkl` no están en la carpeta. Descárgalos del notebook de Colab y ponlos junto a `api.py`.

**`Connection refused` desde React**
El servidor no está corriendo. Abre una terminal y ejecuta `uvicorn api:app --reload --port 8000`.

**`CORS error` en el navegador**
Ya está configurado en `api.py` — no deberías ver este error. Si aparece, verifica que el fetch va a `http://localhost:8000` exactamente.

**`422 Unprocessable Entity`**
Algún campo del JSON tiene el tipo incorrecto. Los campos `tiene_credito_activo`, `participo_en_grupo`, `usa_app_movil` deben ser `1` o `0` (número entero), no `true`/`false` (booleano).

---

## 🚀 Resumen rápido de comandos

```bash
# Instalar (solo la primera vez)
pip install -r requirements.txt

# Correr el servidor
uvicorn api:app --reload --port 8000

# Verificar que funciona
curl http://localhost:8000/health

# Documentación interactiva (en el navegador)
# http://localhost:8000/docs
```
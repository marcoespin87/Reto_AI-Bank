# Agent — Microservicio de Análisis Deportivo · Mundial 2026

Backend autónomo que expone un pipeline de **Deep Agents** como API REST. Recibe preguntas sobre partidos del Mundial 2026, busca datos reales en fuentes deportivas y devuelve un análisis balanceado en Markdown, listo para renderizar en cualquier frontend.

---

## Tabla de contenidos

1. [¿Qué hace este microservicio?](#1-qué-hace-este-microservicio)
2. [Arquitectura y cómo funciona](#2-arquitectura-y-cómo-funciona)
3. [Diagrama de flujo](#3-diagrama-de-flujo)
4. [Estructura de directorios](#4-estructura-de-directorios)
5. [Descripción de cada archivo](#5-descripción-de-cada-archivo)
6. [API Reference](#6-api-reference)
7. [Configuración de entorno](#7-configuración-de-entorno)
8. [Instalación y ejecución](#8-instalación-y-ejecución)
9. [Consumir desde un frontend](#9-consumir-desde-un-frontend)
10. [Decisiones de diseño](#10-decisiones-de-diseño)
11. [Limitaciones conocidas](#11-limitaciones-conocidas)

---

## 1. ¿Qué hace este microservicio?

El usuario hace una pregunta como:

> _"¿Quién llega mejor al partido, Ecuador o Costa de Marfil?"_

El sistema responde con un análisis como este:

> **Ecuador vs Costa de Marfil** — aquí van los datos para que armes tu propio panorama.
>
> **Datos clave:**
>
> - Ranking FIFA: Ecuador 44° vs Costa de Marfil 48°
> - H2H: 1 enfrentamiento histórico, empate 0-0
> - Forma reciente: Ecuador VVDEV, Costa de Marfil VVVEV
>
> **¿Por qué Ecuador podría ganar?** ...
>
> **¿Por qué Costa de Marfil podría ganar?** ...
>
> ¿Qué factor crees que pesará más: la forma reciente o el ranking FIFA?

**Lo que el sistema nunca hace:** dar una predicción de ganador. El propósito es empoderar al usuario con datos para que tome su propia decisión.

---

## 2. Arquitectura y cómo funciona

El sistema implementa un patrón **pipeline de agentes** con tres capas:

```
Cliente (HTTP)
     │
     ▼
┌─────────────────────────────────────────────────────┐
│                  FastAPI (api.py)                   │
│           POST /chat · GET /health                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Orquestador (main.py)                  │
│   Modelo: Gemini 2.5 Flash · Framework: DeepAgents  │
│   Gestiona el hilo de conversación con MemorySaver  │
└──────────┬──────────────────────────┬───────────────┘
           │ delega                   │ delega
           ▼                         ▼
┌──────────────────┐      ┌──────────────────────────┐
│ Agente Analista  │ ───► │     Agente Censor         │
│  (Nivel 1)       │ JSON │     (Nivel 2)             │
│  6 herramientas  │      │  Sin herramientas         │
│  Tavily Search   │      │  Genera Markdown final    │
└──────────────────┘      └──────────────────────────┘
        │
        ▼
  búsquedas web
  (FIFA, SofaScore,
   Transfermarkt, ESPN...)
```

### Los tres actores

| Actor               | Modelo           | Herramientas               | Salida                     |
| ------------------- | ---------------- | -------------------------- | -------------------------- |
| **Orquestador**     | Gemini 2.5 Flash | Ninguna (solo coordina)    | Respuesta final al cliente |
| **Agente Analista** | Gemini 2.5 Flash | 6 tools de búsqueda Tavily | JSON con estadísticas      |
| **Agente Censor**   | Gemini 2.5 Flash | Ninguna                    | Markdown balanceado        |

### ¿Por qué dos agentes en vez de uno?

- **Separación de responsabilidades:** el analista se especializa en buscar y sintetizar datos; el censor se especializa en presentarlos de forma neutral.
- **Control de calidad:** el censor actúa como barrera que garantiza que nunca se filtre una predicción directa al usuario, independientemente de lo que haya concluido el analista.
- **Extensibilidad:** se pueden agregar más agentes al pipeline sin tocar los existentes.

---

## 3. Diagrama de flujo

```
Usuario envía consulta
         │
         ▼
┌─────────────────────────┐
│  ¿Es sobre fútbol /     │
│  Mundial 2026?          │
└────────┬────────────────┘
         │ No              Sí
         ▼                 ▼
  Respuesta de       Orquestador delega
  rechazo amigable   al Agente Analista
                           │
                           ▼
                  ┌─────────────────────┐
                  │  Ejecuta las        │
                  │  herramientas web   │
                  │  en paralelo:       │
                  │  · H2H              │
                  │  · Ranking FIFA     │
                  │  · Forma reciente   │
                  │  · Historial Mundial│
                  │  · Métricas goles   │
                  │  · Valor plantilla  │
                  └────────┬────────────┘
                           │
                           ▼
                  Genera JSON con:
                  · datos_estadisticos
                  · analisis_crudo
                  · ganador_proyectado ◄── NUNCA se muestra al usuario
                           │
                           ▼
                  Orquestador pasa JSON
                  al Agente Censor
                           │
                           ▼
                  ┌─────────────────────┐
                  │  Censor:            │
                  │  · Ignora           │
                  │    ganador_proyectado│
                  │  · Construye 2      │
                  │    argumentos       │
                  │    balanceados      │
                  │  · Genera Markdown  │
                  └────────┬────────────┘
                           │
                           ▼
                  Respuesta Markdown
                  enviada al cliente
```

---

## 4. Estructura de directorios

```
agent/
│
├── api.py                  ← Punto de entrada HTTP (FastAPI)
├── main.py                 ← Lógica del pipeline: crea y ejecuta los agentes
├── tools.py                ← Las herramientas de búsqueda web (Tavily)
│
├── prompts/                ← System prompts de cada agente (Markdown)
│   ├── orchestrator.md     ← Instrucciones del orquestador
│   ├── analyst.md          ← Instrucciones del agente analista
│   └── censor.md           ← Instrucciones del agente censor
│
├── skills/                 ← Skills de DeepAgents (contexto adicional)
│   ├── agente-analista/
│   │   ├── SKILL.md        ← Documentación extendida del analista
│   │   └── references/
│   │       └── tavily-search-guide.md
│   └── agente-censor/
│       ├── SKILL.md        ← Documentación extendida del censor
│       └── references/
│           └── input-schema.md
│
├── .env                    ← Variables de entorno (NO subir a Git)
├── .python-version         ← Versión de Python requerida (3.11)
├── pyproject.toml          ← Dependencias del proyecto
└── uv.lock                 ← Lockfile de versiones exactas
```

---

## 5. Descripción de cada archivo

### `api.py` — Punto de entrada HTTP

Expone la API REST con FastAPI. Define dos endpoints (`POST /chat` y `GET /health`) y exporta un `APIRouter` para poder incluirse en otras aplicaciones FastAPI.

Incluye un fix de `sys.path` que garantiza que los imports `agent.xxx` funcionen tanto si se ejecuta desde dentro de `agent/` como desde la raíz del proyecto.

### `main.py` — Pipeline de agentes

Aquí vive toda la lógica de los agentes:

- **`create_chatbot()`** — Construye el agente orquestador con sus dos subagentes usando `create_deep_agent()` de la librería DeepAgents. Carga los system prompts desde `prompts/` y las skills desde `skills/`.
- **`invoke_chatbot(query, thread_id)`** — Invoca el pipeline completo y devuelve la respuesta en texto plano. Maneja el caso donde Gemini devuelve una lista de bloques en lugar de un string.

El orquestador usa `MemorySaver` de LangGraph para mantener el historial de la conversación por `thread_id`.

### `tools.py` — Herramientas de búsqueda

Define las 6 funciones `@tool` que el Agente Analista puede llamar. Cada una ejecuta una búsqueda web con `TavilySearch` restringida a dominios específicos:

| Tool                        | Consulta                 | Dominios permitidos                 |
| --------------------------- | ------------------------ | ----------------------------------- |
| `get_historico_h2h`         | Enfrentamientos directos | SofaScore, FotMob, ESPN, FlashScore |
| `get_ranking_fifa`          | Ranking FIFA actual      | FIFA.com, SofaScore, ESPN           |
| `get_estado_forma`          | Últimos 5 partidos       | SofaScore, FotMob, ESPN, FlashScore |
| `get_historial_mundialista` | Mundiales históricos     | FIFA.com, Wikipedia, Transfermarkt  |
| `get_metricas_goles`        | Goles a favor/en contra  | SofaScore, FotMob, ESPN, FlashScore |
| `get_valor_plantilla`       | Valor de mercado         | Transfermarkt, SofaScore, ESPN      |

### JSON interno del Agente Analista

El Agente Analista **nunca devuelve este JSON al usuario final** — es el contrato interno entre el Nivel 1 y el Nivel 2 del pipeline. El Agente Censor lo recibe y lo transforma en Markdown.

**Estructura completa:**

```json
{
  "contexto_original_usuario": "Argentina vs Francia, quién llega mejor?",
  "datos_estadisticos": {
    "ranking_fifa": "Argentina 2° (1765 pts) · Francia 3° (1751 pts)",
    "valor_plantillas": "Argentina ~900M€ · Francia ~1.200M€ (Transfermarkt 2025)",
    "h2h": "9 partidos: Argentina 4V · 3E · 2D. Último: Final Mundial 2022, Argentina campeón",
    "forma_y_goles": "Argentina VVVEV (1.8 goles/partido) · Francia VVEDV (1.4 goles/partido)",
    "historial_mundialista": "Argentina: 3 títulos (1978, 1986, 2022), 5 finales. Francia: 2 títulos (1998, 2018), 3 finales"
  },
  "analisis_crudo": "Argentina domina el H2H reciente y llega con mejor forma. Su ranking FIFA es superior y el historial en instancias decisivas también. Sin embargo, Francia tiene una plantilla de mayor valor de mercado y mayor profundidad de banco....",
  "ganador_proyectado": "Argentina"
}
```

**Descripción de cada campo:**

| Campo                                      | Tipo     | Descripción                                                                                        |
| ------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------- |
| `contexto_original_usuario`                | `string` | Pregunta exacta del usuario, preservada para que el Censor mantenga coherencia                     |
| `datos_estadisticos.ranking_fifa`          | `string` | Posición y puntos FIFA de ambos equipos                                                            |
| `datos_estadisticos.valor_plantillas`      | `string` | Valor de mercado total según Transfermarkt                                                         |
| `datos_estadisticos.h2h`                   | `string` | Historial de enfrentamientos directos con resultado del último partido                             |
| `datos_estadisticos.forma_y_goles`         | `string` | Últimos 5 partidos (V/E/D) + promedio de goles por partido                                         |
| `datos_estadisticos.historial_mundialista` | `string` | Títulos mundiales, finales jugadas y ediciones participadas                                        |
| `analisis_crudo`                           | `string` | Síntesis interpretativa del analista. El Censor extrae hechos de aquí pero **ignora conclusiones** |
| `ganador_proyectado`                       | `string` | Equipo que el analista considera más probable ganador. **El Censor nunca revela este campo**       |

**Caso de error (consulta fuera de alcance):**

Si el analista detecta que la consulta no es sobre fútbol o el Mundial, devuelve este JSON de error en lugar del anterior:

```json
{
  "contexto_original_usuario": "¿Cuál es la capital de Francia?",
  "error": "fuera_de_alcance",
  "mensaje": "Este agente no ha sido implementado para responder ese tipo de consulta. Solo proceso preguntas sobre partidos y selecciones en el contexto del Mundial 2026."
}
```

El Agente Censor detecta el campo `"error": "fuera_de_alcance"` y responde al usuario con un mensaje amigable sin intentar procesar el contenido.

---

### `prompts/orchestrator.md` — Prompt del orquestador

Define el rol, contexto y reglas del agente coordinador. Le indica cuándo derivar al pipeline completo y cuándo rechazar directamente (consultas sobre política, economía, etc.).

### `prompts/analyst.md` — Prompt del analista

Le indica al analista que debe ejecutar las 6 herramientas obligatoriamente, cómo interpretar los snippets de búsqueda y qué estructura JSON debe devolver.

### `prompts/censor.md` — Prompt del censor

Contiene las reglas de censura (qué frases están prohibidas), la estructura de respuesta esperada y el tono conversacional que debe usar al presentar los datos.

### `skills/agente-analista/SKILL.md` y `skills/agente-censor/SKILL.md`

Las **skills** en DeepAgents son documentación contextual adicional que el agente puede consultar durante su ejecución. Complementan al system prompt con detalles más extensos: tablas de referencia, ejemplos de entrada/salida y consideraciones de implementación.

---

## 6. API Reference

### `POST /chat`

Envía una consulta al pipeline de agentes.

**Request body:**

```json
{
  "query": "Ecuador vs Costa de Marfil, quién llega mejor?",
  "thread_id": "user-abc123"
}
```

| Campo       | Tipo     | Requerido | Descripción                                                                     |
| ----------- | -------- | --------- | ------------------------------------------------------------------------------- |
| `query`     | `string` | Sí        | Pregunta del usuario                                                            |
| `thread_id` | `string` | No        | ID de sesión para mantener contexto. Si se omite, se genera uno automáticamente |

**Response `200 OK`:**

```json
{
  "response": "## Ecuador vs Costa de Marfil...\n\n**Datos clave:**...",
  "thread_id": "user-abc123"
}
```

| Campo       | Tipo     | Descripción                                                                 |
| ----------- | -------- | --------------------------------------------------------------------------- |
| `response`  | `string` | Análisis en formato Markdown                                                |
| `thread_id` | `string` | ID de sesión (usar en la siguiente petición para continuar la conversación) |

**Response `400 Bad Request`:**

```json
{
  "detail": "El campo 'query' no puede estar vacío."
}
```

---

### `GET /health`

Verifica que el servicio está activo.

**Response `200 OK`:**

```json
{
  "status": "ok",
  "service": "AI-Bank Chatbot — Mundial 2026"
}
```

---

## 7. Configuración de entorno

Crea un archivo `.env` dentro de `agent/` con las siguientes variables:

```env
# Clave de Google Generative AI (Gemini)
# Obtener en: https://aistudio.google.com/apikey
GOOGLE_API_KEY=tu_clave_aqui

# Clave de Tavily Search (búsquedas web)
# Obtener en: https://app.tavily.com
TAVILY_API_KEY=tu_clave_aqui
```

> **Importante:** El archivo `.env` nunca debe subirse a Git. Está incluido en `.gitignore`.

**Modelo utilizado:** `google_genai:gemini-2.5-flash` — se puede cambiar en `main.py` en la constante `GEMINI_MODEL`.

**Límites gratuitos de Tavily:** 1000 búsquedas/mes. Cada consulta al chatbot consume 6 búsquedas (una por herramienta).

---

## 8. Instalación y ejecución

### Requisitos previos

- Python 3.11+
- [`uv`](https://docs.astral.sh/uv/) — gestor de paquetes y entornos virtuales

### Pasos

**1. Clona el repositorio y entra a la carpeta:**

```bash
git clone <url-del-repo>
cd agent
```

**2. Instala las dependencias (crea el `.venv` automáticamente):**

```bash
uv sync
```

**3. Crea el archivo de variables de entorno:**

```bash
# Crea agent/.env con tus claves
cp .env.example .env   # si existe el ejemplo
# o crea el archivo manualmente con GOOGLE_API_KEY y TAVILY_API_KEY
```

**4. Levanta el servidor:**

```bash
uv run uvicorn api:app --host 0.0.0.0 --port 8001 --reload
```

El servidor quedará escuchando en `http://localhost:8001`.

### Verificar que funciona

```bash
# Health check
curl http://localhost:8001/health

# Consulta de prueba
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Argentina vs Francia, quién llega mejor al partido?"}'
```

### Ejecución desde la raíz del proyecto (modo integrado)

Si estás trabajando con el proyecto completo (con el chatbot frontend), puedes también ejecutar desde la raíz:

```bash
# Desde Reto_AI-Bank/
uv run uvicorn agent.api:app --host 0.0.0.0 --port 8001 --reload
```

---

## 9. Consumir desde un frontend

### JavaScript / TypeScript (fetch)

```typescript
const BACKEND_URL = "http://localhost:8001";

async function consultarChatbot(pregunta: string, threadId?: string) {
  const res = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: pregunta,
      thread_id: threadId,
    }),
  });

  if (!res.ok) throw new Error(`Error ${res.status}`);

  const data = await res.json();
  // data.response → string Markdown
  // data.thread_id → guardar para el siguiente mensaje
  return data;
}
```

## 10. Decisiones de diseño

### ¿Por qué DeepAgents + LangGraph?

**DeepAgents** provee una abstracción de alto nivel sobre LangGraph para crear pipelines de subagentes con skills (documentación contextual). Esto permite separar el comportamiento del agente (system prompt) de su conocimiento de referencia (skills), haciendo el sistema más mantenible.

**LangGraph** gestiona el estado de la conversación y el flujo entre nodos. `MemorySaver` persiste el historial en memoria RAM por `thread_id`, lo que habilita conversaciones multi-turno sin necesidad de base de datos.

### ¿Por qué Gemini 2.5 Flash?

- Capacidad de razonamiento suficiente para coordinar agentes y sintetizar datos deportivos.
- Velocidad alta (flash) adecuada para un chatbot interactivo.
- Compatible con `langchain-google-genai`.

### ¿Por qué Tavily para las búsquedas?

Tavily está diseñado para LLMs: devuelve snippets limpios y relevantes en lugar de HTML crudo. La restricción por `include_domains` garantiza que las búsquedas solo consulten fuentes deportivas fidedignas.

### ¿Por qué el censor existe como agente separado?

AI-Bank es una plataforma donde los usuarios apuestan "mAiles" (puntos de fidelidad) en predicciones de partidos. Si el chatbot diera predicciones directas:

1. Eliminaría el propósito del juego
2. Podría generar responsabilidad legal

El censor como agente independiente garantiza esta restricción de forma robusta, sin depender de que el analista se auto-censure.

### `sys.path` en `api.py`

Los imports usan la notación `agent.xxx` (con prefijo de paquete). Para que esto funcione tanto ejecutando desde `agent/` como desde la raíz del proyecto, `api.py` agrega automáticamente el directorio padre al `sys.path` en tiempo de carga. Esto permite al microservicio ser verdaderamente portátil.

---

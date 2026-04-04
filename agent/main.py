"""
Pipeline de Deep Agents para el chatbot deportivo AI-Bank — Mundial 2026.

Arquitectura:
  Orquestador (Gemini + skills via FilesystemBackend)
    ├── Subagent: Agente Analista (6 tools + skill agente-analista)
    └── Subagent: Agente Censor (sin tools + skill agente-censor)

Las skills (SKILL.md) se cargan desde disco con progressive disclosure.
Los system prompts se leen de archivos .md en agent/prompts/.

Uso:
  uv run python -m agent.main "Quien tiene mas chances, Argentina o Francia?"
"""

import logging
import os
import sys
import time

from dotenv import load_dotenv

# Cargar variables de entorno desde agent/.env
_AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_AGENT_DIR, ".env"))

from deepagents import create_deep_agent
from deepagents.backends.filesystem import FilesystemBackend
from langgraph.checkpoint.memory import MemorySaver

from agent.tools import ALL_TOOLS

# ── Logging ──────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ai-bank")

# ── Rutas ────────────────────────────────────────────────────────

PROJECT_DIR = os.path.dirname(_AGENT_DIR)
SKILLS_DIR = os.path.join(_AGENT_DIR, "skills")
PROMPTS_DIR = os.path.join(_AGENT_DIR, "prompts")

# ── Modelo ───────────────────────────────────────────────────────

GEMINI_MODEL = "google_genai:gemini-2.5-flash"


def _read_prompt(filename: str) -> str:
    """Lee un archivo .md de prompts y devuelve su contenido."""
    path = os.path.join(PROMPTS_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()


# ── Subagentes ───────────────────────────────────────────────────

analyst_subagent = {
    "name": "agente-analista",
    "description": (
        "Recopila datos deportivos del Mundial 2026 usando API-Football v3. "
        "Ejecuta 6 herramientas (H2H, ranking, forma, historial mundialista, "
        "goles, plantilla) y genera un JSON con analisis estadistico completo "
        "y proyeccion de ganador. Usar como primer paso cuando el usuario "
        "pregunta sobre un partido."
    ),
    "system_prompt": _read_prompt("analyst.md"),
    "tools": ALL_TOOLS,
    "skills": [os.path.join(SKILLS_DIR, "agente-analista") + "/"],
}

censor_subagent = {
    "name": "agente-censor",
    "description": (
        "Transforma el JSON de analisis del agente-analista en una respuesta "
        "Markdown balanceada. Censura predicciones de ganador y presenta datos "
        "de forma neutral con argumentos a favor de ambos equipos. Usar como "
        "segundo paso despues del agente-analista."
    ),
    "system_prompt": _read_prompt("censor.md"),
    "skills": [os.path.join(SKILLS_DIR, "agente-censor") + "/"],
}


# ── Factory del agente ───────────────────────────────────────────

def create_chatbot():
    """Crea y retorna el agente orquestador con skills y subagents."""
    logger.info("Creando agente orquestador con modelo %s", GEMINI_MODEL)
    logger.info("Skills dir: %s", SKILLS_DIR)
    logger.info("Subagents: agente-analista (6 tools), agente-censor (sin tools)")

    agent = create_deep_agent(
        model=GEMINI_MODEL,
        system_prompt=_read_prompt("orchestrator.md"),
        backend=FilesystemBackend(root_dir=PROJECT_DIR),
        checkpointer=MemorySaver(),
        subagents=[analyst_subagent, censor_subagent],
        skills=[SKILLS_DIR + "/"],
    )
    logger.info("Agente orquestador creado exitosamente")
    return agent


def invoke_chatbot(query: str, thread_id: str = "session-1") -> str:
    """Invoca el chatbot con una consulta y devuelve la respuesta Markdown."""
    logger.info("=" * 60)
    logger.info("NUEVA CONSULTA: %s", query)
    logger.info("Thread ID: %s", thread_id)
    logger.info("=" * 60)

    start = time.time()
    agent = create_chatbot()

    logger.info("Invocando pipeline (Analista → Censor)...")
    result = agent.invoke(
        {"messages": [{"role": "user", "content": query}]},
        config={"configurable": {"thread_id": thread_id}},
    )

    elapsed = time.time() - start
    raw = result["messages"][-1].content

    # Gemini puede devolver una lista de bloques en vez de un string plano
    if isinstance(raw, list):
        response = "\n".join(
            block["text"] for block in raw if isinstance(block, dict) and "text" in block
        )
    else:
        response = raw

    logger.info("Pipeline completado en %.1f segundos", elapsed)
    logger.info("Respuesta (%d caracteres): %s...", len(response), response[:100])
    return response


# ── CLI ──────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print('Uso: uv run python -m agent.main "Tu pregunta sobre un partido del Mundial 2026"')
        sys.exit(1)

    query = " ".join(sys.argv[1:])
    print(f"\nConsulta: {query}\n")
    print(invoke_chatbot(query))


if __name__ == "__main__":
    main()

"""
API REST para el chatbot deportivo AI-Bank — Mundial 2026.

Expone el pipeline de Deep Agents (Analista → Censor) como un endpoint HTTP
consumible desde cualquier interfaz externa (Next.js, etc.).

Uso (standalone, desde dentro de agent/):
  uv run uvicorn api:app --host 0.0.0.0 --port 8001 --reload

Uso (desde la raíz del proyecto):
  uv run uvicorn agent.api:app --host 0.0.0.0 --port 8001 --reload

Endpoints:
  POST /chat          — Envía una consulta al pipeline de agentes
  GET  /health        — Verifica que el servicio está activo.
"""

import os
import sys
import uuid

_here = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_here)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent.main import invoke_chatbot


# ── Modelos ──────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str
    thread_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    thread_id: str


# ── Router (reutilizable en otras apps) ──────────────────────────

router = APIRouter()


@router.get("/health")
def health():
    """Verifica que el servicio está activo."""
    return {"status": "ok", "service": "AI-Bank Chatbot — Mundial 2026"}


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Envía una consulta al pipeline de agentes (Analista → Censor).

    - **query**: Pregunta del usuario sobre el Mundial 2026.
    - **thread_id**: ID de sesión para mantener contexto entre mensajes (opcional).
      Si no se provee, se genera uno automáticamente.

    Retorna la respuesta en formato Markdown lista para renderizar.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="El campo 'query' no puede estar vacío.")

    thread_id = request.thread_id or f"session-{uuid.uuid4().hex[:8]}"
    response = invoke_chatbot(query=request.query.strip(), thread_id=thread_id)
    return ChatResponse(response=response, thread_id=thread_id)


# ── App standalone (para levantar agent/api.py directamente) ─────

app = FastAPI(
    title="AI-Bank Chatbot — Mundial 2026",
    description="Chatbot deportivo con Deep Agents para el Mundial 2026. Analiza partidos y selecciones clasificadas.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

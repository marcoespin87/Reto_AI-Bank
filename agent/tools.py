"""
Tools del Agente Analista — 6 funciones que buscan datos deportivos en la web.

Cada tool usa TavilySearch con dominios restringidos a fuentes fidedignas:
  - fifa.com (ranking oficial, historial mundialista)
  - sofascore.com (H2H, forma, estadisticas)
  - fotmob.com (metricas de goles, forma reciente)
  - transfermarkt.com (valor de plantilla, jugadores)
  - es.wikipedia.org / en.wikipedia.org (historial mundialista)
"""

import os
import json

from dotenv import load_dotenv

# Cargar variables de entorno
_AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_AGENT_DIR, ".env"))

from langchain_tavily import TavilySearch


# -- Configuracion de dominios por tipo de consulta -----------------------

DOMINIOS_ESTADISTICAS = [
    "sofascore.com",
    "fotmob.com",
    "espn.com",
    "flashscore.com",
]

DOMINIOS_RANKING = [
    "fifa.com",
    "sofascore.com",
    "espn.com",
]

DOMINIOS_HISTORIAL = [
    "fifa.com",
    "en.wikipedia.org",
    "es.wikipedia.org",
    "transfermarkt.com",
]

DOMINIOS_VALOR = [
    "transfermarkt.com",
    "sofascore.com",
    "espn.com",
]


# -- Funcion base de busqueda --------------------------------------------

def _buscar(query: str, dominios: list[str], max_results: int = 5) -> str:
    """Ejecuta una busqueda Tavily restringida a dominios fidedignas.

    Retorna un string JSON con los resultados de la busqueda.
    Si ocurre un error, retorna un JSON con el campo 'error'.
    """
    try:
        search = TavilySearch(
            max_results=max_results,
            search_depth="advanced",
            include_domains=dominios,
        )
        results = search.invoke({"query": query})

        # TavilySearch retorna un string o lista de resultados
        if isinstance(results, str):
            return results
        return json.dumps(results, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)


# =========================================================================
# TOOL 1 — Historial H2H
# =========================================================================

def get_historico_h2h(equipo_a: str, equipo_b: str) -> str:
    """Busca el historial de enfrentamientos directos (head-to-head) entre
    dos selecciones nacionales. Devuelve datos de partidos previos,
    victorias, empates y derrotas de cada equipo.

    Args:
        equipo_a: Nombre de la primera seleccion (ej. "Argentina").
        equipo_b: Nombre de la segunda seleccion (ej. "France").
    """
    query = (
        f"{equipo_a} vs {equipo_b} head to head history "
        f"all time results wins draws losses"
    )
    return _buscar(query, DOMINIOS_ESTADISTICAS)


# =========================================================================
# TOOL 2 — Ranking FIFA
# =========================================================================

def get_ranking_fifa(equipo_a: str, equipo_b: str) -> str:
    """Busca el ranking FIFA oficial actual de cada seleccion.
    Devuelve la posicion, puntos y ranking de ambos equipos.

    Args:
        equipo_a: Nombre de la primera seleccion.
        equipo_b: Nombre de la segunda seleccion.
    """
    query = (
        f"FIFA world ranking 2026 {equipo_a} {equipo_b} "
        f"position points current ranking"
    )
    return _buscar(query, DOMINIOS_RANKING)


# =========================================================================
# TOOL 3 — Estado de forma (ultimos partidos)
# =========================================================================

def get_estado_forma(equipo_a: str, equipo_b: str) -> str:
    """Busca los resultados recientes de cada seleccion para evaluar
    su racha actual (forma/momentum). Incluye los ultimos 5 partidos
    con marcadores y rivales.

    Args:
        equipo_a: Nombre de la primera seleccion.
        equipo_b: Nombre de la segunda seleccion.
    """
    query = (
        f"{equipo_a} and {equipo_b} national team "
        f"last 5 matches results 2025 2026 form"
    )
    return _buscar(query, DOMINIOS_ESTADISTICAS)


# =========================================================================
# TOOL 4 — Historial mundialista
# =========================================================================

def get_historial_mundialista(equipo_a: str, equipo_b: str) -> str:
    """Busca el rendimiento historico de cada seleccion en Copas del Mundo.
    Incluye participaciones, titulos, partidos jugados, victorias y
    mejores posiciones historicas.

    Args:
        equipo_a: Nombre de la primera seleccion.
        equipo_b: Nombre de la segunda seleccion.
    """
    query = (
        f"{equipo_a} and {equipo_b} FIFA World Cup all time history "
        f"titles appearances wins losses best result"
    )
    return _buscar(query, DOMINIOS_HISTORIAL)


# =========================================================================
# TOOL 5 — Metricas de goles
# =========================================================================

def get_metricas_goles(equipo_a: str, equipo_b: str) -> str:
    """Busca estadisticas de goles de cada seleccion: promedio de goles
    a favor y en contra por partido, goleadores clave y rendimiento
    ofensivo/defensivo reciente.

    Args:
        equipo_a: Nombre de la primera seleccion.
        equipo_b: Nombre de la segunda seleccion.
    """
    query = (
        f"{equipo_a} vs {equipo_b} national team "
        f"goals scored conceded per match statistics 2025 2026"
    )
    return _buscar(query, DOMINIOS_ESTADISTICAS)


# =========================================================================
# TOOL 6 — Valor de plantilla
# =========================================================================

def get_valor_plantilla(equipo_a: str, equipo_b: str) -> str:
    """Busca el valor de mercado de las plantillas de cada seleccion.
    Incluye valor total, jugadores mas valiosos, edades promedio y
    datos de Transfermarkt.

    Args:
        equipo_a: Nombre de la primera seleccion.
        equipo_b: Nombre de la segunda seleccion.
    """
    query = (
        f"{equipo_a} and {equipo_b} national team "
        f"squad market value 2025 2026 Transfermarkt most valuable players"
    )
    return _buscar(query, DOMINIOS_VALOR)


# -- Lista de todas las tools ---------------------------------------------

ALL_TOOLS = [
    get_historico_h2h,
    get_ranking_fifa,
    get_estado_forma,
    get_historial_mundialista,
    get_metricas_goles,
    get_valor_plantilla,
]

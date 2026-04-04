# Guia de busquedas Tavily — Agente Analista

## Fuentes fidedignas por categoria

### Estadisticas generales (H2H, forma, goles)
- **sofascore.com** — Estadisticas detalladas, H2H, forma reciente
- **fotmob.com** — Metricas de goles, rendimiento por partido
- **espn.com** — Cobertura amplia, datos de selecciones
- **flashscore.com** — Resultados en vivo y historicos

### Ranking FIFA
- **fifa.com** — Fuente oficial del ranking FIFA
- **sofascore.com** — Rankings actualizados
- **espn.com** — Rankings con contexto editorial

### Historial mundialista
- **fifa.com** — Datos oficiales de todas las ediciones
- **en.wikipedia.org** / **es.wikipedia.org** — Historial completo
- **transfermarkt.com** — Datos historicos de selecciones

### Valor de plantilla
- **transfermarkt.com** — Fuente principal de valores de mercado
- **sofascore.com** — Datos de jugadores y plantillas
- **espn.com** — Perfiles de jugadores

## Configuracion de busqueda

- **search_depth**: `"advanced"` — busquedas mas profundas
- **max_results**: `5` — suficiente para cruzar fuentes sin exceder tokens

## Interpretacion de resultados

Tavily retorna: `title`, `url`, `content` (snippet). El agente debe:
1. Leer todos los snippets
2. Extraer datos numericos
3. Priorizar fuentes oficiales (FIFA.com > SofaScore > otros)

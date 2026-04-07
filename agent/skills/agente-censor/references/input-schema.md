# Esquema de entrada del Agente Censor

El Agente Censor recibe un JSON producido por el Agente Analista (Nodo 1).
Este documento describe la estructura exacta de ese JSON y como debe
interpretarse cada campo.

## Estructura del JSON de entrada

```json
{
  "contexto_original_usuario": "[Pregunta exacta del usuario]",
  "datos_estadisticos": {
    "ranking_fifa": "...",
    "valor_plantillas": "...",
    "h2h": "...",
    "forma_y_goles": "...",
    "historial_mundialista": "..."
  },
  "analisis_crudo": "[Analisis detallado con proyeccion de ganador]",
  "ganador_proyectado": "[Pais que el Nodo 1 considera ganador]"
}
```

## Descripcion de cada campo

### `contexto_original_usuario`
La pregunta exacta que hizo el usuario al chatbot. Usar para:
- Mantener coherencia (si pregunto por un aspecto especifico, enfocarse ahi)
- Adaptar el tono (si fue casual, responder casual; si fue tecnico, responder tecnico)
- Asegurar que la respuesta contesta lo que realmente se pregunto

### `datos_estadisticos`

Contiene 5 subcampos con los datos recopilados por las 6 tools del Nodo 1:

| Subcampo | Contenido | Usar para |
|----------|-----------|-----------|
| `ranking_fifa` | Posicion en standings internacionales, puntos, W/D/L | Comparar jerarquia general |
| `valor_plantillas` | Jugadores, posiciones, transferencias recientes | Comparar calidad individual |
| `h2h` | Historial de enfrentamientos directos, marcadores | Contexto historico entre ambos |
| `forma_y_goles` | Ultimos 5 resultados + promedios de goles | Momentum reciente |
| `historial_mundialista` | Rendimiento en Mundiales anteriores | Experiencia en alta presion |

### `analisis_crudo`
Sintesis del Nodo 1 que combina todos los datos y razona sobre quien tiene ventaja.
Contiene sesgos y opiniones — extraer solo los hechos y argumentos, no las conclusiones.

### `ganador_proyectado`
**CAMPO PROHIBIDO.** El Nodo 2 nunca debe revelar, insinuar ni usar este campo
en la respuesta al usuario. Existe solo para el pipeline interno.

## Campos que podrian faltar

Si alguna tool del Nodo 1 fallo, su subcampo dentro de `datos_estadisticos` podria
contener un mensaje de error en lugar de datos. En ese caso, simplemente omitir esa
categoria del reporte sin mencionarle al usuario que hubo un error tecnico.

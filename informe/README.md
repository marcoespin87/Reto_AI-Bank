# Informe — AI-Bank mAiles

Documentación completa del proyecto para presentación ante jurado.

## Índice

| # | Documento | Contenido |
|---|---|---|
| 01 | [Resumen Ejecutivo](./01_resumen_ejecutivo.md) | Qué es, el problema, la solución, impacto |
| 02 | [Arquitectura Técnica](./02_arquitectura_tecnica.md) | Stack, diagrama, estructura de carpetas, flujos |
| 03 | [Modelo de IA](./03_modelo_ia.md) | Cómo funciona el ML, features, API, integración |
| 04 | [Funcionalidades](./04_funcionalidades.md) | Todas las pantallas y flujos explicados |
| 05 | [Base de Datos](./05_base_de_datos.md) | Tablas, esquema, relaciones |
| 06 | [Guía de Ejecución](./06_guia_ejecucion.md) | Cómo correr el proyecto paso a paso |
| 07 | [Propuesta de Valor](./07_propuesta_valor.md) | Innovación, modelo de negocio, diferenciación |

## Tecnologías principales

- **Frontend**: React Native + Expo + TypeScript
- **Base de datos**: Supabase (PostgreSQL)
- **Modelo ML**: Python + FastAPI + LightGBM/XGBoost
- **Auth**: Supabase Auth + Google OAuth

## Comando rápido para correr el proyecto

```bash
# Terminal 1 — API
cd modelo_segmentacion && uvicorn api:app --port 8000

# Terminal 2 — App
cd projectAibank && npx expo start
```

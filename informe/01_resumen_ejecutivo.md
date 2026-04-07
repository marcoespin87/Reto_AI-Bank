# AI-Bank mAiles — Resumen Ejecutivo

## ¿Qué es?

**AI-Bank mAiles** es una aplicación bancaria móvil gamificada construida alrededor del Mundial de Fútbol FIFA 2026. Convierte cada transacción bancaria en una experiencia de juego: los usuarios acumulan puntos (mAiles), coleccionan cromos de jugadores, compiten en ligas grupales y al final de la temporada reciben un **premio personalizado** determinado por inteligencia artificial.

---

## El problema que resuelve

Los bancos tradicionales tienen un problema de **engagement**: los usuarios solo abren su app bancaria cuando necesitan hacer algo puntual. No hay razón para volver todos los días.

Al mismo tiempo, el Mundial FIFA 2026 representa una oportunidad única de conexión emocional con millones de personas en Latinoamérica.

**AI-Bank mAiles** une ambos mundos: convierte el banco en un juego que los usuarios quieren abrir todos los días.

---

## La solución

| Problema | Solución |
|---|---|
| Baja retención en apps bancarias | Mecánicas de juego diarias (predicciones, cromos, ligas) |
| Premios genéricos que no motivan | Modelo ML que personaliza el premio según el perfil real |
| Experiencia bancaria aburrida | Tema FIFA 2026 con colección de jugadores y predicciones |
| Usuarios pasivos | Grupos y competencia social entre amigos |

---

## Propuesta de valor

> **"Cada peso que gastas te acerca a tu premio del Mundial"**

- Gastas $20 → ganas un cromo de jugador
- Gastas $100 → ganas 10 mAiles
- Predices resultados correctamente → bonus de mAiles
- Completas el álbum → medalla especial
- Al final de la temporada → el modelo AI te asigna **tu premio personalizado**

---

## Tecnología clave

- **App móvil**: React Native + Expo (iOS y Android)
- **Base de datos**: Supabase (PostgreSQL en la nube)
- **Autenticación**: Supabase Auth con Google OAuth
- **Modelo de IA**: LightGBM/XGBoost con 49 features → 9 categorías de premio
- **API del modelo**: Python FastAPI

---

## Impacto potencial

- Mayor frecuencia de uso de la app bancaria
- Incremento en volumen de transacciones por incentivo de cromos/mAiles
- Fidelización a largo plazo mediante progresión de medallas
- Diferenciación competitiva en el sector fintech latinoamericano
- Datos de comportamiento enriquecidos para personalización futura

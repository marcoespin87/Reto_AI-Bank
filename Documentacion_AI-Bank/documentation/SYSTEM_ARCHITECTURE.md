# Informe Ejecutivo — AI-Bank

> **Proyecto:** AI-Bank · Reto Tata Consultancy Services
> **Fecha:** Abril 2026
> **Versión:** 2.0

---

## Tabla de Contenidos

1. [Situación Actual](#1-situación-actual)
2. [Oportunidad](#2-oportunidad)
3. [Visión](#3-visión)
4. [Expectativas](#4-expectativas)
5. [Funcionalidades con IA First](#5-funcionalidades-con-ia-first)
6. [Conexión con la Problemática](#6-conexión-con-la-problemática)
7. [Diseño Técnico](#7-diseño-técnico)
8. [Diagrama de Despliegue](#8-diagrama-de-despliegue)
9. [Diagrama de Contexto](#9-diagrama-de-contexto)
10. [Diagrama de Contenedores](#10-diagrama-de-contenedores)
11. [Diagrama de Componentes](#11-diagrama-de-componentes)
12. [Modelamiento de Datos](#12-modelamiento-de-datos)
13. [Generación y Procesamiento de Datos](#13-generación-y-procesamiento-de-datos)
14. [Uso de IA en la Plataforma](#14-uso-de-ia-en-la-plataforma)
15. [Consideraciones Futuras — Arquitectura en Azure](#15-consideraciones-futuras--arquitectura-en-azure)

---

## 1. Situación Actual

### El problema del desenganche en la banca digital

Las entidades bancarias enfrentan un desafío estructural: la creciente dificultad para generar vínculos emocionales con sus clientes, especialmente con los segmentos más jóvenes. La oferta de productos financieros —tarjetas, créditos, cuentas de ahorro— tiende a percibirse como homogénea, transaccional y de bajo valor diferencial. Esta percepción se traduce en bajos niveles de engagement con las aplicaciones bancarias, alta tasa de abandono en canales digitales y reducida participación en programas de fidelización.

### Programas de lealtad genéricos: la brecha de la personalización

Los programas de puntos o millas vigentes en la industria presentan una limitación central: **no son personalizados**. Los premios y beneficios se asignan por criterios de volumen de gasto o categoría de producto, sin considerar el comportamiento digital, los intereses reales ni el perfil de consumo individual del cliente. El resultado es una experiencia percibida como irrelevante: el cliente acumula puntos que no reflejan lo que realmente le importa, lo que reduce el incentivo para participar activamente.

### Ausencia de contextos de alto interés como canal de engagement

Eventos de alcance masivo —como el Mundial de Fútbol FIFA— generan picos de interés colectivo que las instituciones financieras raramente aprovechan como catalizadores de vinculación. La industria bancaria carece de herramientas que conecten la experiencia emocional del cliente (seguir un Mundial, predecir resultados, competir con amigos) con su relación financiera con el banco.

### El déficit de IA aplicada al cliente

Si bien muchos bancos han adoptado inteligencia artificial para procesos internos (detección de fraude, scoring crediticio, automatización de back-office), el uso de IA orientada a **mejorar la experiencia del cliente en tiempo real** —analizando su comportamiento, personalizando su recorrido y anticipando sus necesidades— sigue siendo incipiente en la región.

---

## 2. Oportunidad

El Mundial de Fútbol 2026 representa una ventana de oportunidad única para redefinir la relación entre los bancos y sus clientes. Con una audiencia global que supera los 5.000 millones de espectadores y un nivel de involucramiento emocional sin precedentes, el torneo ofrece el contexto perfecto para construir una experiencia bancaria diferenciada.

La oportunidad concreta se articula en tres ejes:

**1. Gamificación como motor de engagement sostenido.** Al vincular las interacciones financieras del cliente (consumos, uso de productos bancarios, antigüedad) con mecánicas de juego (pronósticos, cromos coleccionables, competencias en grupo, ligas de fidelidad), se transforma el comportamiento transaccional en una experiencia participativa con sentido de progresión y logro.

**2. IA como habilitador de personalización real.** La inteligencia artificial permite segmentar al cliente de forma granular —combinando su perfil financiero, su comportamiento digital y sus patrones de consumo— para ofrecerle premios y beneficios que sean genuinamente relevantes para él, en lugar de catálogos genéricos.

**3. El chatbot deportivo como puerta de entrada.** Un agente conversacional que analice partidos del Mundial con estadísticas en tiempo real da al cliente un motivo concreto para abrir la app del banco todos los días, generando hábito de uso y ampliando las oportunidades de interacción financiera.

---

## 3. Visión

Construir la primera plataforma bancaria **AI-First** que utilice el Mundial de Fútbol como catalizador de engagement, transformando la relación financiera entre el banco y sus clientes en una experiencia inteligente, personalizada y emocionalmente significativa.

AI-Bank aspira a demostrar que la banca digital puede ir más allá de la transacción: puede acompañar al cliente en momentos que le importan, entender sus preferencias con profundidad y recompensarle de una manera que ningún programa de puntos genérico podría lograr.

---

## 4. Expectativas

Respecto a la solución propuesta, se espera que AI-Bank logre los siguientes resultados:

| Dimensión | Expectativa |
|---|---|
| **Engagement** | Incremento en la frecuencia de apertura de la app durante el torneo, impulsado por el chatbot deportivo y las dinámicas de pronósticos diarios |
| **Fidelización** | Mayor participación en el programa de ligas (Bronce → Plata → Oro → Diamante), incentivada por la gamificación de consumos bancarios |
| **Relevancia de premios** | Mejora percibida en la pertinencia de los premios otorgados gracias a la segmentación por IA, frente a catálogos genéricos |
| **Adopción de productos** | Aumento en el uso de productos bancarios (crédito, ahorro, tarjeta) vinculado al sistema de puntos y ligas |
| **Datos del cliente** | Enriquecimiento del perfil del cliente a través de su comportamiento dentro de la plataforma (patrones de predicción, intereses deportivos, actividad social) |
| **Diferenciación competitiva** | Posicionamiento del banco como referente en innovación con IA para la experiencia del cliente en la región |

---

## 5. Funcionalidades con IA First

AI-Bank adopta un enfoque **IA First**: la inteligencia artificial no es una característica aislada, sino el eje transversal que habilita y enriquece cada flujo principal de la aplicación.

### 5.1 Chatbot de Análisis Deportivo (Mundial)

El módulo central de engagement. El usuario ingresa el nombre de un partido del Mundial y recibe un análisis estadístico profundo generado por un sistema multi-agente:

- **Agente Orquestador:** Interpreta la consulta del usuario, valida que sea deportiva y válida en el contexto del torneo, y coordina la ejecución del pipeline.
- **Agente Analista:** Ejecuta en paralelo seis búsquedas web restringidas a fuentes deportivas verificadas (FIFA.com, SofaScore, Transfermarkt, ESPN, FlashScore), recopilando historial H2H, rankings FIFA, forma reciente, historial mundialista, métricas de gol y valor de plantilla.
- **Agente Censor:** Transforma los datos crudos en un análisis balanceado y neutro en formato Markdown. Nunca revela predicciones de ganador — esto preserva la mecánica de apuestas con mAiles.

El modelo de lenguaje subyacente es **Google Gemini 2.5 Flash**, orquestado mediante **LangGraph** para gestionar el estado conversacional entre sesiones.

### 5.2 Segmentación Inteligente de Premios

Cuando el usuario alcanza un umbral de puntos o finaliza la temporada, la plataforma activa el motor de personalización de premios:

- Un modelo de **clasificación por Machine Learning** (Logistic Regression entrenado con 30.000 perfiles sintéticos) asigna al usuario una de nueve categorías de interés: tecnología, viajes nacionales, viajes internacionales, gastronomía, experiencias y entretenimiento, salud y bienestar, educación y desarrollo, hogar y lifestyle, o financiero premium.
- Un **motor de reglas de negocio** puntúa cada premio dentro de la categoría asignada considerando criterios como ciudad del usuario, patrones de gasto, edad, nivel de liga y comportamiento en la app.
- El resultado es una recomendación explicable: el usuario ve el premio sugerido con las razones concretas por las que fue seleccionado para él, acompañado de dos alternativas rankeadas.

### 5.3 Sistema de Pronósticos con mAiles

La mecánica de predicción es el núcleo gamificado de la plataforma:

- El usuario usa el chatbot de IA para informarse antes de apostar sus **mAiles** (moneda interna de la plataforma) en el resultado de un partido.
- Cada pronóstico correcto genera mAiles adicionales, avanza en la liga y contribuye a las métricas que alimentan el modelo de segmentación.
- La IA actúa como asesor deportivo sin revelar el resultado esperado, manteniendo el equilibrio entre información y emoción del juego.

### 5.4 Álbum de Cromos Inteligente

El coleccionismo de cromos está vinculado al comportamiento del usuario:

- Los cromos se distribuyen según el nivel de actividad, los pronósticos acertados y los objetivos completados.
- La rareza del cromo (común, raro, épico) refleja la intensidad del engagement del usuario con la plataforma.
- Este mecanismo actúa como incentivo de retención a largo plazo dentro de la temporada.

### 5.5 Predicciones Grupales

Los usuarios pueden formar grupos para competir colectivamente en pronósticos:

- La plataforma registra el rol de cada miembro (creador, participante), los votos emitidos y la actividad grupal.
- Estos datos enriquecen el perfil del usuario y contribuyen a la segmentación futura de premios (el comportamiento social es una de las dimensiones del modelo).

### 5.6 Motor de Matchmaking Financiero

El Motor de Matchmaking automatiza la asignación de usuarios a grupos de predicción en base a su perfil financiero, eliminando la fricción de la formación manual de grupos y garantizando compatibilidad entre participantes:

- El algoritmo pondera dos dimensiones financieras: **70% historial de egresos** (categorización de comercios y frecuencia de consumo) y **30% liquidez financiera** (saldo proyectado del cliente).
- Con estas variables calcula un **índice de compatibilidad** entre usuarios, agrupando perfiles con patrones de gasto y capacidad financiera similares.
- La asignación de grupos se realiza de forma automática, sin intervención manual del usuario, y los resultados se persisten en la base de datos para su uso en la experiencia de predicciones grupales.

---

## 6. Conexión con la Problemática

| Funcionalidad | Problema que resuelve | Indicador de impacto |
|---|---|---|
| **Chatbot deportivo** | Falta de motivos para abrir la app bancaria con frecuencia | Frecuencia de apertura diaria durante el torneo |
| **Segmentación de premios con IA** | Programas de fidelización genéricos e irrelevantes | Satisfacción con el premio recibido; tasa de canje |
| **Sistema de mAiles y pronósticos** | Baja participación activa en productos bancarios | Volumen de transacciones vinculadas a la acumulación de puntos |
| **Ligas de fidelidad** | Ausencia de progresión y sentido de logro en la relación con el banco | Tasa de subida de liga; tiempo de permanencia en la plataforma |
| **Álbum de cromos** | Alto abandono de apps bancarias tras el onboarding inicial | Retención semanal y mensual durante la temporada |
| **Grupos de predicción** | Experiencia bancaria percibida como individual y transaccional | Usuarios activos en grupos; viralidad y referidos |
| **Motor de Matchmaking** | Fricción en la formación de grupos y compatibilidad aleatoria entre participantes | Índice de compatibilidad promedio por grupo; retención dentro del grupo |
| **Análisis en tiempo real** | Desconexión entre el banco y los eventos de alto interés del cliente | Consultas al chatbot por día de partido |

---

## 7. Diseño Técnico

La plataforma AI-Bank se construye sobre una arquitectura de **tres capas desacopladas**, con separación clara entre la presentación, la lógica de negocio/IA y los datos:

```
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                  │
│   App React Native / Expo (iOS · Android · Web)         │
│   Interfaz unificada que consume los servicios de IA    │
│   y los datos de usuario mediante APIs REST             │
└───────────────┬──────────────────┬──────────────────────┘
                │                  │
                ▼                  ▼
┌──────────────┐  ┌───────────────────────┐  ┌──────────────────────┐
│CAPA SERVICIOS│  │    CAPA DE SERVICIOS  │  │   CAPA DE SERVICIOS  │
│(Agente Dep.) │  │ (Segmentación Premios)│  │ (Motor Matchmaking)  │
│              │  │                       │  │                      │
│ Microservicio│  │ Microservicio         │  │ Microservicio        │
│ FastAPI +    │  │ FastAPI + Scikit-learn│  │ FastAPI + Python     │
│ LangGraph    │  │ Modelo ML + reglas    │  │ Índice compatib.     │
│ Puerto 8001  │  │ Puerto 8000           │  │ Asignación grupos    │
└──────┬───────┘  └──────────┬────────────┘  └──────────┬───────────┘
           │                               │
           ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS                        │
│   PostgreSQL gestionado por Supabase                    │
│   Fuente de verdad: perfiles, pronósticos, cromos,      │
│   transacciones, grupos y premios                       │
│   Auth JWT · Row Level Security · Realtime WebSockets   │
└─────────────────────────────────────────────────────────┘
```

**Principios de diseño:**

- **Desacoplamiento:** Cada microservicio es independiente y puede escalar, actualizarse o reemplazarse sin afectar a los demás.
- **API-first:** Toda la comunicación entre capas se realiza mediante contratos HTTP/JSON bien definidos.
- **IA como servicio:** La inteligencia artificial se encapsula en servicios dedicados con interfaces claras, permitiendo que la app consuma capacidades de IA sin acoplar su lógica de presentación al modelo subyacente.
- **Datos centralizados:** Un único repositorio de datos garantiza consistencia y elimina duplicación, habilitando que ambos microservicios de IA lean el mismo perfil de usuario.

---

## 8. Diagrama de Despliegue

Ver: [`diagram_deployment.md`](./diagram_deployment.md)

El despliegue actual de la plataforma se distribuye en tres nodos de infraestructura:

- **Dispositivo del usuario:** La app se distribuye como APK Android (React Native / Expo).
- **Render (Cloud Platform):** Tres Web Services independientes, uno por microservicio de IA. El Agente Deportivo expone `POST /chat`, el Servicio de Segmentación expone `POST /segmentar` y el Motor de Matchmaking expone `POST /matchmaking/asignar`, cada uno en su propio endpoint público HTTPS.
- **Supabase (Managed BaaS):** Base de datos PostgreSQL con Auth JWT, Realtime WebSockets y Storage, gestionada completamente por Supabase.

Los servicios externos (Google Gemini 2.5 Flash y Tavily Search API) son consumidos directamente por el Agente Deportivo desde Render mediante sus APIs REST públicas.

---

## 9. Diagrama de Contexto

Ver: [`c4_context.puml`](./c4_context.puml) *(PlantUML — C4 Nivel 1)*

El diagrama de contexto (C4-L1) muestra AI-Bank como sistema único desde la perspectiva del cliente bancario e identifica las tres dependencias externas clave:

- **Google Gemini 2.5 Flash:** Motor LLM que potencia los tres agentes del chatbot deportivo (Orquestador, Analista, Censor).
- **Tavily Search API:** Motor de búsqueda web con restricción de dominio deportivo, consumido exclusivamente por las 6 herramientas del Agente Analista.
- **Supabase:** Plataforma BaaS que centraliza la base de datos PostgreSQL, autenticación JWT con Row Level Security, WebSockets en tiempo real y almacenamiento de activos.

---

## 10. Diagrama de Contenedores

Ver: [`c4_containers.puml`](./c4_containers.puml) *(PlantUML — C4 Nivel 2)*

El diagrama de contenedores (C4-L2) desglosa la plataforma en sus cuatro contenedores técnicos desplegables de forma independiente:

| Contenedor | Tecnología | Responsabilidad |
|---|---|---|
| **AI-Bank App** | React Native · Expo · TypeScript | Capa de presentación unificada (iOS, Android, Web). Enruta las solicitudes del usuario al servicio de IA correspondiente. |
| **Agente Deportivo** | Python · FastAPI · LangGraph · Gemini | Pipeline multi-agente (Orquestador → Analista → Censor) para análisis de partidos. Expone `POST /chat`. |
| **Servicio de Segmentación** | Python · FastAPI · Scikit-learn | Inferencia ML y scoring de premios con justificación explicable. Expone `POST /segmentar`. |
| **Motor de Matchmaking** | Python · FastAPI | Calcula el índice de compatibilidad financiera entre usuarios (70% egresos + 30% liquidez) y automatiza la asignación de grupos. Expone `POST /matchmaking/asignar`. |
| **Base de Datos** | PostgreSQL · Supabase | Fuente de verdad con Auth JWT, RLS, Realtime WebSockets y Storage. |

---

## 11. Diagrama de Componentes

Los diagramas de componentes (C4-L3) descomponen internamente los dos microservicios de IA. La AI-Bank App no se desglosa a este nivel dado que su estructura está gobernada por el sistema de rutas de Expo Router, sin componentes de backend que requieran visibilidad arquitectónica adicional.

### 11.1 Agente Deportivo

Ver: [`c4_components_agente.puml`](./c4_components_agente.puml) *(PlantUML — C4 Nivel 3)*

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| **API Router** | FastAPI · Pydantic | Expone `POST /chat` y `GET /health`. Valida esquema de entrada. |
| **Agente Orquestador** | LangGraph · Gemini 2.5 Flash | Valida la consulta, coordina el pipeline y rechaza consultas fuera del dominio del Mundial. |
| **Agente Analista** | LangGraph · Gemini 2.5 Flash · 6 Tools | Ejecuta 6 búsquedas Tavily en paralelo y genera un JSON con estadísticas e internamente el `ganador_proyectado`. |
| **Agente Censor** | LangGraph · Gemini 2.5 Flash | Filtra `ganador_proyectado` del JSON y transforma las estadísticas en análisis Markdown balanceado. |
| **Memory Store** | LangGraph MemorySaver | Persiste el historial de conversación por `thread_id` durante la sesión. |
| **Herramientas de Búsqueda (×6)** | Python · langchain-tavily | `get_historico_h2h`, `get_ranking_fifa`, `get_estado_forma`, `get_historial_mundialista`, `get_metricas_goles`, `get_valor_plantilla`. Cada tool con dominios permitidos explícitos. |

### 11.2 Servicio de Segmentación


Ver: [`c4_components_segmentacion.puml`](./c4_components_segmentacion.puml) *(PlantUML — C4 Nivel 3)*

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| **API Router** | FastAPI · Pydantic | Expone `POST /segmentar`, `POST /segmentar/batch`, `GET /categorias` y `GET /health`. |
| **Constructor de Features** | Python · pandas · `build_input_df.py` | Transforma el perfil del usuario en un DataFrame de 49 features normalizadas, incluyendo 8 variables derivadas. |
| **Clasificador ML** | Scikit-learn · Logistic Regression · `.pkl` | Predice la categoría de premio más afín (1 de 9) y el vector de probabilidades. F1-macro: 0.79. |
| **Label Encoder** | Scikit-learn · LabelEncoder · `.pkl` | Decodifica el índice predicho al nombre de categoría textual. |
| **Motor de Reglas** | Python · `reglas_premios.py` | Puntúa cada premio de la categoría asignada (0–100) con reglas de negocio y retorna el óptimo con razones y 2 alternativas. |

### 11.3 Motor de Matchmaking

Ver: [`c4_components_matchmaking.puml`](./c4_components_matchmaking.puml) *(PlantUML — C4 Nivel 3)*

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| **API Router** | FastAPI · Pydantic | Expone `POST /matchmaking/asignar` y `GET /health`. Valida el esquema de entrada. |
| **Extractor de Features** | Python · pandas | Lee el historial de egresos (categorización de comercios y frecuencia de consumo) y el saldo proyectado desde la base de datos para cada usuario candidato. |
| **Calculador de Compatibilidad** | Python | Aplica la ponderación 70% (egresos) + 30% (liquidez) para generar el índice de compatibilidad entre pares de usuarios. |
| **Asignador de Grupos** | Python | Agrupa los usuarios ordenados por índice de compatibilidad y determina la composición óptima de cada grupo. |
| **Escritor de Resultados** | Python · Supabase Client | Persiste la asignación de grupos resultante en la tabla `grupo` de la base de datos. |

---

## 12. Modelamiento de Datos


Ver: [`diagram_database_schema.md`](./diagram_database_schema.md)

El modelo de datos está estructurado en torno a dos entidades centrales: **`persona`** (el cliente bancario y su perfil completo) y **`perfil`** (su cuenta de gamificación). Desde estas dos entidades se desprenden todos los dominios funcionales de la plataforma:

### Tablas principales

| Tabla | Propósito |
|---|---|
| `persona` | Perfil maestro del cliente. Contiene 40+ campos que cubren su situación financiera, comportamiento de consumo, métricas de gamificación, datos demográficos y hábitos digitales. Es la fuente de las 49 features que consume el modelo de segmentación. |
| `perfil` | Cuenta de gamificación vinculada a `persona`. Registra millas, puntos acumulados y liga actual. |
| `partido` | Registro de cada partido del Mundial con países participantes, temporada y resultado oficial. |
| `pronosticos` | Predicciones realizadas por cada usuario sobre partidos. Incluye acierto (`es_correcto`) y mAiles ganados. |
| `cromos` | Catálogo de cromos coleccionables con rareza (común, raro, épico) y su asociación a países. |
| `consumo` | Transacciones bancarias del usuario, base para calcular los porcentajes de gasto por categoría. |
| `liga` | Definición de los cuatro niveles de fidelidad: Bronce, Plata, Oro y Diamante. |
| `premios` | Registro de premios otorgados a cada usuario, con referencia a la liga activa al momento del otorgamiento. |
| `grupo` | Grupos de predicción colaborativa formados por usuarios. |
| `temporada` | Delimitación temporal del torneo activo. |

### Enumeraciones clave

- **`frecuencia_cromo_enum`:** `comun` · `raro` · `epico`
- **`ganador_enum`:** `local` · `visitante` · `empate`
- **`rol_en_grupo_enum`:** `creador` · `miembro` · `sin_grupo`
- **`score_crediticio`:** `AAA` · `AA` · `A` · `B` · `C`
- **`liga_tier`:** `Bronce` · `Plata` · `Oro` · `Diamante`

---

## 13. Generación y Procesamiento de Datos

Ver: [`diagram_data_processing.md`](./diagram_data_processing.md)

### Datos sintéticos generados con IA

Dado que AI-Bank es una plataforma nueva sin datos históricos de clientes reales, el modelo de segmentación fue entrenado con un **dataset sintético de 30.000 perfiles de usuarios**, generado mediante inteligencia artificial. Este conjunto de datos fue diseñado para reflejar la distribución estadística esperada de clientes bancarios en la región, cubriendo los 49 features de entrada del modelo en sus rangos y correlaciones realistas:

- Perfiles financieros con distintos niveles de gasto, antigüedad y scoring crediticio
- Patrones de consumo distribuidos entre las nueve categorías (tecnología, viajes, gastronomía, etc.)
- Comportamientos de gamificación con diferentes niveles de engagement
- Distribuciones demográficas representativas (edad, género, ciudad, educación)

El uso de datos sintéticos permitió entrenar y validar el modelo sin comprometer la privacidad de clientes reales, y fue posible gracias a técnicas de generación controlada con LLMs que garantizan coherencia interna entre las variables del perfil.

### Pipeline de inferencia en tiempo real

El procesamiento de datos para la personalización de premios sigue dos fases bien diferenciadas:

**Fase offline (entrenamiento):** El modelo de clasificación se entrena una sola vez sobre el dataset sintético, produciendo dos artefactos serializados (`.pkl`) que se despliegan junto al microservicio. No requiere acceso a datos en tiempo real.

**Fase online (inferencia):** Al momento de recomendar un premio, el servicio construye dinámicamente el DataFrame del usuario a partir de su perfil almacenado en la base de datos, ejecuta la inferencia ML para asignar la categoría de interés, y aplica el motor de reglas para seleccionar el premio óptimo dentro de esa categoría con una justificación explicable.

Este diseño garantiza respuestas en **menos de 500 ms**, independientemente del volumen de usuarios activos en la plataforma.

---

## 14. Uso de IA en la Plataforma

La inteligencia artificial se aplica en cuatro dimensiones funcionales distintas dentro de AI-Bank:

### 13.1 Segmentación y Clustering de Usuarios

El modelo de **Logistic Regression** multiclase agrupa implícitamente a los usuarios en nueve perfiles de interés a partir de 49 variables de comportamiento. Esta segmentación no es estática: a medida que el usuario interactúa con la plataforma (más pronósticos, más consumo, más actividad social), su perfil se enriquece y la recomendación de premios puede evolucionar.

Las nueve categorías de segmentación son: tecnología, viajes nacionales, viajes internacionales, gastronomía, experiencias y entretenimiento, salud y bienestar, educación y desarrollo, hogar y lifestyle, y financiero premium.

### 13.2 Personalización de Premios

El motor de reglas combina la salida del modelo ML con criterios de negocio explícitos (ciudad, gasto dominante, edad, nivel de liga, productos bancarios activos) para seleccionar el premio más afín dentro de un catálogo de **40 premios** distribuidos entre las nueve categorías. Cada recomendación incluye una puntuación de afinidad (0–100%) y razones explicables al usuario, lo que incrementa la confianza y la percepción de relevancia del premio.

### 13.3 Chatbot Deportivo Multi-Agente

Un sistema de tres agentes IA en pipeline secuencial:

- **Orquestador:** Filtra y enruta consultas. Rechaza preguntas fuera del dominio del Mundial FIFA.
- **Analista:** Recupera estadísticas deportivas en tiempo real desde seis fuentes verificadas mediante búsquedas paralelas con Tavily.
- **Censor:** Garantiza que la respuesta sea informativa y balanceada, nunca predictiva. Preserva la mecánica de apuestas con mAiles.

El sistema mantiene **memoria conversacional por sesión** (via LangGraph MemorySaver), permitiendo que el usuario siga un hilo de análisis sobre múltiples partidos dentro de la misma conversación.

### 13.4 Motor de Matchmaking Financiero

El Motor de Matchmaking automatiza la asignación de usuarios a grupos de predicción mediante un algoritmo de compatibilidad financiera. El sistema pondera dos dimensiones: **70% historial de egresos** (categorización de comercios y frecuencia de consumo) y **30% liquidez financiera** (saldo proyectado). Con estas variables calcula un índice de compatibilidad que permite agrupar perfiles financieramente afines sin intervención manual del usuario.

Este componente transforma los grupos de predicción de una mecánica social pasiva en una funcionalidad impulsada por datos financieros reales, alineando el comportamiento de consumo del cliente con su experiencia de juego en la plataforma.

---

## 15. Consideraciones Futuras — Arquitectura en Azure

Ver: [`diagram_future_architecture.md`](./diagram_future_architecture.md)

### 14.1 Motivación

La arquitectura actual opera en un entorno de prototipo. Para una puesta en producción real, la plataforma requiere: aislamiento entre servicios, alta disponibilidad, escalado automático, pipeline de CI/CD formal y gestión centralizada de secretos. La propuesta futura adopta una **arquitectura de microservicios con diseño hexagonal** desplegada íntegramente en Microsoft Azure.

### 14.2 Microservicios de Negocio

Los dominios de negocio actualmente manejados de forma monolítica en la app se separan en microservicios independientes:

| Microservicio | Responsabilidad |
|---|---|
| **Auth Service** | Autenticación y autorización (proxy sobre Azure AD B2C) |
| **User Service** | Gestión de perfiles, mAiles, ligas y estadísticas de gamificación |
| **Prediction Service** | Pronósticos, grupos, validación de resultados y asignación de puntos |
| **Banking Service** | Registro de consumo, transferencias y categorización de gastos |
| **Album Service** | Gestión de cromos, colecciones y galería |

Los microservicios de IA (**Agent Service** y **Segmentation Service**) se mantienen como contenedores independientes.

### 14.3 Infraestructura Azure Propuesta

- **Azure Container Registry (ACR):** Repositorio privado de imágenes Docker para todos los microservicios. El pipeline CI/CD (GitHub Actions) construye y publica imágenes automáticamente en cada merge a `main`.

- **Azure Container Apps (ACA):** Plataforma serverless de contenedores. Cada microservicio se despliega como una Container App independiente con auto-scaling basado en tráfico (KEDA), despliegues canary/blue-green y gestión de secretos integrada con Azure Key Vault.

- **Azure Load Balancer:** Distribuye el tráfico entre réplicas de cada servicio a nivel de transporte (L4), garantizando alta disponibilidad.

- **Azure Front Door + WAF:** Punto de entrada global con CDN, routing inteligente por rutas y Web Application Firewall para protección contra amenazas web.

- **Azure API Management (APIM):** Gateway centralizado para autenticación JWT, rate limiting, versioning y documentación OpenAPI unificada de todos los microservicios.

- **Azure Database for PostgreSQL Flexible Server:** Motor de base de datos relacional gestionado en alta disponibilidad (zona redundante). Mantiene compatibilidad completa con el esquema actual definido en PostgreSQL.

- **Azure Static Web Apps (SWA):** Despliegue del build web de la aplicación React Native/Expo. Ofrece CDN global, SSL automático, preview environments por Pull Request y despliegue directo desde GitHub.

### 14.4 GraphRAG + Base de Datos de Grafos

El Agente Analista actualmente depende de **Tavily Search** para obtener datos deportivos en tiempo real. Este enfoque tiene limitaciones operativas a escala: costo lineal con el volumen de consultas, latencia de 8–15 segundos por análisis, y pérdida del contexto histórico entre sesiones.

La propuesta futura introduce **Microsoft GraphRAG** sobre **Azure Cosmos DB (API Apache Gremlin)** como capa de conocimiento estructurado:

```
Nodos:  Selección Nacional · Partido · Jugador · Estadística · Temporada
Aristas: jugó_en · marcó_gol · enfrentó_a · ganó_contra · tiene_ranking
```

**¿Por qué una base de datos de grafos mejora la búsqueda del agente?**

| Dimensión | Tavily (actual) | GraphRAG + Grafo (futuro) |
|---|---|---|
| **Relaciones multi-hop** | El LLM debe inferirlas del texto | El grafo las traviesa directamente |
| **Latencia** | 8–15 s (6 llamadas externas) | < 1 s (consulta local) |
| **Contexto histórico** | Efímero (nueva búsqueda por consulta) | Persistente (todos los torneos anteriores) |
| **Coherencia semántica** | Dependiente de la calidad de las fuentes | Controlada al momento de ingestar los datos |
| **Costo operativo** | Crece con el volumen de consultas | Fijo (actualización periódica del grafo) |

Con GraphRAG, el Agente Analista consulta el grafo de conocimiento deportivo en lugar de ejecutar seis llamadas a APIs externas. GraphRAG recupera los subgrafos más relevantes y los entrega al LLM como contexto estructurado, produciendo análisis más completos, más rápidos y con menor dependencia de servicios externos.

### 14.5 Pipeline CI/CD

```
Merge a main (GitHub)
        ↓
GitHub Actions: build de imágenes Docker por microservicio
        ↓
Push a Azure Container Registry (ACR)
        ↓
Despliegue rolling en Azure Container Apps (ACA)
  - Health check antes del swap de tráfico
  - Revisión canary con porcentaje de tráfico configurable
        ↓
Azure Monitor + Application Insights: alertas post-deploy
```

---

*Documento elaborado con base en el análisis de los componentes: `poc/agent`, `modelo_segmentacion`, `projectAibank` y `documentacion_base/script.sql`.*

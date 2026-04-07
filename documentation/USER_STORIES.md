# Historias de Usuario — AI Bank Gamificación
> **Product Owner Técnico / Backend Tech Lead**
> Versión 1.0 | Fecha: 2026-04-06

---

## Leyenda de Roles

| Rol | Descripción |
|---|---|
| `usuario` | Cliente del banco registrado con perfil gamificado |
| `admin` | Operador interno del banco que gestiona temporadas y partidos |
| `sistema` | Proceso automatizado/cron que ejecuta lógicas de negocio |

---

## ÉPICA 1 — GESTIÓN DE IDENTIDAD Y PERFIL

---

### US-01: Registro de Persona (Onboarding)

**Descripción:**
Como **usuario**, quiero registrarme en el sistema con mis datos personales y bancarios para acceder a la plataforma de gamificación.

**Criterios de Aceptación:**
- [ ] El sistema crea un registro en `persona` con los campos obligatorios: `nombre`, `mail`, `celular`, `numero_cuenta`.
- [ ] El `mail` y `numero_cuenta` deben ser únicos; si ya existen, el sistema retorna `409 Conflict`.
- [ ] Al completar el registro de `persona`, el sistema crea **automáticamente** un registro en `perfil` vinculado, con `millas = 0`, `puntos = 0`, y `id_liga` asignado a **Liga Bronce** (rango 0–4,999 puntos).
- [ ] El `username` del perfil debe ser único; si colisiona, retorna `409 Conflict`.
- [ ] Los campos de perfil ML (porcentajes de gasto, `gasto_mensual_usd`, etc.) se inicializan en `0` y se actualizan progresivamente por consumo.

**Impacto en BD:**
- **INSERT** → `persona`
- **INSERT** → `perfil` (automático post-registro)
- **READ** → `liga` (para asignar Bronce por defecto)

---

### US-02: Consulta y Actualización de Perfil

**Descripción:**
Como **usuario**, quiero consultar mi perfil gamificado para ver mi balance de millas, puntos, liga actual y estadísticas de temporada.

**Criterios de Aceptación:**
- [ ] El endpoint retorna el balance actualizado de `millas` y `puntos` del perfil.
- [ ] Se incluye el nombre de la liga actual (`liga.nombre`) basado en `perfil.id_liga`.
- [ ] Se calcula y retorna el **equivalente en USD** de las millas acumuladas (`millas * 0.01`).
- [ ] Los campos de datos demográficos (`edad`, `ciudad`, `ocupacion`, etc.) pueden actualizarse vía PATCH sin afectar el balance de millas/puntos.
- [ ] La liga se recalcula en tiempo real basándose en los `puntos` actuales del perfil según los umbrales: Bronce 0–4,999 | Plata 5,000–14,999 | Oro 15,000–29,999 | Diamante 30,000+.

**Impacto en BD:**
- **READ** → `perfil`, `persona`, `liga`
- **UPDATE** → `persona` (datos demográficos)
- **UPDATE** → `perfil.id_liga` (si la liga cambió)

---

## ÉPICA 2 — ECONOMÍA DEL SISTEMA (CONSUMO Y RECOMPENSAS)

---

### US-03: Registro de Consumo y Generación de Recompensas

**Descripción:**
Como **sistema**, quiero procesar cada transacción de consumo registrada para otorgar automáticamente millas, puntos y cromos al usuario según las reglas de negocio.

**Criterios de Aceptación:**
- [ ] **Regla de Millas:** Por cada `$1.00 USD` de consumo, el usuario recibe **8 Millas**. Fórmula: `floor(monto) * 8`.
- [ ] **Regla de Puntos:** Por cada `$1.00 USD` de consumo, el usuario recibe **10 Puntos**. Fórmula: `floor(monto) * 10`.
- [ ] **Regla de Cromos:** Por cada `$10.00 USD` de consumo, el usuario recibe **1 Cromo**. Fórmula: `floor(monto / 10)`. Si la transacción es de `$150 USD`, se otorgan **15 Cromos**.
- [ ] La generación de cromos usa el motor de rareza: **Común 75%**, **Raro 20%**, **Épico 5%**. Cada cromo se genera con una asignación independiente.
- [ ] El sistema actualiza `perfil.millas` y `perfil.puntos` **atómicamente** (dentro de la misma transacción de BD).
- [ ] Tras actualizar `puntos`, el sistema recalcula y actualiza `perfil.id_liga` según los umbrales definidos.
- [ ] Se registra un log en `logs_puntos` por cada variación de puntos con el concepto `"CONSUMO"`.
- [ ] Si el cambio de liga implica ascenso, se registra en `perfilesliga` con `id_liga_previa` e `id_liga_nueva`.
- [ ] Si el consumo tiene `id_tag` asociado (clasificación ML), se guarda en `tagsconsumo`.
- [ ] El `monto` del consumo debe ser `> 0`; caso contrario retorna `400 Bad Request`.
- [ ] Se puede asociar un `id_producto_persona` (producto bancario del usuario) para trazabilidad.

**Impacto en BD:**
- **INSERT** → `consumo`
- **UPDATE** → `perfil` (millas, puntos, id_liga)
- **INSERT** → `logs_puntos`
- **INSERT** → `cromosperfil` (N registros según floor(monto/10))
- **INSERT** → `perfilesliga` (condicional, si cambia de liga)
- **INSERT** → `tagsconsumo` (si se provee tag)
- **READ** → `liga`, `cromos`

---

### US-04: Consulta de Historial de Consumos

**Descripción:**
Como **usuario**, quiero consultar mi historial de consumos para ver cuántas recompensas he acumulado por cada transacción.

**Criterios de Aceptación:**
- [ ] El listado se filtra por `id_persona` del usuario autenticado.
- [ ] Cada registro muestra: `monto`, `descripcion`, `fecha`, `millas` generadas, `puntos` generados, `cromos` generados.
- [ ] Soporta paginación (`page`, `limit`) con valores por defecto `page=1`, `limit=20`.
- [ ] Soporta filtro por rango de fechas (`fecha_inicio`, `fecha_fin`).

**Impacto en BD:**
- **READ** → `consumo`, `logs_puntos`, `cromosperfil`

---

## ÉPICA 3 — LIGAS Y TEMPORADAS

---

### US-05: Consulta de Ranking de Liga

**Descripción:**
Como **usuario**, quiero ver el ranking de usuarios dentro de mi liga actual para conocer mi posición competitiva en la temporada.

**Criterios de Aceptación:**
- [ ] El ranking se ordena por `puntos` de mayor a menor, filtrado por `id_liga`.
- [ ] Se incluye la posición numérica del usuario en el ranking global y dentro de su liga.
- [ ] Se muestran los campos: `username`, `puntos`, `millas`, `liga`.
- [ ] Soporta paginación (`page`, `limit`).
- [ ] El ranking refleja los puntos de la **temporada vigente** (los puntos no reiniciados).

**Impacto en BD:**
- **READ** → `perfil`, `liga`, `persona`

---

### US-06: Creación y Gestión de Temporada (Admin)

**Descripción:**
Como **admin**, quiero crear y gestionar temporadas de juego para definir los períodos en que los usuarios compiten.

**Criterios de Aceptación:**
- [ ] Solo puede existir **una temporada activa** a la vez. Si ya hay una activa, retorna `409 Conflict`.
- [ ] La `fecha_fin` debe ser mayor a `fecha_inicio`; caso contrario retorna `400 Bad Request`.
- [ ] Los partidos se asocian a una `id_temporada`.
- [ ] Se puede consultar la temporada activa por separado.

**Impacto en BD:**
- **INSERT** → `temporada`
- **READ** → `temporada`

---

### US-07: Cierre de Temporada (Admin)

**Descripción:**
Como **admin**, quiero cerrar la temporada activa para guardar el historial de puntos y ligas finales, y reiniciar los puntos de todos los perfiles para la siguiente competencia.

**Criterios de Aceptación:**
- [ ] Al cerrar la temporada, el sistema guarda en `logs_puntos` un registro para cada perfil con el concepto `"CIERRE_TEMPORADA"` y los puntos finales.
- [ ] Se guarda en `perfilesliga` la liga final de cada perfil con `id_liga_previa = id_liga_actual` e `id_liga_nueva = id_liga_actual` (foto histórica).
- [ ] El balance de `perfil.puntos` se actualiza a **0** para **todos** los perfiles.
- [ ] El balance de `perfil.millas` **permanece intacto** (nunca se reinicia).
- [ ] El campo `persona.mailes_acumuladas` se mantiene inalterado.
- [ ] La operación es **atómica**: si falla a mitad del proceso, se hace rollback completo.
- [ ] Una temporada solo puede cerrarse una vez (el sistema valida que no esté ya cerrada).

**Impacto en BD:**
- **READ** → `perfil` (todos los registros)
- **INSERT** → `logs_puntos` (un registro por perfil)
- **INSERT** → `perfilesliga` (un registro por perfil)
- **UPDATE** → `perfil.puntos = 0` (todos los perfiles)
- **UPDATE** → `temporada` (marcar como cerrada)

---

## ÉPICA 4 — PRONÓSTICOS Y PARTIDOS

---

### US-08: Gestión de Partidos (Admin)

**Descripción:**
Como **admin**, quiero registrar los partidos del torneo para que los usuarios puedan realizar sus pronósticos.

**Criterios de Aceptación:**
- [ ] Un partido requiere: `id_pais_local`, `id_pais_visitante`, `fecha`, `id_temporada`.
- [ ] La `fecha` puede ser pasada o futura. Solo los partidos con fecha **futura** son elegibles para pronósticos.
- [ ] `id_pais_local` e `id_pais_visitante` no pueden ser iguales; retorna `400 Bad Request`.
- [ ] Los países deben existir en la tabla `paises`; si no, retorna `404 Not Found`.

**Impacto en BD:**
- **INSERT** → `partido`
- **READ** → `paises`, `temporada`

---

### US-09: Registro de Resultado de Partido (Admin)

**Descripción:**
Como **admin**, quiero ingresar el resultado oficial de un partido para que el sistema evalúe y recompense los pronósticos correctos.

**Criterios de Aceptación:**
- [ ] Se actualizan `goles_local`, `goles_visitante` y `ganador` en el partido.
- [ ] El sistema evalúa **todos** los pronósticos de ese partido automáticamente.
- [ ] **Regla de Acierto Exacto:** Si el pronóstico del usuario coincide con `score_local`, `score_visitante` y `ganador`, el perfil recibe **500 Puntos**.
- [ ] **Regla de Fallo:** Si el pronóstico no es exacto, el usuario recibe **0 Puntos**. No se aplican deducciones.
- [ ] Se actualiza `pronosticos.es_correcto` (`true`/`false`) para cada pronóstico evaluado.
- [ ] Por cada pronóstico correcto, se inserta un log en `logs_puntos` con concepto `"PRONOSTICO_CORRECTO"`.
- [ ] Se recalcula la liga del perfil si los nuevos puntos superan un umbral.
- [ ] El campo `persona.predicciones_correctas_pct` y `racha_maxima_predicciones` se actualizan.
- [ ] La operación es atómica por cada perfil evaluado.

**Impacto en BD:**
- **UPDATE** → `partido`
- **READ** → `pronosticos` (todos los del partido)
- **UPDATE** → `pronosticos.es_correcto`
- **UPDATE** → `perfil.puntos`, `perfil.id_liga`
- **INSERT** → `logs_puntos`
- **INSERT** → `perfilesliga` (condicional)
- **UPDATE** → `persona` (estadísticas ML)

---

### US-10: Registro de Pronóstico de Partido

**Descripción:**
Como **usuario**, quiero registrar mi predicción de resultado para un partido futuro y ganar puntos si acierto el marcador exacto.

**Criterios de Aceptación:**
- [ ] **Condición de Participación:** Solo se puede registrar pronósticos para partidos cuya `fecha` sea **estrictamente futura** (mayor al momento actual). Si el partido ya ocurrió, retorna `400 Bad Request`.
- [ ] Un usuario no puede tener más de **un pronóstico por partido**. Si intenta duplicar, retorna `409 Conflict`.
- [ ] El campo `ganador` del pronóstico debe ser consistente con los scores (`local` si `score_local > score_visitante`, `visitante` si es al revés, `empate` si son iguales).
- [ ] `score_local` y `score_visitante` deben ser `>= 0`.
- [ ] Al crear, `es_correcto` queda en `null` hasta que el partido tenga resultado oficial.

**Impacto en BD:**
- **INSERT** → `pronosticos`
- **READ** → `partido` (validar fecha futura)
- **READ** → `pronosticos` (validar unicidad)

---

## ÉPICA 5 — CROMOS COLECCIONABLES

---

### US-11: Consulta de Colección de Cromos

**Descripción:**
Como **usuario**, quiero ver mi colección de cromos obtenidos para conocer qué tengo y qué me falta coleccionar.

**Criterios de Aceptación:**
- [ ] Retorna todos los cromos del perfil del usuario con: `nombre`, `frecuencia` (rareza), `url_imagen`, `pais`, `fecha` de obtención.
- [ ] Agrupa o filtra por rareza: `comun`, `raro`, `epico`.
- [ ] Muestra estadísticas: total de cromos, cantidad por rareza, porcentaje de completitud del álbum.
- [ ] Soporta paginación.

**Impacto en BD:**
- **READ** → `cromosperfil`, `cromos`, `paises`

---

### US-12: Catálogo Global de Cromos

**Descripción:**
Como **usuario**, quiero ver todos los cromos disponibles en el sistema para saber cuáles me faltan por coleccionar.

**Criterios de Aceptación:**
- [ ] Retorna el catálogo completo de `cromos` con su rareza e imagen.
- [ ] Para el usuario autenticado, indica si ya posee cada cromo.
- [ ] Filtrable por `frecuencia` (rareza) y `id_pais`.

**Impacto en BD:**
- **READ** → `cromos`, `cromosperfil`, `paises`

---

## ÉPICA 6 — PREMIOS Y CATÁLOGO PERSONALIZADO

---

### US-13: Catálogo de Premios Personalizado (ML)

**Descripción:**
Como **usuario**, quiero ver un catálogo de premios personalizados según mi perfil de consumo para canjear premios que me sean relevantes.

**Criterios de Aceptación:**
- [ ] El backend construye el **JSON de perfil ML** completo del usuario (datos de `persona` + `perfil`) y lo envía al microservicio de ML externo.
- [ ] El microservicio retorna la macrocategoría de mayor afinidad del usuario (ej. `tecnologia`, `viajes`, `gastronomia`).
- [ ] El sistema retorna los premios del catálogo filtrados por el `tag` correspondiente a esa macrocategoría.
- [ ] Los premios mostrados también se filtran por la liga del usuario (un usuario Bronce no ve premios Diamante).
- [ ] El costo en millas de cada premio se muestra junto a su equivalente en USD (`millas_costo * 0.01`).
- [ ] Si el microservicio ML no está disponible, el sistema retorna el catálogo general sin personalización (`200` con header `X-ML-Fallback: true`).

**Impacto en BD:**
- **READ** → `persona`, `perfil`, `premios`, `tag`, `liga`

---

### US-14: Canje de Premio

**Descripción:**
Como **usuario**, quiero canjear un premio usando mis millas acumuladas para obtener el beneficio seleccionado.

**Criterios de Aceptación:**
- [ ] El usuario debe tener suficientes `millas` para el canje; si no, retorna `402 Payment Required`.
- [ ] Las millas son la **única moneda válida** para canjear premios (los puntos no sirven para canje).
- [ ] Al canjear, se descuenta el costo del premio en millas de `perfil.millas`.
- [ ] Se registra el canje en `premios` con `id_perfil`, `id_liga` actual, `id_tag` del premio y `otorgado_en`.
- [ ] La operación es atómica (descuento de millas + registro de premio en la misma transacción).
- [ ] El balance de millas **nunca puede quedar negativo**; se usa un CHECK en BD más validación en aplicación.
- [ ] El DTO de canje usa `id_premios` (PK real de la tabla `premios`).

> ⚠️ **GAP DE DISEÑO EN BD**: La tabla `premios` actual **no tiene columna `millas_costo`**.
> Para que el canje por millas sea funcional se debe ejecutar el siguiente ALTER:
> ```sql
> ALTER TABLE public.premios
>   ADD COLUMN millas_costo integer NOT NULL DEFAULT 0 CHECK (millas_costo >= 0);
> ```
> Sin esta columna no es posible saber cuántas millas cuesta cada premio ni validar el saldo.

**Impacto en BD:**
- **UPDATE** → `perfil.millas` (descuento)
- **INSERT** → `premios` (campos: `id_perfil`, `id_liga`, `id_tag`, `otorgado_en`)
- **READ** → `perfil`, `premios` (por `id_premios`)

---

## ÉPICA 7 — TRANSFERENCIAS Y GRUPOS

---

### US-15: Registro de Transferencia Bancaria

**Descripción:**
Como **usuario**, quiero registrar transferencias entre cuentas del banco para que el sistema genere las millas y puntos correspondientes al emisor.

**Criterios de Aceptación:**
- [ ] El `monto` debe ser `> 0`; retorna `400 Bad Request` si no.
- [ ] `id_persona_emisora` e `id_persona_receptora` no pueden ser la misma persona; retorna `400 Bad Request`.
- [ ] Ambas personas deben existir; retorna `404 Not Found` si alguna no existe.
- [ ] Se calculan `mailes_generados` = `floor(monto) * 8` (misma regla que consumo).
- [ ] El estado inicial de la transferencia es `"Pendiente"`.
- [ ] Se actualiza `perfil.millas` del emisor con las millas generadas.

**Impacto en BD:**
- **INSERT** → `transferencias`
- **UPDATE** → `perfil.millas` (emisor)
- **INSERT** → `logs_puntos` (concepto `"TRANSFERENCIA"`)
- **READ** → `persona` (emisor y receptor)

---

### US-16: Gestión de Grupos

**Descripción:**
Como **usuario**, quiero crear o unirme a un grupo de amigos dentro del sistema para participar en la competencia grupal.

**Criterios de Aceptación:**
- [ ] Un usuario (perfil) puede crear un grupo; queda registrado como creador en `grupo.id_perfil`.
- [ ] Al crear/unirse a un grupo, se actualiza `persona.participo_en_grupo = true` y `persona.rol_en_grupo`.
- [ ] El nombre del grupo debe ser único; retorna `409 Conflict` si ya existe.
- [ ] Se puede consultar el ranking del grupo ordenado por puntos de sus miembros.

> ⚠️ **GAP DE DISEÑO EN BD**: La tabla `grupo` solo almacena el perfil **creador** (`grupo.id_perfil`).
> **No existe una tabla de membresía** que relacione múltiples perfiles con un grupo.
> La participación de un usuario en algún grupo se rastrea a nivel de persona mediante:
> - `persona.participo_en_grupo` (boolean)
> - `persona.rol_en_grupo` (USER-DEFINED enum)
>
> Sin embargo, **no hay FK** que indique a cuál grupo específico pertenece cada persona.
> Para implementar membresía completa se debe agregar a la BD:
> ```sql
> CREATE TABLE public.grupomiembro (
>   id_grupomiembro  serial PRIMARY KEY,
>   id_grupo         integer NOT NULL REFERENCES public.grupo(id_grupo),
>   id_perfil        integer NOT NULL REFERENCES public.perfil(id_perfil),
>   rol              character varying NOT NULL DEFAULT 'miembro',
>   fecha_ingreso    timestamp with time zone NOT NULL DEFAULT now(),
>   UNIQUE (id_grupo, id_perfil)
> );
> ```
> El endpoint `POST /grupos/{id}/miembros` y `GET /grupos/{id}` (ranking) dependen de esta tabla.

**Impacto en BD:**
- **INSERT** → `grupo`
- **UPDATE** → `persona` (participo_en_grupo, rol_en_grupo)
- **INSERT** → `grupomiembro` _(tabla a crear — ver gap de diseño arriba)_
- **READ** → `grupo`, `perfil`

---

## Resumen de Historias

| ID | Título | Épica | Prioridad |
|---|---|---|---|
| US-01 | Registro de Persona y Perfil | Identidad | Alta |
| US-02 | Consulta y Actualización de Perfil | Identidad | Alta |
| US-03 | Registro de Consumo y Recompensas | Economía | Alta |
| US-04 | Historial de Consumos | Economía | Media |
| US-05 | Ranking de Liga | Ligas | Alta |
| US-06 | Gestión de Temporada | Ligas | Alta |
| US-07 | Cierre de Temporada | Ligas | Alta |
| US-08 | Gestión de Partidos | Pronósticos | Alta |
| US-09 | Resultado de Partido | Pronósticos | Alta |
| US-10 | Registro de Pronóstico | Pronósticos | Alta |
| US-11 | Colección de Cromos del Usuario | Cromos | Media |
| US-12 | Catálogo Global de Cromos | Cromos | Baja |
| US-13 | Catálogo de Premios Personalizado (ML) | Premios | Alta |
| US-14 | Canje de Premio | Premios | Alta |
| US-15 | Registro de Transferencia | Transferencias | Media |
| US-16 | Gestión de Grupos | Grupos | Baja |

/**
 * DTOs — AI Bank Gamificación
 * Validaciones alineadas con las Reglas de Negocio del sistema.
 *
 * Uso con Express + express-validator o como referencia para Joi/Zod.
 * Cada DTO incluye la regla de negocio que valida en un comentario JSDoc.
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determina el ganador esperado basándose en los scores.
 * @param {number} local
 * @param {number} visitante
 * @returns {"local"|"visitante"|"empate"}
 */
function ganadorEsperado(local, visitante) {
  if (local > visitante) return 'local';
  if (visitante > local) return 'visitante';
  return 'empate';
}

/**
 * Calcula las millas generadas por un monto.
 * Regla: 8 Millas por cada $1 USD (floor).
 * @param {number} monto
 * @returns {number}
 */
function calcularMillas(monto) {
  return Math.floor(monto) * 8;
}

/**
 * Calcula los puntos generados por un monto.
 * Regla: 10 Puntos por cada $1 USD (floor).
 * @param {number} monto
 * @returns {number}
 */
function calcularPuntos(monto) {
  return Math.floor(monto) * 10;
}

/**
 * Calcula los cromos generados por un monto.
 * Regla: 1 Cromo por cada $10 USD (floor).
 * @param {number} monto
 * @returns {number}
 */
function calcularCromos(monto) {
  return Math.floor(monto / 10);
}

/**
 * Genera la rareza de un cromo según drop rates oficiales.
 * Regla: Común 75% | Raro 20% | Épico 5%
 * @returns {"comun"|"raro"|"epico"}
 */
function generarRarezaCromo() {
  const roll = Math.random() * 100;
  if (roll < 75) return 'comun';
  if (roll < 95) return 'raro';
  return 'epico';
}

/**
 * Determina la liga según los puntos acumulados.
 * Regla: Bronce 0-4999 | Plata 5000-14999 | Oro 15000-29999 | Diamante 30000+
 * @param {number} puntos
 * @returns {"Bronce"|"Plata"|"Oro"|"Diamante"}
 */
function calcularLiga(puntos) {
  if (puntos < 5000) return 'Bronce';
  if (puntos < 15000) return 'Plata';
  if (puntos < 30000) return 'Oro';
  return 'Diamante';
}

/**
 * Calcula el equivalente en USD de las millas.
 * Regla: 1 Milla = $0.01 USD.
 * @param {number} millas
 * @returns {number}
 */
function millasAUsd(millas) {
  return parseFloat((millas * 0.01).toFixed(2));
}

// ─────────────────────────────────────────────────────────────────────────────
// US-01 — REGISTRO DE PERSONA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para crear una persona nueva.
 * Regla: mail y numero_cuenta deben ser únicos (validación en BD).
 * Regla: Al crear persona, se crea perfil automáticamente con liga=Bronce.
 */
const createPersonaSchema = {
  nombre: {
    type: 'string',
    required: true,
    maxLength: 255,
    trim: true,
  },
  mail: {
    type: 'string',
    required: true,
    format: 'email',
    unique: true,
  },
  celular: {
    type: 'string',
    required: true,
  },
  numero_cuenta: {
    type: 'string',
    required: true,
    unique: true,
  },
  username: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 50,
    unique: true,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Username solo permite letras, números y guiones bajos.',
  },
  nacimiento: {
    type: 'string',
    format: 'date',
    required: false,
  },
  nacionalidad: { type: 'string', required: false },
  residencia: { type: 'string', required: false },
  ciudad: { type: 'string', required: false },
  empresa: { type: 'string', required: false },
  cargo: { type: 'string', required: false },
  edad: { type: 'integer', min: 0, max: 120, required: false },
  genero: {
    type: 'string',
    enum: ['M', 'F', 'otro'],
    required: false,
  },
  nivel_educacion: {
    type: 'string',
    enum: ['primaria', 'secundaria', 'universitario', 'posgrado', 'ninguno'],
    required: false,
  },
  ocupacion: { type: 'string', required: false },
  num_productos_bancarios: { type: 'integer', min: 0, default: 0 },
  score_crediticio: { type: 'number', min: 0, max: 1000, required: false },
  tiene_credito_activo: { type: 'boolean', default: false },
  tiene_cuenta_ahorro: { type: 'boolean', default: false },
  meses_sin_mora: { type: 'integer', min: 0, default: 0 },
  usa_app_movil: { type: 'boolean', default: false },
  notificaciones_activadas: { type: 'boolean', default: false },
  sesiones_app_semana: { type: 'integer', min: 0, default: 0 },
  dispositivo_preferido: {
    type: 'string',
    enum: ['Android', 'iOS', 'Web'],
    required: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// US-02 — ACTUALIZACIÓN DE PERFIL DEMOGRÁFICO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para actualizar datos demográficos de una persona.
 * Regla: NO puede modificar millas, puntos ni liga (campos solo del sistema).
 */
const updatePersonaSchema = {
  nombre: { type: 'string', maxLength: 255, required: false },
  nacimiento: { type: 'string', format: 'date', required: false },
  nacionalidad: { type: 'string', required: false },
  residencia: { type: 'string', required: false },
  celular: { type: 'string', required: false },
  empresa: { type: 'string', required: false },
  cargo: { type: 'string', required: false },
  ciudad: { type: 'string', required: false },
  nivel_educacion: {
    type: 'string',
    enum: ['primaria', 'secundaria', 'universitario', 'posgrado', 'ninguno'],
    required: false,
  },
  ocupacion: { type: 'string', required: false },
  usa_app_movil: { type: 'boolean', required: false },
  notificaciones_activadas: { type: 'boolean', required: false },
  sesiones_app_semana: { type: 'integer', min: 0, required: false },
  dispositivo_preferido: {
    type: 'string',
    enum: ['Android', 'iOS', 'Web'],
    required: false,
  },
  // CAMPOS BLOQUEADOS — nunca aceptar en este DTO:
  // millas, puntos, id_liga, mailes_acumuladas, predicciones_correctas_pct
};

// ─────────────────────────────────────────────────────────────────────────────
// US-03 — REGISTRO DE CONSUMO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para registrar un consumo.
 *
 * Reglas embebidas:
 * - monto > 0 (requerido)
 * - Sistema calcula automáticamente:
 *   - millas = floor(monto) * 8
 *   - puntos = floor(monto) * 10
 *   - cromos = floor(monto / 10) con rareza aleatoria
 */
const createConsumoSchema = {
  id_persona: {
    type: 'integer',
    required: true,
    min: 1,
  },
  monto: {
    type: 'number',
    required: true,
    min: 0.01,
    message: 'El monto debe ser mayor a 0.',
  },
  descripcion: { type: 'string', required: false },
  id_producto_persona: { type: 'integer', required: false, min: 1 },
  ubicacion: { type: 'string', required: false },
  diferido: { type: 'boolean', default: false },
  id_tag: { type: 'integer', required: false, min: 1 },
};

/**
 * Calcula todas las recompensas de un consumo.
 * @param {number} monto
 * @returns {{ millas: number, puntos: number, cromos: Array<{rareza: string}> }}
 */
function calcularRecompensasConsumo(monto) {
  const millas = calcularMillas(monto);
  const puntos = calcularPuntos(monto);
  const cantidadCromos = calcularCromos(monto);

  const cromos = Array.from({ length: cantidadCromos }, () => ({
    rareza: generarRarezaCromo(),
  }));

  return { millas, puntos, cromos };
}

// ─────────────────────────────────────────────────────────────────────────────
// US-06 — CREACIÓN DE TEMPORADA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para crear una temporada.
 * Regla: fecha_fin > fecha_inicio.
 * Regla: Solo puede existir una temporada activa a la vez.
 */
const createTemporadaSchema = {
  nombre: {
    type: 'string',
    required: true,
    maxLength: 255,
  },
  fecha_inicio: {
    type: 'string',
    format: 'date',
    required: true,
  },
  fecha_fin: {
    type: 'string',
    format: 'date',
    required: true,
    validate: (fechaFin, body) => {
      if (new Date(fechaFin) <= new Date(body.fecha_inicio)) {
        return 'La fecha_fin debe ser posterior a fecha_inicio.';
      }
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// US-08 — CREACIÓN DE PARTIDO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para crear un partido.
 * Regla: id_pais_local !== id_pais_visitante.
 * Regla: Solo partidos con fecha futura son elegibles para pronósticos.
 */
const createPartidoSchema = {
  id_pais_local: {
    type: 'integer',
    required: true,
    min: 1,
  },
  id_pais_visitante: {
    type: 'integer',
    required: true,
    min: 1,
    validate: (visitante, body) => {
      if (visitante === body.id_pais_local) {
        return 'El equipo local y visitante no pueden ser el mismo país.';
      }
    },
  },
  fecha: {
    type: 'string',
    format: 'date-time',
    required: true,
  },
  id_temporada: {
    type: 'integer',
    required: true,
    min: 1,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// US-09 — RESULTADO DE PARTIDO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para ingresar el resultado oficial de un partido.
 * Regla: El ganador debe ser consistente con los goles.
 */
const resultadoPartidoSchema = {
  goles_local: {
    type: 'integer',
    required: true,
    min: 0,
  },
  goles_visitante: {
    type: 'integer',
    required: true,
    min: 0,
  },
  ganador: {
    type: 'string',
    enum: ['local', 'visitante', 'empate'],
    required: true,
    validate: (ganador, body) => {
      const esperado = ganadorEsperado(body.goles_local, body.goles_visitante);
      if (ganador !== esperado) {
        return `El campo 'ganador' es inconsistente. Con ${body.goles_local}-${body.goles_visitante} el ganador debe ser '${esperado}'.`;
      }
    },
  },
};

/**
 * Evalúa si un pronóstico es correcto contra el resultado oficial.
 * Regla: Acierto exacto = score_local + score_visitante + ganador coinciden → 500 puntos.
 * Regla: Fallo → 0 puntos. Sin deducciones.
 *
 * @param {{ score_local: number, score_visitante: number, ganador: string }} pronostico
 * @param {{ goles_local: number, goles_visitante: number, ganador: string }} resultado
 * @returns {{ es_correcto: boolean, puntos_ganados: number }}
 */
function evaluarPronostico(pronostico, resultado) {
  const es_correcto =
    pronostico.score_local === resultado.goles_local &&
    pronostico.score_visitante === resultado.goles_visitante &&
    pronostico.ganador === resultado.ganador;

  return {
    es_correcto,
    puntos_ganados: es_correcto ? 500 : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// US-10 — PRONÓSTICO DE PARTIDO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para registrar un pronóstico.
 *
 * Reglas embebidas:
 * - El partido debe tener fecha futura (validación en service).
 * - Un perfil solo puede tener un pronóstico por partido.
 * - El ganador debe ser consistente con los scores.
 */
const createPronosticoSchema = {
  id_perfil: {
    type: 'integer',
    required: true,
    min: 1,
  },
  id_partido: {
    type: 'integer',
    required: true,
    min: 1,
  },
  score_local: {
    type: 'integer',
    required: true,
    min: 0,
  },
  score_visitante: {
    type: 'integer',
    required: true,
    min: 0,
  },
  ganador: {
    type: 'string',
    enum: ['local', 'visitante', 'empate'],
    required: true,
    validate: (ganador, body) => {
      const esperado = ganadorEsperado(body.score_local, body.score_visitante);
      if (ganador !== esperado) {
        return `El campo 'ganador' es inconsistente con los scores indicados. Debería ser '${esperado}'.`;
      }
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// US-14 — CANJE DE PREMIO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para canjear un premio.
 *
 * Reglas embebidas:
 * - Las MILLAS son la única moneda válida para canje (puntos no sirven).
 * - El saldo de millas del perfil debe ser >= costo del premio.
 * - El balance nunca puede quedar negativo.
 */
const canjearPremioSchema = {
  id_perfil: {
    type: 'integer',
    required: true,
    min: 1,
  },
  // PK real de la tabla `premios`: id_premios (corregido desde id_premio_catalogo)
  id_premios: {
    type: 'integer',
    required: true,
    min: 1,
  },
};

/**
 * Valida si un perfil tiene suficientes millas para el canje.
 * @param {number} millasActuales
 * @param {number} costoMillas
 * @returns {{ valido: boolean, mensaje?: string }}
 */
function validarSaldoMillas(millasActuales, costoMillas) {
  if (millasActuales < costoMillas) {
    return {
      valido: false,
      mensaje: `Millas insuficientes. Necesitas ${costoMillas.toLocaleString()} millas pero tienes ${millasActuales.toLocaleString()}.`,
    };
  }
  return { valido: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// US-15 — TRANSFERENCIA BANCARIA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para registrar una transferencia.
 *
 * Reglas embebidas:
 * - monto > 0.
 * - id_persona_emisora !== id_persona_receptora.
 * - Genera millas al emisor: floor(monto) * 8.
 * - Estado inicial: "Pendiente".
 */
const createTransferenciaSchema = {
  id_persona_emisora: {
    type: 'integer',
    required: true,
    min: 1,
  },
  id_persona_receptora: {
    type: 'integer',
    required: true,
    min: 1,
    validate: (receptora, body) => {
      if (receptora === body.id_persona_emisora) {
        return 'El emisor y receptor no pueden ser la misma persona.';
      }
    },
  },
  monto: {
    type: 'number',
    required: true,
    min: 0.01,
    message: 'El monto debe ser mayor a 0.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// US-16 — GRUPOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DTO para crear un grupo.
 * Regla: El nombre del grupo debe ser único.
 */
const createGrupoSchema = {
  nombre: {
    type: 'string',
    required: true,
    maxLength: 255,
    trim: true,
  },
  id_perfil: {
    type: 'integer',
    required: true,
    min: 1,
    description: 'Perfil creador. Tendrá rol "lider" automáticamente.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD ML — Segmentación de Premios (US-13)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construye el payload JSON que se envía al microservicio ML externo.
 * Toma los datos de `persona` + `perfil` de la BD y los mapea al contrato del modelo.
 *
 * MAPEOS IMPORTANTES (campo BD → clave ML):
 * - `persona.antiguedad_clientes_meses`  → `antiguedad_cliente_meses`  (BD tiene 's', ML no la tiene)
 * - `persona.mailes_acumuladas`          → NO SE USA. El ML recibe `mailes_acumulados` = perfil.millas
 *                                          (perfil.millas = balance actual | persona.mailes_acumuladas = histórico total)
 *
 * @param {Object} persona - Registro de la tabla `persona`
 * @param {Object} perfil  - Registro de la tabla `perfil` (incluye liga y millas actuales)
 * @returns {Object} Payload listo para el microservicio ML
 */
function buildMlPayload(persona, perfil) {
  return {
    liga_tier: perfil.liga?.nombre ?? 'Bronce',
    gasto_mensual_usd: persona.gasto_mensual_usd ?? 0,
    frecuencia_transacciones_mes: persona.frecuencia_transacciones_mes ?? 0,
    // BD: persona.antiguedad_clientes_meses (con 's') → ML contract: antiguedad_cliente_meses (sin 's')
    antiguedad_cliente_meses: persona.antiguedad_clientes_meses ?? 0,
    num_productos_bancarios: persona.num_productos_bancarios ?? 0,
    score_crediticio: persona.score_crediticio ?? 0,
    tiene_credito_activo: persona.tiene_credito_activo ? 1 : 0,
    tiene_cuenta_ahorro: persona.tiene_cuenta_ahorro ? 1 : 0,
    meses_sin_mora: persona.meses_sin_mora ?? 0,
    pct_gasto_tecnologia: persona.pct_gasto_tecnologia ?? 0,
    pct_gasto_viajes: persona.pct_gasto_viajes ?? 0,
    pct_gasto_restaurantes: persona.pct_gasto_restaurantes ?? 0,
    pct_gasto_entretenimiento: persona.pct_gasto_entretenimiento ?? 0,
    pct_gasto_supermercado: persona.pct_gasto_supermercado ?? 0,
    pct_gasto_salud: persona.pct_gasto_salud ?? 0,
    pct_gasto_educacion: persona.pct_gasto_educacion ?? 0,
    pct_gasto_hogar: persona.pct_gasto_hogar ?? 0,
    pct_gasto_otros: persona.pct_gasto_otros ?? 0,
    medalla_final: persona.medalla_final ?? 0,
    estrellas_finales: persona.estrellas_finales ?? 0,
    // BD: perfil.millas (balance actual) → ML contract: mailes_acumulados
    // NOTA: persona.mailes_acumuladas existe en BD pero es el histórico total, no el balance activo.
    //       El ML recibe el balance del perfil para segmentación más precisa.
    mailes_acumulados: perfil.millas ?? 0,
    predicciones_correctas_pct: persona.predicciones_correctas_pct ?? 0,
    racha_maxima_predicciones: persona.racha_maxima_predicciones ?? 0,
    cromos_coleccionados: persona.cromos_coleccionados ?? 0,
    cromos_epicos_obtenidos: persona.cromos_epicos_obtenidos ?? 0,
    objetivos_completados: persona.objetivos_completados ?? 0,
    participo_en_grupo: persona.participo_en_grupo ? 1 : 0,
    rol_en_grupo: persona.rol_en_grupo ?? 'ninguno',
    votos_emitidos: persona.votos_emitidos ?? 0,
    dias_activo_temporada: persona.dias_activo_temporada ?? 0,
    edad: persona.edad ?? 0,
    genero: persona.genero ?? 'otro',
    ciudad: persona.ciudad ?? '',
    nivel_educacion: persona.nivel_educacion ?? 'ninguno',
    ocupacion: persona.ocupacion ?? '',
    usa_app_movil: persona.usa_app_movil ? 1 : 0,
    sesiones_app_semana: persona.sesiones_app_semana ?? 0,
    notificaciones_activadas: persona.notificaciones_activadas ? 1 : 0,
    compras_online_pct: persona.compras_online_pct ?? 0,
    dispositivo_preferido: persona.dispositivo_preferido ?? 'Web',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Schemas (estructuras de validación)
  createPersonaSchema,
  updatePersonaSchema,
  createConsumoSchema,
  createTemporadaSchema,
  createPartidoSchema,
  resultadoPartidoSchema,
  createPronosticoSchema,
  canjearPremioSchema,
  createTransferenciaSchema,
  createGrupoSchema,

  // Lógica de negocio reutilizable
  calcularMillas,
  calcularPuntos,
  calcularCromos,
  generarRarezaCromo,
  calcularLiga,
  millasAUsd,
  ganadorEsperado,
  calcularRecompensasConsumo,
  evaluarPronostico,
  validarSaldoMillas,
  buildMlPayload,

  // Constantes de negocio
  PUNTOS_POR_PRONOSTICO_CORRECTO: 500,
  MILLAS_POR_USD: 8,
  PUNTOS_POR_USD: 10,
  CROMOS_POR_USD: 0.1,       // 1 cromo cada $10
  VALOR_MILLA_USD: 0.01,
  LIGAS: {
    BRONCE: { nombre: 'Bronce', min: 0, max: 4999 },
    PLATA:  { nombre: 'Plata',  min: 5000, max: 14999 },
    ORO:    { nombre: 'Oro',    min: 15000, max: 29999 },
    DIAMANTE: { nombre: 'Diamante', min: 30000, max: Infinity },
  },
  DROP_RATES: {
    COMUN: 75,
    RARO: 20,
    EPICO: 5,
  },
};

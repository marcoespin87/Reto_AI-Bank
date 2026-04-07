// Entidad de dominio: Persona
// Tabla BD: persona (id_persona, nombre, mail, celular, numero_cuenta, ...)
class Persona {
  constructor(data) {
    this.id_persona              = data.id_persona;
    this.nombre                  = data.nombre;
    this.mail                    = data.mail;
    this.celular                 = data.celular;
    this.numero_cuenta           = data.numero_cuenta;
    this.nacimiento              = data.nacimiento;
    this.nacionalidad            = data.nacionalidad;
    this.residencia              = data.residencia;
    this.ciudad                  = data.ciudad;
    this.empresa                 = data.empresa;
    this.cargo                   = data.cargo;
    this.edad                    = data.edad;
    this.genero                  = data.genero;
    this.nivel_educacion         = data.nivel_educacion;
    this.ocupacion               = data.ocupacion;
    this.num_productos_bancarios = data.num_productos_bancarios || 0;
    this.score_crediticio        = data.score_crediticio;
    this.tiene_credito_activo    = data.tiene_credito_activo || false;
    this.tiene_cuenta_ahorro     = data.tiene_cuenta_ahorro || false;
    this.meses_sin_mora          = data.meses_sin_mora || 0;
    this.mailes_acumuladas       = data.mailes_acumuladas || 0;
    this.medalla_final           = data.medalla_final;
    this.estrellas_finales       = data.estrellas_finales || 0;
    this.predicciones_correctas_pct  = data.predicciones_correctas_pct;
    this.racha_maxima_predicciones   = data.racha_maxima_predicciones || 0;
    this.cromos_coleccionados        = data.cromos_coleccionados || 0;
    this.cromos_epicos_obtenidos     = data.cromos_epicos_obtenidos || 0;
    this.objetivos_completados       = data.objetivos_completados || 0;
    this.participo_en_grupo          = data.participo_en_grupo || false;
    this.rol_en_grupo                = data.rol_en_grupo;
    this.votos_emitidos              = data.votos_emitidos || 0;
    this.dias_activo_temporada       = data.dias_activo_temporada || 0;
    this.gasto_mensual_usd           = data.gasto_mensual_usd || 0;
    this.frecuencia_transacciones_mes   = data.frecuencia_transacciones_mes || 0;
    this.antiguedad_clientes_meses      = data.antiguedad_clientes_meses || 0;
    this.pct_gasto_tecnologia           = data.pct_gasto_tecnologia || 0;
    this.pct_gasto_viajes               = data.pct_gasto_viajes || 0;
    this.pct_gasto_restaurantes         = data.pct_gasto_restaurantes || 0;
    this.pct_gasto_entretenimiento      = data.pct_gasto_entretenimiento || 0;
    this.pct_gasto_supermercado         = data.pct_gasto_supermercado || 0;
    this.pct_gasto_salud                = data.pct_gasto_salud || 0;
    this.pct_gasto_educacion            = data.pct_gasto_educacion || 0;
    this.pct_gasto_hogar                = data.pct_gasto_hogar || 0;
    this.pct_gasto_otros                = data.pct_gasto_otros || 0;
    this.usa_app_movil                  = data.usa_app_movil || false;
    this.notificaciones_activadas       = data.notificaciones_activadas || false;
    this.sesiones_app_semana            = data.sesiones_app_semana || 0;
    this.compras_online_pct             = data.compras_online_pct;
    this.dispositivo_preferido          = data.dispositivo_preferido;
    this.fecha_creacion                 = data.fecha_creacion;
    this.updated_at                     = data.updated_at;
  }
}
module.exports = Persona;

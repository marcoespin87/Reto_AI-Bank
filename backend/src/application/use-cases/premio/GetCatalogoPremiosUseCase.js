const MLServiceAdapter = require('../../../infrastructure/external/MLServiceAdapter');

class GetCatalogoPremiosUseCase {
  constructor({ premioRepository, perfilRepository, personaRepository }) {
    this.premioRepo = premioRepository;
    this.perfilRepo = perfilRepository;
    this.personaRepo = personaRepository;
    this.mlAdapter = new MLServiceAdapter();
  }

  /**
   * Build ML payload inline (based on dtos.js logic)
   */
  _buildMlPayload(persona, perfil) {
    return {
      edad: persona.edad || null,
      genero: persona.genero || null,
      nivel_educacion: persona.nivel_educacion || null,
      ocupacion: persona.ocupacion || null,
      empresa: persona.empresa || null,
      cargo: persona.cargo || null,
      nacionalidad: persona.nacionalidad || null,
      residencia: persona.residencia || null,
      ciudad: persona.ciudad || null,
      num_productos_bancarios: persona.num_productos_bancarios || 0,
      score_crediticio: persona.score_crediticio || null,
      tiene_credito_activo: persona.tiene_credito_activo || false,
      tiene_cuenta_ahorro: persona.tiene_cuenta_ahorro || false,
      meses_sin_mora: persona.meses_sin_mora || 0,
      usa_app_movil: persona.usa_app_movil || false,
      notificaciones_activadas: persona.notificaciones_activadas || false,
      sesiones_app_semana: persona.sesiones_app_semana || 0,
      dispositivo_preferido: persona.dispositivo_preferido || null,
      millas: parseFloat(perfil.millas || 0),
      puntos: parseInt(perfil.puntos, 10) || 0,
      liga: perfil.liga_nombre || 'Bronce'
    };
  }

  async execute(options = {}, responseHeaders = {}) {
    const { id_perfil } = options;

    let perfil = null;
    let persona = null;
    let mlFallback = false;
    let mlCategoria = null;

    if (id_perfil) {
      perfil = await this.perfilRepo.findById(id_perfil);
      if (!perfil) {
        throw { status: 404, message: `Perfil con id ${id_perfil} no encontrado.` };
      }

      persona = await this.personaRepo.findById(perfil.id_persona);

      // Try ML classification
      try {
        const payload = this._buildMlPayload(persona, perfil);
        const mlResult = await this.mlAdapter.clasificarUsuario(payload);

        if (mlResult && !mlResult.fallback && mlResult.categoria) {
          mlCategoria = mlResult.categoria;
        } else {
          mlFallback = true;
        }
      } catch (e) {
        mlFallback = true;
      }
    }

    // Build filter options for premios
    const filterOptions = {};
    if (perfil) {
      filterOptions.id_liga = perfil.id_liga;
    }
    // If ML returned a category we could map it to id_tag, but since the mapping
    // is not defined, we use it for logging only and keep liga filter
    if (mlCategoria) {
      filterOptions.ml_categoria = mlCategoria;
    }

    const premios = await this.premioRepo.findCatalogo(filterOptions);

    // Set fallback header if needed
    if (mlFallback) {
      responseHeaders['X-ML-Fallback'] = 'true';
    }

    return {
      premios,
      ml_categoria: mlCategoria,
      ml_fallback: mlFallback
    };
  }
}

module.exports = GetCatalogoPremiosUseCase;

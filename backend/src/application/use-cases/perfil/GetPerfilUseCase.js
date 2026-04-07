class GetPerfilUseCase {
  constructor({ perfilRepository }) {
    this.perfilRepo = perfilRepository;
  }

  _enrich(perfil) {
    return {
      ...perfil,
      millas_usd_equivalente: parseFloat((parseFloat(perfil.millas || 0) * 0.01).toFixed(2)),
      liga: {
        id_liga:      perfil.id_liga,
        nombre:       perfil.liga_nombre,
        rango_inicio: perfil.rango_inicio,
        rango_fin:    perfil.rango_fin,
      },
    };
  }

  async executeById(id) {
    const perfil = await this.perfilRepo.findById(id);
    if (!perfil) {
      throw { status: 404, message: `Perfil con id ${id} no encontrado.` };
    }
    return this._enrich(perfil);
  }

  async executeByPersonaId(idPersona) {
    const perfil = await this.perfilRepo.findByPersonaId(idPersona);
    if (!perfil) {
      throw { status: 404, message: `Perfil para persona ${idPersona} no encontrado.` };
    }
    return this._enrich(perfil);
  }
}

module.exports = GetPerfilUseCase;

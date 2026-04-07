class GetPronosticosUseCase {
  constructor({ pronosticoRepository, perfilRepository }) {
    this.pronosticoRepo = pronosticoRepository;
    this.perfilRepo = perfilRepository;
  }

  async executeByPerfil(idPerfil, options = {}) {
    const perfil = await this.perfilRepo.findById(idPerfil);
    if (!perfil) {
      throw { status: 404, message: `Perfil con id ${idPerfil} no encontrado.` };
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;

    const { rows, total } = await this.pronosticoRepo.findByPerfilId(idPerfil, {
      page,
      limit,
      id_temporada: options.id_temporada
    });

    return {
      pronosticos: rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  async executeById(id) {
    const pronostico = await this.pronosticoRepo.findById(id);
    if (!pronostico) {
      throw { status: 404, message: `Pronostico con id ${id} no encontrado.` };
    }
    return pronostico;
  }
}

module.exports = GetPronosticosUseCase;

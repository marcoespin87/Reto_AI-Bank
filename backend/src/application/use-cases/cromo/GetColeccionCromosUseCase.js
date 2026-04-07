class GetColeccionCromosUseCase {
  constructor({ cromoRepository, perfilRepository }) {
    this.cromoRepo = cromoRepository;
    this.perfilRepo = perfilRepository;
  }

  async execute(idPerfil, options = {}) {
    const perfil = await this.perfilRepo.findById(idPerfil);
    if (!perfil) {
      throw { status: 404, message: `Perfil con id ${idPerfil} no encontrado.` };
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const { frecuencia } = options;

    const { rows, total } = await this.cromoRepo.findColeccionByPerfil(idPerfil, { frecuencia, page, limit });
    const totalCromos = await this.cromoRepo.countTotal();
    const totalPerfil = await this.cromoRepo.countTotalByPerfil(idPerfil);

    return {
      perfil: {
        id_perfil: perfil.id_perfil,
        username: perfil.username
      },
      coleccion: rows,
      stats: {
        total_obtenidos: totalPerfil,
        total_catalogo: totalCromos,
        porcentaje_completado: totalCromos > 0
          ? parseFloat(((totalPerfil / totalCromos) * 100).toFixed(2))
          : 0
      },
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = GetColeccionCromosUseCase;

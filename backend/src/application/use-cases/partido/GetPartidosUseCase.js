class GetPartidosUseCase {
  constructor({ partidoRepository }) {
    this.partidoRepo = partidoRepository;
  }

  async executeAll(options = {}) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const { id_temporada, solo_futuros } = options;

    const { rows, total } = await this.partidoRepo.findAll({
      id_temporada,
      solo_futuros,
      page,
      limit
    });

    return {
      partidos: rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  async executeById(id) {
    const partido = await this.partidoRepo.findById(id);
    if (!partido) {
      throw { status: 404, message: `Partido con id ${id} no encontrado.` };
    }
    return partido;
  }
}

module.exports = GetPartidosUseCase;

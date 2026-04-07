class GetRankingLigaUseCase {
  constructor({ ligaRepository }) {
    this.ligaRepo = ligaRepository;
  }

  async executeByLiga(idLiga, options = {}) {
    const liga = await this.ligaRepo.findById(idLiga);
    if (!liga) {
      throw { status: 404, message: `Liga con id ${idLiga} no encontrada.` };
    }

    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;

    const { rows, total } = await this.ligaRepo.getRanking(idLiga, { page, limit });

    return {
      liga,
      ranking: rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  async executeGlobal(options = {}) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;

    const { rows, total } = await this.ligaRepo.getRankingGlobal({ page, limit });

    return {
      ranking: rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = GetRankingLigaUseCase;

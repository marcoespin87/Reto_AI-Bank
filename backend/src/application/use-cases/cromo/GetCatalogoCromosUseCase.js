class GetCatalogoCromosUseCase {
  constructor({ cromoRepository }) {
    this.cromoRepo = cromoRepository;
  }

  async execute(options = {}) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const { frecuencia, id_pais } = options;

    const { rows, total } = await this.cromoRepo.findAll({ frecuencia, id_pais, page, limit });
    const totalCromos = await this.cromoRepo.countTotal();

    return {
      cromos: rows,
      total_catalogo: totalCromos,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = GetCatalogoCromosUseCase;

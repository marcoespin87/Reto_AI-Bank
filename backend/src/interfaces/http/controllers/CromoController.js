class CromoController {
  constructor({ getCatalogoCromosUseCase, getColeccionCromosUseCase }) {
    this.getCatalogoCromosUseCase = getCatalogoCromosUseCase;
    this.getColeccionCromosUseCase = getColeccionCromosUseCase;
  }

  async getCatalogo(req, res, next) {
    try {
      const result = await this.getCatalogoCromosUseCase.execute(req.query);
      return res.status(200).json({
        success: true,
        data: result.cromos,
        total_catalogo: result.total_catalogo,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getColeccion(req, res, next) {
    try {
      const result = await this.getColeccionCromosUseCase.execute(req.params.id_perfil, req.query);
      return res.status(200).json({
        success: true,
        data: result.coleccion,
        perfil: result.perfil,
        stats: result.stats,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CromoController;

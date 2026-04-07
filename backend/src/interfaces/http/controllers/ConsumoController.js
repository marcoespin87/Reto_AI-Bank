class ConsumoController {
  constructor({ createConsumoUseCase, getHistorialConsumoUseCase }) {
    this.createConsumoUseCase = createConsumoUseCase;
    this.getHistorialConsumoUseCase = getHistorialConsumoUseCase;
  }

  async create(req, res, next) {
    try {
      const result = await this.createConsumoUseCase.execute(req.body);
      return res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async findByPersonaId(req, res, next) {
    try {
      const result = await this.getHistorialConsumoUseCase.execute(
        req.params.id_persona,
        req.query
      );
      return res.status(200).json({
        success: true,
        data: result.consumos,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ConsumoController;

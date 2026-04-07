class TransferenciaController {
  constructor({ createTransferenciaUseCase, getHistorialTransferenciasUseCase }) {
    this.createTransferenciaUseCase = createTransferenciaUseCase;
    this.getHistorialTransferenciasUseCase = getHistorialTransferenciasUseCase;
  }

  async create(req, res, next) {
    try {
      const result = await this.createTransferenciaUseCase.execute(req.body);
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
      const result = await this.getHistorialTransferenciasUseCase.execute(
        req.params.id_persona,
        req.query
      );
      return res.status(200).json({
        success: true,
        data: result.transferencias,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TransferenciaController;

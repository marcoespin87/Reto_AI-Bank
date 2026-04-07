class TemporadaController {
  constructor({ createTemporadaUseCase, getTemporadasUseCase, cerrarTemporadaUseCase }) {
    this.createTemporadaUseCase = createTemporadaUseCase;
    this.getTemporadasUseCase = getTemporadasUseCase;
    this.cerrarTemporadaUseCase = cerrarTemporadaUseCase;
  }

  async findAll(req, res, next) {
    try {
      const result = await this.getTemporadasUseCase.executeAll();
      return res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await this.createTemporadaUseCase.execute(req.body);
      return res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async findActiva(req, res, next) {
    try {
      const result = await this.getTemporadasUseCase.executeActiva();
      return res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async cerrar(req, res, next) {
    try {
      const result = await this.cerrarTemporadaUseCase.execute(req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TemporadaController;

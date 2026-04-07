class PronosticoController {
  constructor({ createPronosticoUseCase, getPronosticosUseCase }) {
    this.createPronosticoUseCase = createPronosticoUseCase;
    this.getPronosticosUseCase = getPronosticosUseCase;
  }

  async create(req, res, next) {
    try {
      const result = await this.createPronosticoUseCase.execute(req.body);
      return res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async findByPerfil(req, res, next) {
    try {
      const result = await this.getPronosticosUseCase.executeByPerfil(req.params.id_perfil, req.query);
      return res.status(200).json({
        success: true,
        data: result.pronosticos,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const result = await this.getPronosticosUseCase.executeById(req.params.id);
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

module.exports = PronosticoController;

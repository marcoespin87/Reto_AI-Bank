class PartidoController {
  constructor({ createPartidoUseCase, getPartidosUseCase, setResultadoPartidoUseCase }) {
    this.createPartidoUseCase = createPartidoUseCase;
    this.getPartidosUseCase = getPartidosUseCase;
    this.setResultadoPartidoUseCase = setResultadoPartidoUseCase;
  }

  async findAll(req, res, next) {
    try {
      const result = await this.getPartidosUseCase.executeAll(req.query);
      return res.status(200).json({
        success: true,
        data: result.partidos,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await this.createPartidoUseCase.execute(req.body);
      return res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async findById(req, res, next) {
    try {
      const result = await this.getPartidosUseCase.executeById(req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async setResultado(req, res, next) {
    try {
      const result = await this.setResultadoPartidoUseCase.execute(req.params.id, req.body);
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

module.exports = PartidoController;

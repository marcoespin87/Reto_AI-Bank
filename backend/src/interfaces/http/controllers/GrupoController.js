class GrupoController {
  constructor({ createGrupoUseCase, getGrupoUseCase, joinGrupoUseCase }) {
    this.createGrupoUseCase = createGrupoUseCase;
    this.getGrupoUseCase = getGrupoUseCase;
    this.joinGrupoUseCase = joinGrupoUseCase;
  }

  async create(req, res, next) {
    try {
      const result = await this.createGrupoUseCase.execute(req.body);
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
      const result = await this.getGrupoUseCase.execute(req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async join(req, res, next) {
    try {
      const result = await this.joinGrupoUseCase.execute(req.params.id, req.body);
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

module.exports = GrupoController;

class PerfilController {
  constructor({ getPerfilUseCase }) {
    this.getPerfilUseCase = getPerfilUseCase;
  }

  async findById(req, res, next) {
    try {
      const result = await this.getPerfilUseCase.executeById(req.params.id);
      return res.status(200).json({
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
      const result = await this.getPerfilUseCase.executeByPersonaId(req.params.id_persona);
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

module.exports = PerfilController;

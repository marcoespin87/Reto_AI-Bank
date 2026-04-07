class PersonaController {
  constructor({ createPersonaUseCase, getPersonaUseCase, updatePersonaUseCase }) {
    this.createPersonaUseCase = createPersonaUseCase;
    this.getPersonaUseCase = getPersonaUseCase;
    this.updatePersonaUseCase = updatePersonaUseCase;
  }

  async create(req, res, next) {
    try {
      const result = await this.createPersonaUseCase.execute(req.body);
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
      const result = await this.getPersonaUseCase.execute(req.params.id);
      return res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const result = await this.updatePersonaUseCase.execute(req.params.id, req.body);
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

module.exports = PersonaController;

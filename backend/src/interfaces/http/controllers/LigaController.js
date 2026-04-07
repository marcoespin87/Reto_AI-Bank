class LigaController {
  constructor({ getLigasUseCase, getRankingLigaUseCase }) {
    this.getLigasUseCase = getLigasUseCase;
    this.getRankingLigaUseCase = getRankingLigaUseCase;
  }

  async findAll(req, res, next) {
    try {
      const result = await this.getLigasUseCase.execute();
      return res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getRanking(req, res, next) {
    try {
      const result = await this.getRankingLigaUseCase.executeByLiga(req.params.id, req.query);
      return res.status(200).json({
        success: true,
        data: result.ranking,
        liga: result.liga,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async getRankingGlobal(req, res, next) {
    try {
      const result = await this.getRankingLigaUseCase.executeGlobal(req.query);
      return res.status(200).json({
        success: true,
        data: result.ranking,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LigaController;

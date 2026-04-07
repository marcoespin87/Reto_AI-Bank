class PremioController {
  constructor({ getCatalogoPremiosUseCase, canjearPremioUseCase }) {
    this.getCatalogoPremiosUseCase = getCatalogoPremiosUseCase;
    this.canjearPremioUseCase = canjearPremioUseCase;
  }

  async getCatalogo(req, res, next) {
    try {
      const headers = {};
      const result = await this.getCatalogoPremiosUseCase.execute(req.query, headers);

      // Set ML fallback header if needed
      if (headers['X-ML-Fallback']) {
        res.set('X-ML-Fallback', headers['X-ML-Fallback']);
      }

      return res.status(200).json({
        success: true,
        data: result.premios,
        ml_categoria: result.ml_categoria,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async canjear(req, res, next) {
    try {
      const result = await this.canjearPremioUseCase.execute(req.body);
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

module.exports = PremioController;

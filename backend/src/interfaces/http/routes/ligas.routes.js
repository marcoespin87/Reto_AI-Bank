const { Router } = require('express');
const { param, query } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.ligaController;

  router.get('/', (req, res, next) => ctrl.findAll(req, res, next));

  router.get(
    '/ranking/global',
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    validate,
    (req, res, next) => ctrl.getRankingGlobal(req, res, next)
  );

  router.get(
    '/:id/ranking',
    [
      param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo'),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    validate,
    (req, res, next) => ctrl.getRanking(req, res, next)
  );

  return router;
};

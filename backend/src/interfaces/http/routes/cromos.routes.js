const { Router } = require('express');
const { param, query } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.cromoController;

  router.get(
    '/',
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('frecuencia').optional().isIn(['comun', 'raro', 'epico']).withMessage('frecuencia debe ser comun, raro o epico')
    ],
    validate,
    (req, res, next) => ctrl.getCatalogo(req, res, next)
  );

  router.get(
    '/perfil/:id_perfil',
    [
      param('id_perfil').isInt({ min: 1 }).withMessage('id_perfil debe ser un entero positivo'),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    validate,
    (req, res, next) => ctrl.getColeccion(req, res, next)
  );

  return router;
};

const { Router } = require('express');
const { body, query } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.premioController;

  router.get(
    '/',
    [
      query('id_perfil').optional().isInt({ min: 1 }).withMessage('id_perfil debe ser un entero positivo')
    ],
    validate,
    (req, res, next) => ctrl.getCatalogo(req, res, next)
  );

  router.post(
    '/canjear',
    [
      body('id_perfil').isInt({ min: 1 }).withMessage('id_perfil es requerido'),
      body('id_premios').isInt({ min: 1 }).withMessage('id_premios es requerido')
    ],
    validate,
    (req, res, next) => ctrl.canjear(req, res, next)
  );

  return router;
};

const { Router } = require('express');
const { param } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.perfilController;

  router.get(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo')],
    validate,
    (req, res, next) => ctrl.findById(req, res, next)
  );

  router.get(
    '/persona/:id_persona',
    [param('id_persona').isInt({ min: 1 }).withMessage('id_persona debe ser un entero positivo')],
    validate,
    (req, res, next) => ctrl.findByPersonaId(req, res, next)
  );

  return router;
};

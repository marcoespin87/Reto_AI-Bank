const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.transferenciaController;

  router.post(
    '/',
    [
      body('id_persona_emisora').isInt({ min: 1 }).withMessage('id_persona_emisora es requerido'),
      body('id_persona_receptora').isInt({ min: 1 }).withMessage('id_persona_receptora es requerido'),
      body('monto').isFloat({ gt: 0 }).withMessage('monto debe ser mayor a 0')
    ],
    validate,
    (req, res, next) => ctrl.create(req, res, next)
  );

  router.get(
    '/persona/:id_persona',
    [
      param('id_persona').isInt({ min: 1 }).withMessage('id_persona debe ser un entero positivo'),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    validate,
    (req, res, next) => ctrl.findByPersonaId(req, res, next)
  );

  return router;
};

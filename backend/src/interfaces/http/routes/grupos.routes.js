const { Router } = require('express');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.grupoController;

  router.post(
    '/',
    [
      body('nombre').notEmpty().withMessage('nombre es requerido'),
      body('id_perfil').isInt({ min: 1 }).withMessage('id_perfil es requerido')
    ],
    validate,
    (req, res, next) => ctrl.create(req, res, next)
  );

  router.get(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo')],
    validate,
    (req, res, next) => ctrl.findById(req, res, next)
  );

  router.post(
    '/:id/miembros',
    [
      param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo'),
      body('id_perfil').isInt({ min: 1 }).withMessage('id_perfil es requerido')
    ],
    validate,
    (req, res, next) => ctrl.join(req, res, next)
  );

  return router;
};

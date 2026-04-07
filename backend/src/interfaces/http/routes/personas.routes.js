const { Router } = require('express');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.personaController;

  router.post(
    '/',
    [
      body('nombre').notEmpty().withMessage('nombre es requerido'),
      body('mail').isEmail().withMessage('mail debe ser un email válido'),
      body('celular').notEmpty().withMessage('celular es requerido'),
      body('numero_cuenta').notEmpty().withMessage('numero_cuenta es requerido'),
      body('username')
        .optional()
        .isLength({ min: 3, max: 50 }).withMessage('username debe tener entre 3 y 50 caracteres')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('username solo puede contener letras, números y guión bajo')
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

  router.patch(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo')],
    validate,
    (req, res, next) => ctrl.update(req, res, next)
  );

  return router;
};

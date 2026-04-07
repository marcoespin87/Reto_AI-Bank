const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.pronosticoController;

  router.post(
    '/',
    [
      body('id_perfil').isInt({ min: 1 }).withMessage('id_perfil es requerido'),
      body('id_partido').isInt({ min: 1 }).withMessage('id_partido es requerido'),
      body('score_local').isInt({ min: 0 }).withMessage('score_local debe ser un entero no negativo'),
      body('score_visitante').isInt({ min: 0 }).withMessage('score_visitante debe ser un entero no negativo'),
      body('ganador').isIn(['local', 'visitante', 'empate']).withMessage('ganador debe ser local, visitante o empate')
    ],
    validate,
    (req, res, next) => ctrl.create(req, res, next)
  );

  router.get(
    '/perfil/:id_perfil',
    [
      param('id_perfil').isInt({ min: 1 }).withMessage('id_perfil debe ser un entero positivo'),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    validate,
    (req, res, next) => ctrl.findByPerfil(req, res, next)
  );

  router.get(
    '/:id',
    [param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo')],
    validate,
    (req, res, next) => ctrl.findById(req, res, next)
  );

  return router;
};

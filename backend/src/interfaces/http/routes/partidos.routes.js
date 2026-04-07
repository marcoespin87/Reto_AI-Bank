const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middlewares/validate');

module.exports = (container) => {
  const router = Router();
  const ctrl = container.partidoController;

  router.get(
    '/',
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('id_temporada').optional().isInt({ min: 1 }),
      query('solo_futuros').optional().isBoolean()
    ],
    validate,
    (req, res, next) => ctrl.findAll(req, res, next)
  );

  router.post(
    '/',
    [
      body('id_temporada').isInt({ min: 1 }).withMessage('id_temporada es requerido'),
      body('id_pais_local').isInt({ min: 1 }).withMessage('id_pais_local es requerido'),
      body('id_pais_visitante').isInt({ min: 1 }).withMessage('id_pais_visitante es requerido'),
      body('fecha').isISO8601().withMessage('fecha debe ser una fecha ISO válida')
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

  router.put(
    '/:id/resultado',
    [
      param('id').isInt({ min: 1 }).withMessage('id debe ser un entero positivo'),
      body('goles_local').isInt({ min: 0 }).withMessage('goles_local debe ser un entero no negativo'),
      body('goles_visitante').isInt({ min: 0 }).withMessage('goles_visitante debe ser un entero no negativo'),
      body('ganador').isIn(['local', 'visitante', 'empate']).withMessage('ganador debe ser local, visitante o empate')
    ],
    validate,
    (req, res, next) => ctrl.setResultado(req, res, next)
  );

  return router;
};

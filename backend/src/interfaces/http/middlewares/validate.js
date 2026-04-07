const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: errors.array()[0].msg,
      errors: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

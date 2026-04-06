const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract error messages
    const extractedErrors = errors.array().map(err => ({ [err.param]: err.msg }));
    return res.status(400).json({
      success: false,
      errors: extractedErrors
    });
  }
  next();
};

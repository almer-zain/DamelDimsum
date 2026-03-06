const Joi = require('joi');
const { ApiError } = require('../../../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  // 1. Safety check: If no schema is provided, just move on
  if (!schema) return next();

  // 2. "Big Tech" logic: Check if the schema is wrapped in 'body'
  // If yes, validate req.body against schema.body
  // If no, validate req.body against the schema itself
  const schemaToUse = schema.body ? schema.body : schema;

  const { value, error } = Joi.compile(schemaToUse)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(req.body);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }

  // Assign validated values back to req.body
  Object.assign(req.body, value);
  return next();
};

module.exports = validate;
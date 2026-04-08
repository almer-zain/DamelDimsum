const Joi = require('joi');
const { ApiError } = require('../../../utils/ApiError');
const validate = (schema) => (req, res, next) => {
  const schemaToUse = schema.body ? schema.body : schema;

  // IMPORTANT: We use 'value' which contains the type-converted data
  const { value, error } = Joi.compile(schemaToUse)
    .prefs({ errors: { label: 'key' }, abortEarly: false, stripUnknown: true })
    .validate(req.body);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }

  // Overwrite req.body with the cleaned AND type-converted values (strings become numbers)
  req.body = value;
  return next();
};
module.exports = validate;
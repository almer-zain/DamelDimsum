const Joi = require('joi');

const checkout = {
  body: Joi.object().keys({
    cart: Joi.array().items(
      Joi.object().keys({
        id: Joi.number().required(),
        name: Joi.string().required(),
        price: Joi.number().required(),
        qty: Joi.number().required(),
      })
    ).required(),
    customerInfo: Joi.object().keys({
      name: Joi.string().required(),
      whatsapp: Joi.string().required(),
      address: Joi.string().required(),
    }).required()
  })
};

module.exports = { checkout };
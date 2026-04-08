const Joi = require('joi');

const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const createProduct = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    categoryId: Joi.number().required(),
    description: Joi.string().allow('').optional(),
    // .coerce() or simply just letting Joi handle string-to-number conversion:

    existingImages: Joi.string().optional(),
    price: Joi.number().required(), 
    resellerPrice: Joi.number().required(),
    status: Joi.string().valid('active', 'inactive').default('active')
  })
};

const resellerApply = {
  body: Joi.object().keys({
    nameOwner: Joi.string().required(),
    nameShop: Joi.string().required(),
    whatsapp: Joi.string().required().pattern(/^\+?[0-9]+$/).message("Format nomor WA tidak valid"),
    city: Joi.string().required(),
    address: Joi.string().required()
  }),
};

const category = {
  body: Joi.object().keys({
    name: Joi.string().required().min(3).max(50),
  }),
};

module.exports = { category, login, createProduct, resellerApply };
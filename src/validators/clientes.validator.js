const Joi = require("joi");

const createClienteSchema = Joi.object({
  nombre_cliente: Joi.string().max(120).required(),
  telefono_cliente: Joi.string().pattern(/^\d{9}$/).required(),
  email_cliente: Joi.string().email().max(120).required()
});

const updateClienteSchema = Joi.object({
  nombre_cliente: Joi.string().max(120).optional(),
  telefono_cliente: Joi.string().pattern(/^\d{9}$/).optional(),
  email_cliente: Joi.string().email().max(120).optional(),
  activo_cliente: Joi.number().valid(0, 1).optional()
}).min(1);

module.exports = { createClienteSchema, updateClienteSchema };

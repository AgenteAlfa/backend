const Joi = require("joi");

const createCitaSchema = Joi.object({
  // formato ISO o 'YYYY-MM-DD HH:mm:ss' - se valida como date (Joi acepta strings parseables)
  fecha_cita: Joi.date().required(),
  cliente_cita: Joi.number().integer().positive().required(),
  // estado opcional: por defecto 'pendiente'
  estado: Joi.string().valid("pendiente", "confirmada", "rechazado").optional()
});

const updateCitaSchema = Joi.object({
  fecha_cita: Joi.date().optional(),
  cliente_cita: Joi.number().integer().positive().optional(),
  estado: Joi.string().valid("pendiente", "confirmada", "rechazado").optional()
}).min(1);

module.exports = { createCitaSchema, updateCitaSchema };

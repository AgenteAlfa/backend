const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().min(1).required(),
  password: Joi.string().min(1).required()
});

module.exports = { loginSchema };

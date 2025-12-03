const Joi = require("joi")

const studentSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().optional(),
  password: Joi.string().required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
})

module.exports = studentSchema

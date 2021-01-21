const { model } = require('mongoose')
const mongoose = require('mongoose')
const Joi = require('joi')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  password: String,
  name: String,
  birthDate: {
    type: Date,
    default: Date.now,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

const validationSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(50)
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(5).max(255).required(),
  name: Joi.string().min(5).max(125).required(),
  birthDate: Joi.date(),
  image: Joi.string(),
})

const validateLogin = (user) => {
  const validationSchemaLogin = Joi.object({
    email: Joi.string()
      .min(5)
      .max(255)
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(5).max(255).required(),
  })
  return validationSchemaLogin.validate(user)
}

const validate = (user) => validationSchema.validate(user)
const User = mongoose.model('User', userSchema)

module.exports = {
  User,
  validate,
  validateLogin,
}

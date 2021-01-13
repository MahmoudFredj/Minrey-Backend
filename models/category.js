const mongoose = require('mongoose')
const Joi = require('joi')
const { model } = require('mongoose')
const categorySchema = new mongoose.Schema({
  name: String,
})

const validationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
})

const validate = (category) => validationSchema.validate(category)

const Category = mongoose.model('Category', categorySchema)
module.exports = {
  Category,
  validate,
}

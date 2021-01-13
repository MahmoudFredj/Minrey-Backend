const mongoose = require('mongoose')
const Joi = require('joi')
const postSchema = new mongoose.Schema({
  title: String,
  image: {
    data: Buffer,
    contentType: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  edited: {
    type: Boolean,
    default: false,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
})

const validateSchema = Joi.object({
  title: Joi.string().min(5).max(255),
})

const validate = (post) => validateSchema.validate(post)
const Post = mongoose.model('Post', postSchema)
module.exports = {
  validate,
  Post,
}

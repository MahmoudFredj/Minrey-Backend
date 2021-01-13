const mongoose = require('mongoose')
const Joi = require('joi')

const commentSchema = new mongoose.Schema({
  content: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

const validationSchema = Joi.object({
  content: Joi.string().min(3).max(512).required(),
})

const validate = (comment) => validationSchema.validate(comment)

const Comment = mongoose.model('Comment', commentSchema)
module.exports = {
  validate,
  Comment,
}

const router = require('express').Router()
const auth = require('../middleware/auth')
const { User } = require('../models/user')
const bcrypt = require('bcrypt')
const Joi = require('joi')

router.get('/:id', async (req, res) => {
  const userId = req.params.id
  const user = await User.findById(userId).select({
    isAdmin: 1,
    email: 1,
    name: 1,
    birthDate: 1,
    image: 1,
  })

  res.send(user)
})

router.put('/account', auth, async (req, res) => {
  const userId = req.user._id
  // validate request data
  const { error } = accountSchema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // check if email is unique
  const email = await User.exists({ email: req.body.email })
  if (email) return res.status(400).send('email already exist')

  // updating account
  const result = await User.findOneAndUpdate(
    { _id: userId },
    { email: req.body.email },
  )

  res.send(result)
})

router.put('/password', auth, async (req, res) => {
  const userId = req.user._id
  // validate request data
  const { error } = passwordSchema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // check if current password is true
  const user = await User.findOne({ _id: userId })
  const validatePassword = await bcrypt.compare(
    req.body.currentPassword,
    user.password,
  )
  if (!validatePassword) return res.status(400).send('unvalid current password')

  // update password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.newPassword, salt)
  const result = await User.findOneAndUpdate(
    { _id: userId },
    { password: hashedPassword },
  )
  res.send(result)
})

router.put('/profile', auth, async (req, res) => {
  const userId = req.user._id
  // validate request data
  const { error } = profileSchema.validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  // update Profile
  const result = await User.findOneAndUpdate(
    { _id: userId },
    {
      name: req.body.name,
      birthDate: req.body.birthDate,
    },
  )
  res.send(result)
})

const accountSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(50)
    .email({ tlds: { allow: false } })
    .required(),
  notifyMe: Joi.boolean(),
})

const passwordSchema = Joi.object({
  currentPassword: Joi.string().min(5).max(255).required(),
  newPassword: Joi.string().min(5).max(255).required(),
})

const profileSchema = Joi.object({
  name: Joi.string().min(6).max(24).required(),
  birthDate: Joi.date().required(),
})

module.exports = router

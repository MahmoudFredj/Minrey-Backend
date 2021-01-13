const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { privateKey } = require('../config.json')
const { User, validate, createUser, validateLogin } = require('../models/user')

router.post('/login', async (req, res) => {
  // validation of form
  const { error } = validateLogin(req.body)
  if (error) return res.status('400').send(error.details[0].message)

  //checking if email exist
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('email or password invalid')

  //checking if password correct
  const validatePassword = await bcrypt.compare(
    req.body.password,
    user.password,
  )
  if (!validatePassword)
    return res.status(400).send('email or password invalid')
  //generating token
  const token = jwt.sign(
    { _id: user._id, name: user.name, isAdmin: user.isAdmin },
    privateKey,
  )
  setTimeout(() => {
    res.send(token)
  }, 3000)
})

router.post('/register', async (req, res) => {
  // validation of form
  const { error } = validate(req.body)
  if (error) return res.status('400').send(error.details[0].message)

  //checking if email is unique
  const emailCheck = await User.findOne({ email: req.body.email })
  if (emailCheck) return res.status(400).send('email already exist')

  //hashing password
  const password = req.body.password
  const salt = await bcrypt.genSalt(10)
  const hashed = await bcrypt.hash(password, salt)

  //creating new user
  const user = new User({
    email: req.body.email,
    password: hashed,
    name: req.body.name,
    birthDate: req.body.birthDate,
  })
  const result = await user.save()
  //creating token
  const token = jwt.sign(
    { _id: result._id, name: result.name, isAdmin: result.isAdmin },
    privateKey,
  )
  setTimeout(() => {
    res.send(token)
  }, 3000)
})
module.exports = router

const router = require('express').Router()
const { Category, validate } = require('../models/category')
const admin = require('../middleware/admin')

router.get('/', async (req, res) => {
  const categories = await Category.find()
  res.send(categories)
})

router.post('/', admin, async (req, res) => {
  //validating error
  const { error } = validate(req.body)
  if (error) res.status(400).send(error.details[0].message)
  const category = new Category({
    name: req.body.name,
  })

  const result = await category.save()
  res.send(result)
})

router.put('/', admin, async (req, res) => {
  const { error } = validate({ name: req.body.name })
  if (error) res.status(400).send(error.details[0].message)
  const category = Category.findOneAndUpdate(
    { _id: req.body._id },
    { name: req.body.name },
  )

  req.send(category)
})

router.delete('/', admin, async (req, res) => {
  const category = await Category.findOneAndDelete({ _id: req.body._id })

  res.send(category)
})

module.exports = router

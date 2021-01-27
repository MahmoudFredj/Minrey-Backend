const router = require('express').Router()
const { Post, validate } = require('../models/post')
const auth = require('../middleware/auth')
const fs = require('fs')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname)
  },
})

// upload with storage

const upload = multer({ storage })

router.get('/:pageNumber/:pageSize', async (req, res) => {
  const pageNumber = parseInt(req.params.pageNumber)
  const pageSize = parseInt(req.params.pageSize)

  // getting posts
  let post = await Post.find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ likes: -1 })
    .select({ title: 1, image: 1, likes: 1, edited: 1 })

  res.send(post)
})

router.get('/:category/:pageNumber/:pageSize', async (req, res) => {
  if (!req.params.category === 'undefined')
    return res.status(400).send('invalid category')
  const category = req.params.category
  const pageNumber = parseInt(req.params.pageNumber)
  const pageSize = parseInt(req.params.pageSize)
  // getting posts
  let post = await Post.find({
    category: category,
  })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ likes: -1 })
    .select({ title: 1, image: 1, likes: 1, edited: 1 })

  res.send(post)
})

router.get('/:id', async (req, res) => {
  let post = await Post.findOne({ _id: req.params.id }).select({
    image: 1,
    title: 1,
    user: 1,
    likes: 1,
    edited: 1,
  })

  res.send(post)
})

router.post('/', [auth, upload.single('image')], async (req, res) => {
  // validating for errors
  const { error } = validate({ title: req.body.title })
  if (error) return res.status(400).send(error.details[0].message)

  //creating post
  const post = new Post({
    title: req.body.title,
    image: {
      data: fs.readFileSync(req.file.path),
      contentType: req.file.mimetype,
    },
    user: req.user._id,
    category: req.body.category,
  })

  //saving post
  const result = await post.save()
  res.send(result)
})

router.put('/like', [auth], async (req, res) => {
  const post = await Post.findOne({ _id: req.body._id })

  // check if the user liked the post
  const liked = await Post.exists({
    $and: [{ _id: req.body._id }, { likes: req.user._id }],
  })

  let result
  if (liked) {
    result = await Post.findByIdAndUpdate(
      { _id: req.body._id },
      { $pull: { likes: req.user._id } },
    ).select({
      likes: 1,
    })

    const index = result.likes.indexOf(req.user._id)
    result.likes.splice(index, 1)
  } else {
    result = await Post.findByIdAndUpdate(
      { _id: req.body._id },
      { $push: { likes: req.user._id } },
    ).select({
      likes: 1,
    })
    result.likes.push(req.user._id)
  }

  res.send(result)
})

router.delete('/', async (req, res) => {
  const result = await Post.findOneAndDelete({ _id: req.body._id })
  res.send(result)
})

module.exports = router

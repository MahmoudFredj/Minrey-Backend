const router = require('express').Router()
const auth = require('../middleware/auth')
const { Comment, validate } = require('../models/comment')
const { Post } = require('../models/post')

router.get('/post/:id', async (req, res) => {
  const result = await Post.findOne({
    _id: req.params.id,
  })
    .select({ comments: 1 })
    .populate({ path: 'comments', populate: { path: 'user', select: 'name' } })

  res.send(result.comments)
})

router.get('/comment/:id', async (req, res) => {
  const comments = await Comment.find({ _id: req.params.id }).select({
    user: 1,
    content: 1,
  })

  res.send(comments)
})

router.get('/replies/:id', async (req, res) => {
  const result = await Comment.findOne({
    _id: req.params.id,
  }).populate({
    path: 'comments user',
    select: 'name content createdDate likes',
    populate: { path: 'user', select: 'name' },
  })
  res.send(result)
})

router.post('/post', [auth], async (req, res) => {
  //Validation
  const { error } = validate({ content: req.body.content })
  if (error) return res.status(400).send(error.details[0].message)

  //create comment
  const comment = await Comment.create({
    content: req.body.content,
    user: req.user._id,
  })

  //saving comment
  const result = await comment
    .populate({ path: 'user', select: { name: 1 } })
    .execPopulate()
  const post = await Post.updateOne(
    { _id: req.body._id },
    { $push: { comments: result } },
  )
  res.send(result)
})

router.post('/comment', [auth], async (req, res) => {
  //Validation
  const { error } = validate({ content: req.body.content })
  if (error) return res.status(400).send(error.details[0].message)

  //create comment

  const comment = new Comment({
    content: req.body.content,
    user: req.user._id,
  })

  //saving comment
  const reply = await comment.save()

  //adding it to op comment
  await Comment.updateOne({ _id: req.body._id }, { $push: { comments: reply } })

  //getting the op comment populated
  const result = await Comment.findOne({ _id: req.body._id }).populate({
    path: 'comments',
    populate: { path: 'user', select: 'name' },
  })

  res.send(result)
})

router.put('/', [auth], async (req, res) => {
  //validation
  const { error } = validate({ content: req.body.content })
  if (error) return res.status(400).send(error.details[0].message)

  //updating comment
  const comment = await Comment.findOneAndUpdate(
    { _id: req.body._id },
    { content: req.body.content },
  )
  res.send(comment)
})

router.put('/like', [auth], async (req, res) => {
  const post = await Comment.findOne({ _id: req.body._id })

  // check if the user liked the post
  const liked = await Comment.exists({
    $and: [{ _id: req.body._id }, { likes: req.user._id }],
  })

  let result
  if (liked) {
    result = await Comment.findByIdAndUpdate(
      { _id: req.body._id },
      { $pull: { likes: req.user._id } },
    ).select({
      likes: 1,
    })
    const index = result.likes.indexOf(req.user._id)
    result.likes.splice(index, 1)
  } else {
    result = await Comment.findByIdAndUpdate(
      { _id: req.body._id },
      { $push: { likes: req.user._id } },
    ).select({
      likes: 1,
    })
    result.likes.push(req.user._id)
  }

  const sendReplay = {
    _id: result._id,
    likes: result.likes,
    comment: req.body.mother,
  }
  res.send(sendReplay)
})

router.delete('', [auth], async (req, res) => {
  const result = await Comment.findOneAndDelete({ _id: req.body._id })
  res.send(result)
})

module.exports = router

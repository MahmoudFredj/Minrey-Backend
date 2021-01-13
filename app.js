const express = require('express')
const app = express()
const config = require('./config.json')
const mongoose = require('mongoose')
const accessControl = require('./middleware/acessControl')
// middlewares
app.use(accessControl)
app.use(express.json())

// routes
const post = require('./routes/post.js')
const authentication = require('./routes/authentication.js')
const comment = require('./routes/comment.js')
const category = require('./routes/category')

app.use('/api/post', post)
app.use('/api/authentication', authentication)
app.use('/api/comment', comment)
app.use('/api/category', category)

// connecting mongoose
const dbUrl = config.dbConnectProduction
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log(
      '\x1b[32m',
      `[mongoose] db connected on ${dbUrl} ...`,
      '\x1b[37m',
    ),
  )
  .catch((err) =>
    console.log(
      '\x1b[31m',
      '[mongoose] db connection error :',
      err,
      '\x1b[37m',
    ),
  )

// launching app
const PORT = process.env.PORT || 2525
app.listen(PORT, () => {
  console.log(
    '\x1b[33m',
    `[app] server running on port ${PORT} ...`,
    '\x1b[37m',
  )
})

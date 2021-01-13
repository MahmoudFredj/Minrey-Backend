const jwt = require('jsonwebtoken')
const { privateKey } = require('../config.json')

module.exports = function auth(req, res, next) {
  const token = req.header('x-auth-token')
  try {
    const decoded = jwt.verify(token, privateKey)
    if (!decoded.isAdmin) res.status(401).send('not admin')
    req.user = decoded
    next()
  } catch (err) {
    res.status(400).send('invalid token')
  }
}

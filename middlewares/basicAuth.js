// Basic Auth middleware

const basicAuth = require("basic-auth")
const auth = (req, res, next) => {
  const user = basicAuth(req)
  const username = process.env.LOGGER_ADMIN
  const password = process.env.LOGGER_PASSWORD

  if (!user || user.name !== username || user.pass !== password) {
    res.set("WWW-Authenticate", 'Basic realm="Logs"')
    return res.status(401).send("Authentication required.")
  }
  next()
}

module.exports = auth

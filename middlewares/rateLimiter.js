const rateLimit = require("express-rate-limit")

function rateLimiter(time, limit, message) {
  return rateLimit({
    windowMs: time, // 1 hour
    max: limit,
    message: {
      status: false,
      message: message,
    },
  })
}

module.exports = rateLimiter

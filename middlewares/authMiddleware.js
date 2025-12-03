const logger = require("@logger")
const jwt = require("jsonwebtoken")

const verifyJWT = (req, res, next) => {
  const token = req.cookies.token // stored as HttpOnly cookie
  if (!token) {
    logger.info("Token not found", { status: false, message: "Unauthorized" })
    return res.status(200).json({ status: false, message: "Unauthorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("AT AUTH MIDDLEWARE")
    console.log(decoded)
    req.user = decoded // user info like name, email, etc.
    next()
  } catch (err) {
    logger.error("Error at authMiddleware", err)
    return res.status(403).json({ status: false, message: "Forbidden" })
  }
}

module.exports = verifyJWT

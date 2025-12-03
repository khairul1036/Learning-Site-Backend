console.clear()
const app = require("./app")
const connectDB = require("@utils/connectDB")
require("dotenv").config()
const logger = require("@logger")

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on port http://localhost:${PORT}`)
      logger.info("_________________________")
    })
  })
  .catch((err) => console.error(err))

const mongoose = require("mongoose")
const logger = require("@logger")

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    logger.info("MongoDB connected")

    if (process.env.NODE_ENV === "production") {
      // Commented out for now
      // await User.collection.createIndex({ email: 1 }, { unique: true })
      // await Course.collection.createIndex({ title: 1, route: 1, type: 1 })
      // console.log("Indexes created")
    }
  } catch (err) {
    logger.error("MongoDB connection failed:", err)
    process.exit(1) // Optional: Exit process if DB connection fails
  }
}

module.exports = connectDB

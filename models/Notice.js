const mongoose = require("mongoose")

const formatDate = () => {
  const options = { day: "numeric", month: "long", year: "numeric" }
  return new Date().toLocaleDateString("en-US", options) // e.g., "July 10, 2025"
}

const noticeSchema = new mongoose.Schema({
  date: {
    type: String,
    default: formatDate,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    trim: true,
  },
})

module.exports = mongoose.model("Notice", noticeSchema)

const mongoose = require("mongoose")

const applyCertificate = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  driveLink: {
    type: String,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
})

module.exports = mongoose.model("Apply", applyCertificate)

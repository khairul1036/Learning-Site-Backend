const mongoose = require("mongoose")

const certificateSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    certificateId: {
      type: String,
      required: true,
    },
    regId: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Certificate", certificateSchema)

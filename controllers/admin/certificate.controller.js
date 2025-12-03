const Certificate = require("@models/Certificate")
const Student = require("@models/Student")
const Course = require("@models/Course")
const sanitize = require("mongo-sanitize")
const logger = require("@logger")

const formatDate = (issueDate) => {
  const options = { day: "numeric", month: "long", year: "numeric" }
  return new Date(issueDate).toLocaleDateString("en-US", options) //
}

exports.getCertificateInfo = async (req, res) => {
  const getAllCertificates = await Certificate.find({}).sort({ _id: -1 }).lean()
  res.json(getAllCertificates)
}

exports.findCertificate = async (req, res) => {
  try {
    const { find } = sanitize(req.query)

    const findCertificate = await Certificate.findOne({
      $or: [{ certificateId: find }, { regId: find }],
    }).lean()

    console.log(findCertificate)
    const { studentId, courseId } = findCertificate

    const findStudent = await Student.findOne(
      { _id: studentId },
      "name sid image"
    ).lean()
    const findCourse = await Course.findOne(
      { _id: courseId },
      "title duration"
    ).lean()

    res.json({
      studentData: findStudent,
      courseData: {
        ...findCourse,
        grade: findCertificate.grade,
        issue: formatDate(findCertificate.issueDate),
      },
    })
  } catch (error) {
    logger.error(error)
    res.json({ error: error.message })
  }
}

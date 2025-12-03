const generateCertificate = require("@utils/certificateTemplate")
const sanitize = require("mongo-sanitize")
// MongoDB Models
const Certificate = require("@models/Certificate")
const Course = require("@models/Course")
const client = require("@utils/redisClient")
const Student = require("@models/Student")

const logger = require("@logger")
const { default: mongoose } = require("mongoose")
const { custom } = require("joi")

exports.certificateController = async (req, res) => {
  try {
    let { studentId, courseId, grade } = sanitize(req.body)

    // Input Decorations
    if (!isNaN(Number(studentId))) {
      studentId = `LIT-${studentId}`
    }
    courseId = courseId.toLowerCase().split(" ").join("-")

    const CACHE_DATA = `student:${studentId}`
    console.log("Cache Key:", CACHE_DATA)
    const cachedData = await client.get(CACHE_DATA)

    let studentData
    if (!cachedData) {
      const query = mongoose.Types.ObjectId.isValid(studentId)
        ? { $or: [{ _id: studentId }, { sid: studentId }] }
        : { sid: studentId }

      studentData = await Student.findOne(query)
    } else {
      studentData = JSON.parse(cachedData)
    }

    if (studentData == null)
      return res.status(404).json({ error: "Woah? The User does not exists!" })

    const { name, sid, totalOrders } = studentData

    console.log(name, sid, totalOrders)
    const query = mongoose.Types.ObjectId.isValid(studentId)
      ? { $or: [{ _id: courseId }, { route: courseId }] }
      : { route: courseId }

    const findCourse = await Course.findOne(query)

    if (findCourse == null)
      return res.status(404).json({ error: "Oops! The Course was not found" })

    const { title, duration, instructors } = findCourse

    let matchedCourse
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      matchedCourse = totalOrders.find(
        (order) => order.courseId.toString() === courseId.toString()
      )
    } else {
      matchedCourse = {
        enrolledAt: new Date().getFullYear().toString(),
        certificate: { grade },
      }
    }

    const courseCode = title
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()

    const courseYear = new Date(matchedCourse.enrolledAt)
      .getFullYear()
      .toString()

    // 2025-ABC${sid}
    const certificateId = `${courseYear}-${courseCode.toUpperCase()}${
      sid.split("-")[1]
    }`
    // 2025/ABC/${sid}
    const regId = `${courseYear}/${courseCode.toUpperCase()}/${
      sid.split("-")[1]
    }`

    // Checking if the issue date is already issued
    let existingCertificate
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      existingCertificate = await Certificate.findOne({
        studentId,
        courseId,
      })
    } else {
      existingCertificate = false
    }

    let issueDate
    if (existingCertificate) {
      issueDate = new Date(existingCertificate.issueDate)
    } else {
      issueDate = new Date()
    }

    const certificate = new Certificate({
      studentId: studentData._id,
      courseId: findCourse._id,
      certificateId,
      regId,
      issueDate,
      grade: matchedCourse.certificate.grade || grade,
    })

    await certificate.save()

    console.log("Grade", matchedCourse.certificate.grade)

    const pdfBuffer = await generateCertificate(
      name,
      `“${title.split(" ").slice(0, 2).join(" ")}”` /* Course's Title */,
      matchedCourse.certificate.grade /* student's grade */,
      duration /*courseDuration*/,
      issueDate /* issueDate */,
      certificateId,
      sid,
      regId,
      instructors[0].name,
      instructors[0].sign
    )

    if (pdfBuffer instanceof Uint8Array) {
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=certificate.pdf`,
        "Content-Length": pdfBuffer.length,
      })

      res.end(pdfBuffer)
    } else {
      const customError = new Error(
        `${pdfBuffer.message} Please Cross check your Course Data`
      )
      customError.status = 422
      throw customError
    }
  } catch (error) {
    console.log(error)
    logger.error(error)
    return res.status(error.status).json({ error: error.message })
  }
}

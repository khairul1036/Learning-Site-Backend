const sanitize = require("mongo-sanitize")
const Student = require("../../models/Student")
const Course = require("../../models/Course")
const Apply = require("../../models/Apply")
const mongoose = require("mongoose")

const sendSMS = require("@utils/sendMessage")
const logger = require("@logger")

const getApplyCertificateController = async (req, res) => {
  try {
    const applyCertificate = await Apply.find({}).lean()
    res.status(200).json({ status: true, applyCertificate })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const postApplyController = async (req, res) => {
  const { sid, courseId, driveLink } = sanitize(req.body)

  try {
    // Match from the Apply Database Collection with StudentId and CourseId both, if found then return error

    const findApply = await Apply.findOne({ studentId: sid, courseId }).lean()
    if (findApply)
      return res.json({
        status: false,
        message: "Certificate already applied",
      })

    const applyCertificate = new Apply({
      studentId: sid,
      driveLink: driveLink,
      courseId,
    })
    await applyCertificate.save()
    res
      .status(201)
      .json({ status: true, message: "Certificate applied successfully" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const actionApplyController = async (req, res) => {
  const { applyId, grade } = sanitize(req.body)
  const { action } = sanitize(req.params)

  try {
    // Fetch apply data with studentId and courseId (courseId is ObjectId)
    const applyData = await Apply.findOne(
      { _id: applyId },
      "studentId courseId"
    ).lean()

    if (!applyData)
      return res.json({ status: false, message: "Apply not found" })

    const { studentId, courseId } = applyData
    console.log(studentId, courseId)
    // Fetch course title
    const courseTitleData = await Course.findOne(
      { _id: courseId },
      "title"
    ).lean()
    const courseTitle = courseTitleData?.title || "Unknown Course"

    // Fetch student's phone number (studentId stored in sid field)
    const studentData = await Student.findOne(
      { sid: studentId },
      "phone"
    ).lean()
    const to = studentData?.phone

    if (!to) {
      return res
        .status(400)
        .json({ status: false, message: "Student phone number not found" })
    }

    if (action === "reject") {
      await Apply.findOneAndDelete({ _id: applyId })

      sendSMS(
        to,
        `Unfortunately, your request for the ${courseTitle} Certificate has been Rejected. Please Reapply or Contact Authority. StudentID: ${studentId}`
      )

      return res.status(200).json({
        status: true,
        message: "Certificate rejected",
      })
    }

    // Make sure courseId is ObjectId instance for the query
    const courseObjId =
      courseId instanceof mongoose.Types.ObjectId
        ? courseId
        : new mongoose.Types.ObjectId(courseId)

    // Check if student and course exist in totalOrders array
    const findStudent = await Student.findOne({
      sid: studentId,
      "totalOrders.courseId": courseObjId,
    }).lean()

    if (!findStudent) {
      return res.status(404).json({
        status: false,
        message: "Student or course not found in totalOrders",
      })
    }

    // Update the certificate info inside the matched totalOrders element
    const updateStudent = await Student.updateOne(
      {
        sid: studentId,
        "totalOrders.courseId": courseObjId,
      },
      {
        $set: {
          "totalOrders.$.certificate.canIssue": true,
          "totalOrders.$.certificate.grade": grade,
        },
      }
    )

    if (updateStudent.modifiedCount === 0) {
      return res.status(500).json({
        status: false,
        message: "Failed to update student certificate status",
      })
    }

    // Optionally, delete the Apply document after approval (uncomment if needed)
    // await Apply.findOneAndDelete({ _id: applyId })

    sendSMS(
      to,
      `Congratulations! Your request for the ${courseTitle} Certificate has been Approved. Please download your certificate from your dashboard. StudentID: ${studentId}`
    )

    // delete the apply document
    await Apply.findOneAndDelete({ _id: applyId })

    return res
      .status(200)
      .json({ status: true, message: "Certificate Approved" })
  } catch (err) {
    logger.error(err)
    return res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getApplyCertificateController,
  postApplyController,
  actionApplyController,
}

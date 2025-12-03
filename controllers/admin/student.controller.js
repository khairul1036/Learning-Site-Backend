const Student = require("@models/Student")
const Course = require("@models/Course")
const sanitize = require("mongo-sanitize")
const bcrypt = require("bcrypt")
const logger = require("@logger")
const client = require("@utils/redisClient")

// Student Controller

/**
 * Get all students
 * @param {Object} req Express Request Object
 * @param {Object} res Express Response Object
 * @returns {Promise<void>}
 */

exports.getStudents = async (req, res) => {
  const page = parseInt(sanitize(req.query.page)) || 1
  const limit = parseInt(sanitize(req.query.limit)) || 50
  try {
    // Get all students by skipping and limiting the results
    const getStudents = await Student.find({})
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const totalStudents = await Student.countDocuments()
    const totalPages = Math.ceil(totalStudents / limit)

    res.status(201).json({ getStudents, totalPages, totalStudents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.findStudent = async (req, res) => {
  const sid = sanitize(req.params.sid)
  try {
    const student = await Student.findOne({ sid })
    if (student) res.json({ status: true, student })

    res.json({ status: false, message: "User not found" })
  } catch (err) {
    logger.error(err)
    res.status(500).json({ error: err.message })
  }
}

exports.createStudent = async (req, res) => {
  console.log(req.body)
  const { name, email, phone, password } = sanitize(req.body)

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const student = new Student({
      name,
      email,
      phone,
      password: hashedPassword,
    })

    await student.save()
    res.status(201).json({ message: "User registered" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteStudent = async (req, res) => {
  const { sid } = sanitize(req.params)
  try {
    const findUser = await Student.findOneAndDelete({ sid })
    console.log(findUser)
    if (!findUser) return res.json({ status: false, message: "User not found" })

    res.json({
      status: true,
      deletedUser: findUser,
    })
  } catch (err) {
    logger.error(err)
    res.status(500).json({ error: err.message })
  }
}

exports.updateStudent = async (req, res) => {
  const data = sanitize(req.body)
  const sid = sanitize(req.params.sid)
  try {
    if (data.courseRoute) {
      const findCourse = await Course.findOne(
        { route: data.courseRoute },
        "_id"
      )
      const findStudent = await Student.findOne({ sid })
      if (!findStudent) return console.log("Student not found")

      const alreadyEnrolled = findStudent.totalOrders.some((order) =>
        order.courseId.equals(findCourse._id)
      )

      if (alreadyEnrolled) {
        console.log("Student already enrolled in this course")
        return res.json({
          status: false,
          message: "Student is already enrolled",
        })
      }

      if (findCourse) {
        const updatedCourse = await Course.updateOne(
          { _id: findCourse._id },
          { $addToSet: { enrolledStudents: sid } }
        )
        if (updatedCourse.modifiedCount > 0) console.log("Course updated")

        const orderData = {
          certificate: {
            canIssue: false,
            grade: "N/A",
          },
          courseId: findCourse._id,
          enrolledAt: Date.now(),
          paymentStatus: "paid",
          paid: "0",
        }

        const updatedStudent = await Student.updateOne(
          { _id: findStudent._id },
          { $addToSet: { totalOrders: orderData } }
        )

        if (updatedStudent.modifiedCount > 0) console.log("Student updated")
      }
    }

    const updateStudent = await Student.findOneAndUpdate(
      { sid },
      { $set: data },
      { new: true }
    )

    client.del(`student:${sid}`)

    return updateStudent
      ? res
          .status(200)
          .json({ status: true, message: "Updated Student successfully" })
      : res
          .status(404)
          .json({ status: false, error: "Updated Student not found" })
  } catch (err) {
    res.status(500).json({ error: err.message })
    logger.error(err)
  }
}

const Student = require("../../models/Student")
const { Types } = require("mongoose")
const client = require("../../utils/redisClient")
const path = require("path")

exports.dashboardController = async (req, res) => {
  // console.log(req.user.sid)
  // const CACHE_DATA = `student:${req.user.sid}`

  // console.log(CACHE_DATA)
  // const cachedData = await client.get(CACHE_DATA)

  // console.log(CACHE_DATA, cachedData)
  // if (cachedData) {
  //   return res.json(JSON.parse(cachedData))
  // }

  const findStudent = await Student.findOne({ _id: req.user.id })
  const {
    sid,
    name,
    image,
    father,
    mother,
    gender,
    dateOfBirth,
    email,
    phone,
    role,
    registrationCardIssued,
    certificates,
  } = findStudent

  let { totalOrders } = findStudent

  totalOrders = totalOrders.sort(
    (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)
  )

  const filteredCourses = await Student.aggregate([
    {
      $match: { _id: new Types.ObjectId(req.user.id) },
    },
    {
      $project: {
        _id: 0,
        approvedCourses: {
          $filter: {
            input: "$totalOrders",
            as: "course",
            cond: { $eq: ["$$course.paymentStatus", "paid"] },
          },
        },
        pendingCourses: {
          $filter: {
            input: "$totalOrders",
            as: "course",
            cond: { $eq: ["$$course.paymentStatus", "pending"] },
          },
        },
      },
    },
  ])

  let courseStatus = {
    approvedCourses: filteredCourses[0].approvedCourses.sort(
      (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)
    ),
    pendingCourses: filteredCourses[0].pendingCourses.sort(
      (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)
    ),
  } || {
    approvedCourses: [],
    pendingCourses: [],
  }

  const totalPaid = courseStatus.approvedCourses?.reduce(
    (sum, course) => sum + Number(course.paid),
    0
  )

  const responseData = {
    id: req.user.id,
    name,
    image,
    father,
    mother,
    gender,
    dateOfBirth,
    sid,
    email,
    phone,
    role,
    registrationCardIssued,
    totalOrders,
    courseStatus,
    totalPaid,
    certificates,
  }

  // await client.set(CACHE_DATA, JSON.stringify(responseData), { EX: 60 })

  res.json(responseData)
}

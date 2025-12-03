// ADMIN CONTROLLERS
// Course Controller

const sanitize = require("mongo-sanitize")
const Course = require("@models/Course")
const client = require("@utils/redisClient")
const logger = require("@logger")

// ADMIN CONTROLLERS
exports.addCourse = async (req, res) => {
  const data = sanitize(req.body)
  if (data.instructors && typeof data.instructors === "string") {
    data.instructors = JSON.parse(data.instructors)
  }

  console.log(data.route.toLowerCase().split(" ").join("-"))
  data.route = data.route.toLowerCase().split(" ").join("-")

  try {
    const course = new Course(data)
    await course.save()
    res.status(200).json({ message: "Success" })

    client.del("courses:all")
  } catch (err) {
    res.status(500).json({ error: err.message })
    logger.error(err)
  }
}

exports.updateCourse = async (req, res) => {
  let route = sanitize(req.params.route)
  route = route.toLowerCase().split(" ").join("-")

  console.log(route)
  const data = sanitize(req.body)
  data.route = data.route.toLowerCase().split(" ").join("-")
  try {
    const findCourse = await Course.findOneAndUpdate(
      { route },
      { $set: data },
      { new: true }
    )

    console.log(findCourse)

    client.del(`courses:${route}`)
    client.del("courses:all")

    return findCourse
      ? res
          .status(200)
          .json({ status: true, message: "Course updated successfully" })
      : res.status(404).json({ status: false, error: "Course not found" })
  } catch (err) {
    res.status(500).json({ error: err.message })
    logger.error(err)
  }
}

exports.deleteCourse = async (req, res) => {
  const route = sanitize(req.params.route)

  try {
    const findCourse = await Course.findOneAndDelete({ route })
    client.del("courses:all")
    client.del(`courses:${route}`)

    return findCourse
      ? res
          .status(200)
          .json({ status: true, message: "Course deleted successfully" })
      : res.status(404).json({ status: true, error: "Course not found" })
  } catch (err) {
    res.status(500).json({ error: err.message })
    logger.error(err)
  }
}

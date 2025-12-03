const sanitize = require("mongo-sanitize")
const Student = require("@models/Student")
const Course = require("@models/Course")
const client = require("@utils/redisClient")
const bcrypt = require("bcrypt")
const logger = require("@logger")
// Client Redis

const resetInfo = async (req, res) => {
  try {
    const rawBody = sanitize(req.body)
    const updateFields = {}

    const allowedFields = [
      "name",
      "image",
      "father",
      "mother",
      "gender",
      "dateOfBirth",
      "phone",
      "currentpass",
      "newpass",
    ]

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(rawBody, key)) {
        updateFields[key] = rawBody[key]
      }
    }

    console.log("UpdateFields", updateFields)

    if (
      Object.prototype.hasOwnProperty.call(updateFields, "currentpass") &&
      Object.prototype.hasOwnProperty.call(updateFields, "newpass")
    ) {
      if (updateFields.newpass == "") {
        return res.json({
          success: false,
          message: "Password cannot be empty",
        })
      }

      const { email } = req.user
      const findStudent = await Student.findOne({ email })

      const hashedPassword = findStudent.password
      const currentPassword = updateFields.currentpass
      const isMatch = await bcrypt.compare(currentPassword, hashedPassword)

      console.log(isMatch)
      console.log(hashedPassword, currentPassword)

      if (findStudent && isMatch) {
        updateFields.password = await bcrypt.hash(updateFields.newpass, 10)
      } else {
        return res.json({ success: false, message: "Password didn't matched" })
      }

      await client.del(`student:${findStudent.sid}`)
    }

    await Student.updateOne({ _id: req.user.id }, { $set: updateFields })
    res.json({ success: true, message: "Informations Updated successfully" })
  } catch (error) {
    logger.error(error)
  }
}

module.exports = resetInfo

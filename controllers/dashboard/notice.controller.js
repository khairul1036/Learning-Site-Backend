const logger = require("@logger")
const Notice = require("@models/Notice")
const client = require("@utils/redisClient")

const sanitize = require("mongo-sanitize")

// View Notice
exports.viewNotice = async (req, res) => {
  try {
    const CACHE_KEY = "notices"
    const cachedData = await client.get(CACHE_KEY)

    if (cachedData) {
      console.log("Inside CachedData")
      return res.json(JSON.parse(cachedData))
    }

    const getAllNotices = await Notice.find({}).sort({ _id: -1 }).lean()

    await client.set(CACHE_KEY, JSON.stringify(getAllNotices), { EX: 60 })
    return res.json(getAllNotices)
  } catch (error) {
    logger.error(error)
    return res.json({ err: error.message })
  }
}

// Add Notice
exports.addNotice = async (req, res) => {
  try {
    const newNotice = new Notice(sanitize(req.body))
    await newNotice.save()

    await client.del("notices")
    return res.json({
      success: true,
      message: "Notice was added successfully.",
    })
  } catch (error) {
    logger.error(error)
    return res.json({ err: error.message })
  }
}

// Update Notice
exports.updateNotice = async (req, res) => {
  try {
    const { id } = sanitize(req.params)
    const data = sanitize(req.body)

    const updateNotice = await Notice.findOneAndUpdate({ _id: id }, data, {
      new: true,
    })
    await client.del("notices")
    return res.json({
      success: true,
      message: "Notice was updated successfully.",
      notice: updateNotice,
    })
  } catch (error) {
    logger.error(error)
    return res.json({ err: error.message })
  }
}

// Delete Notice
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = sanitize(req.params)
    const deleteNotice = await Notice.findOneAndDelete({ _id: id })
    await client.del("notices")
    return res.json({
      success: true,
      message: "Notice was deleted successfully.",
      notice: deleteNotice,
    })
  } catch (error) {
    logger.error(error)
    return res.json({ err: error.message })
  }
}

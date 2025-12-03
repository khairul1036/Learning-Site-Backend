const sanitize = require("mongo-sanitize")
const General = require("@models/General")
const { get } = require("mongoose")
const client = require("@utils/redisClient")

exports.addGeneralSettings = async (req, res) => {
  try {
    const data = sanitize(req.body)
    const CACHE_KEY = "general"

    const result = await General.findOneAndUpdate(
      {},
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true } // options
    )

    await client.set(CACHE_KEY, JSON.stringify(result), { EX: 60 })
    return res.json({ message: "Success", data: result })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error", error })
  }
}

exports.getGeneralSettings = async (req, res) => {
  try {
    const CACHE_KEY = "general"
    const cachedCourses = await client.get(CACHE_KEY)

    if (cachedCourses) return res.json(JSON.parse(cachedCourses))

    const getData = await General.find({}).lean()
    res.json(getData[0])
  } catch (error) {
    console.log(error)
  }
}

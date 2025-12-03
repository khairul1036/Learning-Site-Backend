const { createClient } = require("redis")
require("dotenv").config()
const logger = require("@logger")

const client = createClient({
  url: process.env.REDIS_URI || "redis://redis:6379",
})

client.connect()
client.on("connect", () => {
  logger.info("Redis has been connected")
})

client.on("error", (err) => {
  logger.error("Redis error:", err)
})

client.flushAll()
module.exports = client

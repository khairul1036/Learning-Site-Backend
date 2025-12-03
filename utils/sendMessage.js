const axios = require("axios")
const logger = require("@logger")

async function sendSMS(to, message) {
  try {
    const response = await axios.post(process.env.SMS_URL, null, {
      params: {
        api_key: process.env.API_KEY,
        senderid: process.env.SENDER_ID,
        number: to,
        message: message,
      },
    })

    // console.log(response.data)

    logger.info("SMS Sent! Response:", response.data)
  } catch (error) {
    logger.error("Error sending SMS:", error.response?.data || error.message)
  }
}

module.exports = sendSMS

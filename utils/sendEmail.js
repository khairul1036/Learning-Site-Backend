const nodemailer = require("nodemailer")

async function sendEmail(email, subject, htmlContent) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD, // Use "app password", NOT Gmail login password
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: subject || "ProximaIT Email",
    html: htmlContent,
  }

  await transporter.sendMail(mailOptions)
}

module.exports = sendEmail

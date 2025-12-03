require("module-alias/register")
const path = require("path")
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")

// Routes
const authRoutes = require("@routes/auth")
const courseRoutes = require("@routes/courses")
const studentRoutes = require("@routes/student")
const dashboardRoutes = require("@routes/dashboard/dashboard")
const certificateRoutes = require("@routes/admin/certificate")
const generalRoutes = require("@routes/admin/general")
// Basic Auth
const auth = require("@middlewares/basicAuth")
const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",

  "https://lifelineitinstitute.com",
  "https://dashboard.lifelineitinstitute.com",
  "https://admin.lifelineitinstitute.com",
]
// মেক শিওর করিয়েন যে লিংক এর পরে কোন / বা কিচ্ছু নাই, জাস্ট প্লেইন URL

const corsOptions = {
  origin: allowedOrigins, // function দরকারই নেই
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
app.use(helmet())
app.use(morgan("dev"))
app.use(cookieParser())

app.use(express.urlencoded({ extended: true })) // application/x-www-form-urlencoded
app.use(express.json()) // application/json
app.use("/logs", auth, express.static(path.join(__dirname, "_logs")))

app.get("/", (req, res) => {
  // Public URL goes here
  res.redirect("https://lifelineitinstitute.com")
})

// CODE SAFETY
// app.use((req, res, next) => {
//   const referer = req.headers.referer
//   console.log("REFER", referer)
//   next()
// })

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/student", studentRoutes)

// Student Dashboard routes
app.use("/api/dashboard", dashboardRoutes)

// Certificate Routes
app.use("/api/certificate", certificateRoutes)
// General Informations Dynamication
app.use("/api/general", generalRoutes)

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" })
})

module.exports = app

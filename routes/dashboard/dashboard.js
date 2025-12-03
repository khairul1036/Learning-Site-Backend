const express = require("express")

// Importing Database Models
const router = express.Router()

// JWT Datas
const verifyJWT = require("@middlewares/authMiddleware")

// Controllers:
const {
  dashboardController,
} = require("@controllers/dashboard/dashboard.controller")

const {
  addNotice,
  viewNotice,
  deleteNotice,
} = require("@controllers/dashboard/notice.controller")

const {
  registrationController,
} = require("@controllers/dashboard/registration.controller")

const {
  getApplyCertificateController,
  actionApplyController,
  postApplyController,
} = require("@controllers/admin/apply.certificate.controller")

const {
  certificateController,
} = require("@controllers/dashboard/certificate.controller")

const resetInfo = require("@controllers/dashboard/profile.controller")

// Middlewares
// const rateLimiter = require("@middlewares/rateLimiter")

// ROOT: /api/dashboard

router.get(
  "/",
  // rateLimiter(
  //   60 * 15 * 1000,
  //   50,
  //   "Too many requests, Please wait for some time."
  // ),
  verifyJWT,
  dashboardController
)

router.get("/notices", viewNotice)
router.post("/notices", addNotice)
router.delete("/notices/delete/:id", deleteNotice)

router.post(
  "/reset",
  // Comment out the rate limiter for now
  // Uncomment the line below to enable rate limiting after testing
  // rateLimiter(60 * 60 * 24 * 30 * 1000, 3, "Try again later"),
  verifyJWT,
  resetInfo
)

router.post(
  "/registration",
  // rateLimiter(60 * 1000, 1, "Limit Exceed!"),
  registrationController
)

router.get("/certificate/apply", getApplyCertificateController)
router.post("/certificate/apply", postApplyController)
router.post("/certificate/apply/:action", actionApplyController)

router.post(
  "/certificate",
  // rateLimiter(60 * 1000, 1, "Limit Exceed!"),
  certificateController
)

module.exports = router

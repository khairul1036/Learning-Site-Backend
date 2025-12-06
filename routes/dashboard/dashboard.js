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
  updateNotice,
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

// ROOT: /api/dashboard - fixed
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

// notice route - fixed
router.get("/notices", viewNotice);
router.post("/notices", verifyJWT, addNotice)
router.patch("/notices/:id", verifyJWT, updateNotice)
router.delete("/notices/:id", verifyJWT, deleteNotice)

// reset/update profile - fixed
router.post(
  "/reset",
  // Comment out the rate limiter for now
  // Uncomment the line below to enable rate limiting after testing
  // rateLimiter(60 * 60 * 24 * 30 * 1000, 3, "Try again later"),
  verifyJWT,
  resetInfo
)

// registration pdf generator - not fixed
router.post(
  "/registration",
  // rateLimiter(60 * 1000, 1, "Limit Exceed!"),
  registrationController
)

// certificate - fixed
router.get("/certificate/apply", getApplyCertificateController)
router.post("/certificate/apply", postApplyController)
router.post("/certificate/apply/:action", actionApplyController)

// certificate - fixed but response not checked
router.post(
  "/certificate",
  // rateLimiter(60 * 1000, 1, "Limit Exceed!"),
  certificateController
)

module.exports = router

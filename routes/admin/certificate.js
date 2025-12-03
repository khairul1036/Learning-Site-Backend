const {
  findCertificate,
  getCertificateInfo,
} = require("@controllers/admin/certificate.controller")

const express = require("express")
const router = express.Router()

// ROOT: /api/certificate
router.get("/", findCertificate) // GET
router.get("/all", getCertificateInfo) // GET

module.exports = router

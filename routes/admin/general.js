const express = require("express")
const router = express.Router()
const {
  getGeneralSettings,
  addGeneralSettings,
} = require("@controllers/admin/general.controller")

// ROOT: /api/general
router.get("/", getGeneralSettings) // GET
router.post("/", addGeneralSettings) // POST

module.exports = router

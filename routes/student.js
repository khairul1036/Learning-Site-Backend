const express = require("express")
const router = express.Router()
// Controllers
const {
  getStudents,
  createStudent,
  deleteStudent,
  updateStudent,
  findStudent,
} = require("@controllers/admin/student.controller") // Student Controller

// ADMIN Operation: Student

// ROOT: /api/student
router.get("/", getStudents) // GET
router.get("/:sid", findStudent)
router.post("/create", createStudent) // POST
router.delete("/delete/:sid", deleteStudent) // DELETE
router.patch("/update/:sid", updateStudent)

module.exports = router

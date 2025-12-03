const express = require("express")
const router = express.Router()
const {
  getCourses,
  getCoursesByName,
  getCoursesBySearch,
  getCourseById,
} = require("@controllers/courseView.controller")

// ADMIN CONTROLLERS

const {
  addCourse,
  deleteCourse,
  updateCourse,
} = require("@controllers/admin/courseManage.controller")

const rateLimiter = require("@middlewares/rateLimiter")

// ROOT: /api/courses
router.get("/", rateLimiter(60 * 5 * 1000, 60, "Too many Requests"), getCourses) // get All Courses
router.get("/search", getCoursesBySearch) // get Course by Search
router.get("/:name", getCoursesByName) // get Course by route
router.get("/id/:id", getCourseById) // get Course by Id

// ADMIN Operation: Course
router.post("/add", addCourse) // POST
router.delete("/delete/:route", deleteCourse) // DELETE
router.patch("/update/:route", updateCourse)

module.exports = router

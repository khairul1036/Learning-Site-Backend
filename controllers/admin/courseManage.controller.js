// ADMIN CONTROLLERS
const sanitize = require("mongo-sanitize");
const Course = require("@models/Course");
const client = require("@utils/redisClient");
const logger = require("@logger");

// Helper function — Create a unique slug based on title
const generateUniqueRoute = async (title) => {
  let slug = title.toLowerCase().trim().split(" ").join("-");
  let uniqueSlug = slug;
  let counter = 1;

  // Check if slug exists
  while (await Course.findOne({ route: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

// ------------------------------
// ADD COURSE (POST)
// ------------------------------
exports.addCourse = async (req, res) => {
  const data = sanitize(req.body);

  try {
    // Convert instructors to JSON if string
    if (data.instructors && typeof data.instructors === "string") {
      data.instructors = JSON.parse(data.instructors);
    }

    // Auto-generate route from title
    data.route = await generateUniqueRoute(data.title);

    const course = new Course(data);
    await course.save();

    // Clear Cache
    client.del("courses:all");

    res.status(200).json({
      status: true,
      message: "Course created successfully",
      route: data.route,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
    logger.error(err);
  }
};

// ------------------------------
// UPDATE COURSE (PATCH by _id)
// ------------------------------
exports.updateCourse = async (req, res) => {
  const id = sanitize(req.params.id);
  const data = sanitize(req.body);

  try {
    // If title updated, regenerate route
    if (data.title) {
      data.route = await generateUniqueRoute(data.title);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ status: false, error: "Course not found" });
    }

    // Clear cache
    client.del("courses:all");
    client.del(`courses:${updatedCourse.route}`);

    res.status(200).json({
      status: true,
      message: "Course updated successfully",
      route: updatedCourse.route,
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
    logger.error(err);
  }
};

// ------------------------------
// DELETE COURSE (DELETE by _id)
// ------------------------------
exports.deleteCourse = async (req, res) => {
  const id = sanitize(req.params.id);

  try {
    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({ status: false, error: "Course not found" });
    }

    // Clear Cache
    client.del("courses:all");
    client.del(`courses:${deletedCourse.route}`);

    res.status(200).json({
      status: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
    logger.error(err);
  }
};


// // ADMIN CONTROLLERS
// // Course Controller

// const sanitize = require("mongo-sanitize")
// const Course = require("@models/Course")
// const client = require("@utils/redisClient")
// const logger = require("@logger")

// // ADMIN CONTROLLERS
// exports.addCourse = async (req, res) => {
//   const data = sanitize(req.body)
//   if (data.instructors && typeof data.instructors === "string") {
//     data.instructors = JSON.parse(data.instructors)
//   }

//   console.log(data.route.toLowerCase().split(" ").join("-"))
//   data.route = data.route.toLowerCase().split(" ").join("-")

//   try {
//     const course = new Course(data)
//     await course.save()
//     res.status(200).json({ message: "Success" })

//     client.del("courses:all")
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//     logger.error(err)
//   }
// }

// exports.updateCourse = async (req, res) => {
//   let route = sanitize(req.params.route)
//   route = route.toLowerCase().split(" ").join("-")

//   console.log(route)
//   const data = sanitize(req.body)
//   data.route = data.route.toLowerCase().split(" ").join("-")
//   try {
//     const findCourse = await Course.findOneAndUpdate(
//       { route },
//       { $set: data },
//       { new: true }
//     )

//     console.log(findCourse)

//     client.del(`courses:${route}`)
//     client.del("courses:all")

//     return findCourse
//       ? res
//         .status(200)
//         .json({ status: true, message: "Course updated successfully" })
//       : res.status(404).json({ status: false, error: "Course not found" })
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//     logger.error(err)
//   }
// }

// exports.deleteCourse = async (req, res) => {
//   const route = sanitize(req.params.route)

//   try {
//     const findCourse = await Course.findOneAndDelete({ route })
//     client.del("courses:all")
//     client.del(`courses:${route}`)

//     return findCourse
//       ? res
//         .status(200)
//         .json({ status: true, message: "Course deleted successfully" })
//       : res.status(404).json({ status: true, error: "Course not found" })
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//     logger.error(err)
//   }
// }

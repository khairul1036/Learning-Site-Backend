const sanitize = require("mongo-sanitize");
const Course = require("@models/Course");
const client = require("@utils/redisClient");
const logger = require("@logger");

// ------------------------------------------------------
// GET ALL MODULES OF A COURSE
// ------------------------------------------------------
exports.getModules = async (req, res) => {
    const courseId = sanitize(req.params.id);

    try {
        const course = await Course.findById(courseId).select("modules title");

        if (!course) {
            return res.status(404).json({ status: false, message: "Course not found" });
        }

        res.status(200).json({
            status: true,
            courseTitle: course.title,
            modules: course.modules,
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ status: false, error: err.message });
    }
};

// ------------------------------------------------------
// ADD MODULE
// ------------------------------------------------------
exports.addModule = async (req, res) => {
    const courseId = sanitize(req.params.id);
    const moduleData = sanitize(req.body);

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ status: false, message: "Course not found" });
        }

        // Push module into array
        course.modules.push(moduleData);
        await course.save();

        client.del("courses:all");
        client.del(`courses:${course.route}`);

        res.status(200).json({
            status: true,
            message: "Module added successfully",
            modules: course.modules,
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ status: false, error: err.message });
    }
};

// ------------------------------------------------------
// UPDATE MODULE
// ------------------------------------------------------
exports.updateModule = async (req, res) => {
    const courseId = sanitize(req.params.id);
    const moduleId = sanitize(req.params.moduleId);
    const data = sanitize(req.body);

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ status: false, message: "Course not found" });
        }

        const module = course.modules.id(moduleId);

        if (!module) {
            return res.status(404).json({ status: false, message: "Module not found" });
        }

        Object.assign(module, data);
        await course.save();

        client.del("courses:all");
        client.del(`courses:${course.route}`);

        res.status(200).json({
            status: true,
            message: "Module updated successfully",
            module,
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ status: false, error: err.message });
    }
};

// ------------------------------------------------------
// DELETE MODULE
// ------------------------------------------------------
exports.deleteModule = async (req, res) => {
    const courseId = sanitize(req.params.id);
    const moduleId = sanitize(req.params.moduleId);

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ status: false, message: "Course not found" });
        }

        const module = course.modules.id(moduleId);

        if (!module) {
            return res.status(404).json({ status: false, message: "Module not found" });
        }

        module.deleteOne();
        await course.save();

        client.del("courses:all");
        client.del(`courses:${course.route}`);

        res.status(200).json({
            status: true,
            message: "Module deleted successfully",
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ status: false, error: err.message });
    }
};

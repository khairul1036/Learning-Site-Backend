const mongoose = require("mongoose")

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    about: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    sign: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
)

const linkSchema = new mongoose.Schema(
  {
    fb: {
      type: [{ title: String, link: String }],
      required: true,
      trim: true,
    },
    zoom: {
      type: [{ title: String, link: String }],
      required: true,
    },
  },
  { _id: false }
)

const modulesSchema = new mongoose.Schema(
  [
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
      },
      videoLink: {
        type: String,
        required: true,
        trim: true,
      },
      resources: {
        type: [
          {
            title: {
              type: String,
              required: true,
              trim: true,
            },
            link: {
              type: String,
              required: true,
              trim: true,
            },
          },
        ],
        default: [],
      },
    },
  ],
  { _id: false }
)

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    route: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["online", "offline"],
    },
    category: {
      type: String,
      trim: true,
    },
    introVideo: {
      type: String,
      trim: true,
    },
    instructors: {
      type: [instructorSchema],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one instructor required"],
    },
    cutPrice: {
      type: String,
      trim: true,
    },
    price: {
      type: String,
      trim: true,
      default: "Free",
    },
    starCount: {
      type: String,
      trim: true,
      default: "5",
    },
    reviewCount: {
      type: String,
      trim: true,
    },
    startDate: {
      type: String,
      trim: true,
    },
    totalClasses: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    enrolledStudents: [
      {
        type: String,
      },
    ],
    links: {
      type: [linkSchema],
      required: true,
    },
    modules: {
      type: [modulesSchema],
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Course", courseSchema)

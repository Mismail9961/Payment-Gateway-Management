import mongoose from "mongoose";

// Course Schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'], // Must have a title
    trim: true,
    maxLength: [100, 'Course title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxLength: [200, 'Course subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Course category is required'], // Must choose a category
    trim: true
  },
  level: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'advanced'], // Allowed values only
      message: 'Please select a valid course level'
    },
    default: 'beginner'
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Course price must be non-negative']
  },
  thumbnail: {
    type: String,
    required: [true, 'Course thumbnail is required']
  },
  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId, // Links to User model
      ref: 'User'
    }
  ],
  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId, // Links to Lecture model
      ref: "Lecture"
    }
  ],
  instructor: {
    type: mongoose.Schema.Types.ObjectId, // Links to User model
    ref: 'User',
    required: [true, 'Course instructor is required']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  totalDuration: {
    type: Number,
    default: 0 // In minutes or seconds (decide for consistency)
  },
  totalLectures: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // Automatically adds createdAt & updatedAt
  toJSON: { virtuals: true }, // Include virtuals in JSON
  toObject: { virtuals: true } // Include virtuals in plain objects
});

// Virtual field for average rating (placeholder until review system exists)
courseSchema.virtual('averageRating').get(function () {
  return 0;
});

// Before saving: update total lectures based on lectures array
courseSchema.pre('save', function (next) {
  if (this.lectures) {
    this.totalLectures = this.lectures.length;
  }
  next();
});

export const Course = mongoose.model("Course", courseSchema);

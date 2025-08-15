import mongoose from "mongoose";

// Small schema for each lecture's progress
const lectureProgressSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId, // Link to a Lecture
    ref: "Lecture",
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false // Starts as not completed
  },
  watchTime: {
    type: Number,
    default: 0 // How many seconds/minutes watched
  },
  lastWatched: {
    type: Date,
    default: Date.now // When the user last watched it
  }
});

// Main schema for tracking course progress
const courseProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Link to a User
    ref: "User",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId, // Link to a Course
    ref: "Course",
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false // Has the course been finished?
  },
  completionPercentage: {
    type: Number,
    default: 0 // How much of the course is done (0–100%)
  },
  lectureProgress: [lectureProgressSchema], // Progress for each lecture
  lastAccessed: {
    type: Date,
    default: Date.now // When user last opened the course
  }
});

// Before saving, update the completion percentage and status
courseProgressSchema.pre("save", function (next) {
  if (this.lectureProgress.length > 0) {
    // Count lectures that are completed
    const completedCount = this.lectureProgress.filter(lp => lp.isCompleted).length;

    // Calculate percentage
    this.completionPercentage = Math.round((completedCount / this.lectureProgress.length) * 100);

    // Mark as completed if 100%
    this.isCompleted = this.completionPercentage === 100;
  }
  next();
});

// Simple method to update "last accessed" date
courseProgressSchema.methods.updateLastAccessed = function () {
  this.lastAccessed = Date.now();
  return this.save({ validateBeforeSave: false });
};

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

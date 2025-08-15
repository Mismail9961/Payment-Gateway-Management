import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Define what a user looks like
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxLength: 50 },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email"],
  },
  password: { type: String, required: true, minLength: 8, select: false },
  role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
  avatar: { type: String, default: "default-avatar.png" },
  bio: { type: String, maxLength: 200 },
  enrolledCourses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    enrolledAt: { type: Date, default: Date.now },
  }],
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare entered password with stored one
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create a password reset token
userSchema.methods.getResetPasswordToken = function() {
  const token = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return token;
};

// Count total enrolled courses
userSchema.virtual("totalEnrolledCourses").get(function() {
  return this.enrolledCourses.length;
});

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  return this.save({ validateBeforeSave: false });
};

export const User = mongoose.model("User", userSchema);

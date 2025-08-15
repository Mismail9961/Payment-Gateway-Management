import mongoose from "mongoose";

// Define what a Lecture looks like
const lectureSchema = new mongoose.Schema({
    // Title of the lecture
    title: {
        type: String,
        required: [true, 'Lecture title is required'],
        trim: true,
        maxLength: [100, 'Lecture title cannot exceed 100 characters']
    },
    // Description of the lecture
    description: {
        type: String,
        trim: true,
        maxLength: [500, 'Lecture description cannot exceed 500 characters']
    },
    // Video file URL
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required']
    },
    // Length of the lecture video
    duration: {
        type: Number,
        default: 0
    },
    // Cloud service file ID (e.g., Cloudinary public_id)
    publicId: {
        type: String,
        required: [true, 'Public ID is required for video management']
    },
    // Whether this lecture is a free preview
    isPreview: {
        type: Boolean,
        default: false
    },
    // Order of the lecture in the course
    order: {
        type: Number,
        required: [true, 'Lecture order is required']
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Before saving, format duration to 2 decimal places
lectureSchema.pre('save', function(next) {
    if (this.duration) {
        this.duration = Math.round(this.duration * 100) / 100;
    }
    next();
});

// Create Lecture model
export const Lecture = mongoose.model('Lecture', lectureSchema);

import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import e from "cors";
import { deleteVideoFromCloudinary, uploadmedia } from "../utils/cloudinary.js";

// Create a new account
export const createUserAccount = catchAsync(async (req, res) => {
    const { name, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new ApiError("User already exists", 400);
    }

    // Create new user
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
    });

    await user.updateLastActive();

    // Send token
    return generateToken(res, user, "Account created successfully");
});

// Log in user
export const authenticateUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError("Invalid email or password", 401);
    }

    await user.updateLastActive();

    return generateToken(res, user, `Welcome back ${user.name}`);
});

// Log out user
export const signOutUser = catchAsync(async (_, res) => {
    res.cookie("token", "", { maxAge: 0 });
    return res.status(200).json({
        success: true,
        message: "Signed out Successfully",
    });
});

// Get current user's profile
export const getCurrentUserProfile = catchAsync(async (req, res) => {
    const user = await User.findById(req.id).populate({
        path: "enrolledCourses.course",
        select: "title thumbnail description",
    });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    return res.status(200).json({
        success: true,
        data: {
            ...user.toJSON(),
            totalEnrolledCourses: user.totalEnrolledCourses,
        },
    });
});

export const UpdateUserProfile = catchAsync(async (req, res) => {
    const {email,name,bio} = req.body
    const updateData = {
        name,
        email:email?.toLowerCase(),
        bio
    };

    if(req.file){
        const avatarResult = await UploadMedia(req.file.path);
        updateData.avatar = avatarResult.secure_url

        //delete old avatar:
        const user = await User.findById(req.id);
        if(user.avatar && user.avatar !== 'default-avatar.png'){
            await deleteVideoFromCloudinary(user.avatar)
        };
    };

    const updateUser = await User.findByIdAndUpdate(
        req.id,
        updateData,
        {new:true,runValidators:true}
    );

    if(!updateUser){
        throw new ApiError("User not Found",404)
    }

    res.status(200).json({
        success:true,
        message: "User Updated Successfully",
        data: updateUser
    })
});
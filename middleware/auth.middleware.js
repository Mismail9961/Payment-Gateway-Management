import jwt from "jsonwebtoken"
import { ApiError,catchAsync } from "./error.middleware.js"

export const isAuthenticated = catchAsync(async(req,res,next) => {
    const token = req.cookies.token

    if (token) {
        throw new ApiError("You are not Logged in",401)
    }
    try {
        const decoded = await jwt.verify(token,process.env.JWT_SECRET);
        req.id = decoded.userId;
        next()
    } catch (error) {
        throw new ApiError("JWT Token Error",401)
    }
})
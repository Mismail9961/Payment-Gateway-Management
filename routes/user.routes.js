import express from 'express';
import {createUserAccount,authenticateUser,signOutUser,getCurrentUserProfile,UpdateUserProfile} from "../controllers/user.controller.js"
import {isAuthenticated} from "../middleware/auth.middleware.js"
import upload from "../utils/multer.js"

const router = express.Router();

router.post("/sign-up", createUserAccount);
router.post("/login",authenticateUser)
router.post("/logOut",signOutUser)

//Profile Routes:
router.post("Profile",isAuthenticated,getCurrentUserProfile)
router.patch("Profile",isAuthenticated,upload.single("avatar"),UpdateUserProfile)


export default router;
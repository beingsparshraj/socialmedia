import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/clouinary.js";
import Post from "../models/post.model.js";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User already exists",
                success: false,
            });
        }

        // hash the password before saving

        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) {
            return res.status(500).json({
                message: "Error hashing password",
                success: false,
            });
        }

        await User.create({
            username,
            email,
            password: hashedPassword,
        });
        return res.status(201).json({
            message: "User registered successfully",
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });

    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
            });
        }
       
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false,
            });
        }

        // cookies
        const token = await jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" });

        // populate each post if in the arrary
        const populatedPost = await Promise.all(
            user.post.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post?.author?.equals(user._id)) {
                    return post;
                }
                return null;
            })
        );

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            following: user.following,
            followers: user.followers,
            post: user.post,
        }
        return res.cookie('token', token, {
            httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000
        }).json({
            message: `Welcome back, ${user.username}!`,
            success: true,
            user,

        })
    } catch (error) {
        console.log(error);

    }
}



export const logout = async (req, res) => {
    try {
        return res.cookie('token', "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'post',createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            message: "User profile fetched successfully",
            success: true,
            user,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });

    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        let cloudResponse;
        const { bio, gender } = req.body;
        const profilePicture = req.file;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();
        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

export const getsuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } })
            .select("-password");
        if (!suggestedUsers) {
            return res.status(404).json({
                message: "No suggested users found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Suggested users fetched successfully",
            success: true,
            users: suggestedUsers,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });

    }
}

export const followOrUnfollow = async (req, res) => {
    try {
        const followId = req.id;
        const followerId = req.params.id;
        if (followId === followerId) {
            return res.status(400).json({
                message: "You cannot follow yourself",
                success: false,
            });
        }

        const user = await User.findById(followId);
        const targetUser = await User.findById(followerId);
        if (!user || !targetUser) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
        //to check follow or unfollow
        const isFollowing = user.following.includes(followerId);
        if (isFollowing) {
            // unfollow
            await Promise.all([
                User.updateOne({ _id: followerId }, { $pull: { followers: followId } }),
                User.updateOne({ _id: followId }, { $pull: { following: followerId } }),


            ]);
            return res.status(200).json({
                message: "Unfollowed successfully",
                success: true,
            });

        } else {
            // follow
            await Promise.all([
                User.updateOne({ _id: followId }, { $push: { following: followerId } }),
                User.updateOne({ _id: followerId }, { $push: { followers: followId } }),


            ]);
            return res.status(200).json({
                message: "Followed successfully",
                success: true,
            });


        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });

    }
}

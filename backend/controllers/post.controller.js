import sharp from "sharp";
import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import cloudinary from "../utils/clouinary.js";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";

export const addnewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;
        if (!image) {
            return res.status(400).json({
                message: "Image is required",
                success: false,
            });
        }
        // image upload using multer
        const optimizedImageBuffer = await sharp(image.buffer).resize({ width: 800, height: 800, fit: 'inside' }).toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        // create 

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId,
        });

        const user = await User.findById(authorId);
        if (user) {
            user.post.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });
        return res.status(201).json({
            message: "Post created successfully",
            post,
            success: true,

        });
    } catch (error) {
        console.log(error);

    }

}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({ path: 'author', select: 'username profilePicture' }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });
        return res.status(200).json({
            message: "Posts fetched successfully",
            posts: posts,
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });

    }
}

export const getUserPosts = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({ path: 'author', select: 'username, profilePicture' }).populate({
            path: 'comments',
            select: 'username,profilePicture',
            sort: { createdAt: -1 },
        })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username, profilePicture'
                }
            });
        return res.status(200).json({
            message: "User posts fetched successfully",
            posts: posts,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });

    }
}

export const likePost = async (req, res) => {
    try {
        const likedUser = req.id;
        const postId = req.params.id;

        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                message: "Invalid post ID",
                success: false,
            });
        }

        const post = await Post.findById(postId);


        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }    // like logic

        await post.updateOne({
            $addToSet: { likes: likedUser }
        })
        await post.save();

        // implementing the socket io for real time implementation

        return res.status(200).json({
            message: "Post liked successfully",
            post: post,
            success: true,
        });


    } catch (error) {
        console.log(error);

    }
}

export const dislikePost = async (req, res) => {
    try {
        const likedUser = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }    // like logic

        await post.updateOne({
            $pull: { likes: likedUser }
        })
        await post.save();

        // implementing the socket io for real time implementation

        return res.status(200).json({
            message: "Post disliked successfully",
            post: post,
            success: true,
        });


    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });

    }
}

export const addcomment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentUser = req.id;
        const { text } = req.body;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }
        const comment = await Comment.create({
            text,
            author: commentUser,
            post: postId,
        })
        await comment.populate({
            path: 'author',
            select: 'username profilePicture'
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message: "Comment added successfully",
            comment: comment,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });

    }
}

export const getCommentOfPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Post.find({ post: postId }).populate('author, username, profilePicture');

        if (!comments) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Comments fetched successfully",
            comments: comments,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });

    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }
        // Check if the post belongs to the user
        if (post.author.toString() !== authorId) {
            return res.status(403).json({
                message: "You are not authorized to delete this post",
                success: false,
            });
        }
        await Post.findByIdAndDelete(postId);

        // remove the post id from user
        let user = await User.findById(authorId);
        user.post = user.post.filter(id => id.toString() !== postId);

        await user.save();

        // delete the comments associated with the post
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            message: "Post deleted successfully",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });
    }
}


export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        }
        const user = await User.findById(authorId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({
                $pull: { bookmarks: post._id }
            });
            await user.save();
            return res.status(200).json({
                message: "Post removed from bookmarks",
                success: true,
            });

        } else {
            await user.updateOne({
                $pull: { bookmarks: post._id }
            });
            await user.save();
            return res.status(200).json({
                message: "Post add from bookmarks",
                success: true,
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });

    }
}
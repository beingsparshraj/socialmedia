import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';
import { addcomment, addnewPost, bookmarkPost, deletePost, dislikePost, getAllPosts, getCommentOfPost, getUserPosts, likePost } from '../controllers/post.controller.js';

const router = express.Router();

router.route('/addpost').post(isAuthenticated, upload.single('image'), addnewPost);

router.route('/all').get(isAuthenticated, getAllPosts);

router.route('/userpost/all').get(isAuthenticated, getUserPosts);

router.route('/:id/like').get(isAuthenticated, likePost);

router.route('/:id/dislike').get(isAuthenticated, dislikePost);

router.route('/:id/comment').post(isAuthenticated, addcomment);

router.route('/:id/comment/all').post(isAuthenticated, getCommentOfPost);

router.route('/delete/:id').delete(isAuthenticated, deletePost);

router.route('/:id/bookmark').post(isAuthenticated, bookmarkPost);

export default router;
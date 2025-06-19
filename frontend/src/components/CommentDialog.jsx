import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { useDispatch, useSelector } from 'react-redux';
import Comment from './Comment';
import axios from 'axios';
import { toast } from 'sonner';
import { setPosts } from '../redux/postSlice';

const CommentDialog = ({ open, setOpen }) => {
    const [text, setText] = useState("");
    const { selectedPost, posts } = useSelector(store => store.post);
    const [comment, setComment] = useState(selectedPost?.comments);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedPost) {
            setComment(selectedPost.comments);
        }
    }, [selectedPost]);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const sendMessageHandler = async () => {
        try {
            const res = await axios.post(`https://socialmedia-3-13ju.onrender.com/api/v1/post/${selectedPost?._id}/comment`, { text }, {
                headers: {
                    'Content-Type': 'application/json'
                }, withCredentials: true
            }
            );

            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p => p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p);
                dispatch(setPosts(updatedPostData));

                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <Dialog open={open}>
                <DialogContent className='w-[900px]  w-full min-h-[500px] flex flex-col' onInteractOutside={() => setOpen(false)}>
                    <div className="flex flex-1">
                        <div className="w-1/2   ">
                            <img className='w-full h-full object-cover rounded-l-lg' src={selectedPost?.image} alt="post_img" />
                        </div>

                        <div className="w-1/2 flex flex-col justify-between">
                            <div className="flex items-center p-4 justify-between">
                                <div className="flex gap-3 items-center">
                                    <Link to='/profile'>
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src={selectedPost?.author?.author?.profilePicture} />

                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="">
                                        <Link className="font-semibold text-xs">{selectedPost?.author?.author?.username}</Link>
                                        {/* <span className='text-gray-600 text-sm'>Bio here...</span> */}
                                    </div>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <MoreHorizontal className='cursor-pointer' />
                                    </DialogTrigger>
                                    <DialogContent className='flex flex-col items-center text-sm text-center'>
                                        <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                                            Unfollow
                                        </div>
                                        <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                                            Add to Favorites
                                        </div>
                                    </DialogContent>
                                </Dialog>


                            </div>
                            <hr />
                            <div className="flex-1 overflow-y-auto max-h-96 p-4">
                                {
                                    comment?.map((comment) => <Comment key={comment._id} comment={comment} />)
                                }
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2">
                                    <input value={text} onChange={changeEventHandler} type="text"
                                        className='w-full  outlined-none border-gray-300 p-2 rounded'
                                        placeholder='Add a comment...' />
                                    <Button disabled={!text.trim()} onClick={sendMessageHandler} varient='outline'>Send</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CommentDialog

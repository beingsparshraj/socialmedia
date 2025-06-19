import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { readFileAsDataUrl } from '../lib/utils.ts';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import store from '../redux/store.js';
import { setPosts } from '../redux/postSlice.js';
import Posts from './Posts.jsx';


const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);

  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataUrl(file);
      setImagePreview(dataUrl);
    }
  }

  const createPostHandler = async (e) => {
    e.preventDefault();
    console.log(file, caption)
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("caption", caption);
      if (file) formData.append("image", file);
      const res = await axios.post('http://localhost:8000/api/v1/post/addpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]))
        toast.success(res.data.message);
        setOpen(false);
      }

    } catch (error) {
      toast.error(error.response.data.message);

    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <Dialog open={open}>
        <DialogContent onInteractOutside={() => setOpen(false)}>
          <DialogHeader className='text-center font-semibold'>Create new Post</DialogHeader>
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage className='w-15 h-15' alt='img' src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="">
              <h1 className='font-semibold text-xs'>{user?.username}</h1>
              <span className='text-gray-600 text-xs'>Bio here...</span>
            </div>
          </div>

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="focus-visible:ring-transparent border-none"
            placeholder="Write a caption..."
          ></Textarea>

          {
            imagePreview && (
              <div className="w-full h-64 flex items-center justify-center">
                <img src={imagePreview} className='w-full h-64 flex items-center justify-center w-full rounded-md' alt="preview_img" />
              </div>
            )
          }

          <input onChange={fileChangeHandler} ref={imageRef} type='file' className='hidden'></input>

          <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf] '>Select from your Device</Button>
          {
            imagePreview && (
              loading ? (
                <Button><Loader2 className="mr-2 h-4 w-4 animate-spin">
                </Loader2>
                  Please wait
                </Button>
              ) : (
                <Button onClick={createPostHandler} type="submit" className="w-full ">post</Button>
              )
            )
          }

        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreatePost

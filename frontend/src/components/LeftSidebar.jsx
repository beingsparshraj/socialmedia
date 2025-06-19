import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from 'axios';
import { toast } from 'sonner';
import store from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '../redux/postSlice';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  // const createPostHandler = () => {
  //   setOpen(true);
  // }

  const logoutHandler = async () => {
    try {
      const res = await axios.get('https://socialmedia-3-13ju.onrender.com/api/v1/user/logout', {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);

      }



    } catch (error) {
      toast.error(error.message.data.message);
    }
  }

  const sidebarHandler = async (textType) => {
    if (textType === 'logout') logoutHandler();
    else if (textType === "Create") {
      setOpen(true);
    } else if (textType === 'Profile') {
      navigate(`/profile/${user?._id}`)
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === 'Message') {
      navigate('/chat');
    }
  }

  const SidebarItems = [
    {
      icon: <Home />,
      text: "Home"
    },
    {
      icon: <Search />,
      text: "Search"
    }, {
      icon: <TrendingUp />,
      text: "Explore"
    }, {
      icon: <MessageCircle />,
      text: "Message"
    }, {
      icon: <Heart />,
      text: "Notification"
    }, {
      icon: <PlusSquare />,
      text: "Create"
    },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} />

          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile"
    },
    {
      icon: <LogOut />,
      text: "logout"
    },
  ]

  return (
    <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
      <div className="flex flex-col">
        <h1 className='my-8 pl-3 font-bold text-xl'>LOGO</h1>
        <div className="">
          {
            SidebarItems.map((item, index) => {
              return (
                <div onClick={() => sidebarHandler(item.text)} className='flex items-center gap-4 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 m-3' key={index}>

                  {item.icon}
                  <span>{item.text}</span>
                </div>
              )
            })
          }
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />


    </div>
  )
}

export default LeftSidebar

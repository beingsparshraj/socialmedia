import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { setSelectedUser } from '../redux/authSlice';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '../redux/chatSlice';
import store from '../redux/store';

const ChatPage = () => {
    const dispatch = useDispatch();
    const [textMessage, setTextMessage] = useState("");
    const { onlineUsers, messages = [] } = useSelector(store => store.chat);


    const sendMessageHandler = async (reciverId) => {
        try {
            const res = await axios.post(
                `https://socialmedia-3-13ju.onrender.com/api/v1/message/send/${reciverId}`,
                { textMessage },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            if (res.data.success) {
                console.log(messages);
                dispatch(setMessages([...messages, res.data.newMessage]))
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }

    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    }, []);

    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    return (
        <div className='flex ml-[16%] h-screen'>
            <section className='w-full md:w-1/4 my-8'>
                <h1 className='font-bold mb-4 px-3 text-xl'>{user?.username}</h1>
                <hr className='border-gray-300 mb-4' />
                <div className="overflow-y-auto h-[80vh]">
                    {
                        suggestedUsers.map((suggestedUser) => {

                            const isOnline = onlineUsers.includes(suggestedUser?._id);
                            return (

                                <div onClick={() => dispatch(setSelectedUser(suggestedUser))} className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer">
                                    <Avatar className=''>
                                        <AvatarImage className='h-8 w-12' src={suggestedUser?.profilePicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className="flex font-bold flex-col ">
                                        <span className='font-medium'>{suggestedUser?.username}</span>
                                        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>{isOnline ? 'Online' : 'offline'} </span>
                                    </div>

                                </div>
                            )
                        })
                    }
                </div>
            </section>

            {
                selectedUser ? (
                    <section className='flex-1 border-1-gray-300 flex flex-col'>
                        <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0">

                            <Avatar src={selectedUser?.profilePicture} alt="profile">
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <span>{selectedUser?.username}</span>
                        </div>

                        {/* messages here */}

                        <Messages selectedUser={selectedUser} />

                        <div className="flex items-center p-4 border-t border-t-gray-300">
                            <Input value={textMessage} onChange={(e) => setTextMessage(e.target.value)} type="text" className="flex-1 mr-2 focus-visible:ring-transparent" placeholder="messages..."></Input>
                            <Button onClick={() => sendMessageHandler(selectedUser?._id)}>Send</Button>
                        </div>
                    </section>
                ) : (
                    <div className="flex flex-col items-center justify-center mx-auto">
                        <MessageCircleCode className="w-32 h-32 my-4"></MessageCircleCode>
                        <h1 className='font-medium text-xl '>your messages</h1>
                        <span>send a message to start a chat</span>
                    </div>
                )
            }


        </div>


    )
}

export default ChatPage

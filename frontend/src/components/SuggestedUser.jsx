import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'

const SuggestedUser = () => {
    const { suggestedUsers = [] } = useSelector(store => store.auth);
    return (
        <div className='my-10'>
            <div className="flex items-center justify-between">
                <h1 className='font-bold text-gray-600'>Suggested for you</h1>
                <span className='font-medium cursor-pointer'>See All</span>
            </div>
            {
                suggestedUsers.map((user) => {
                    return (
                        <div key={user._id} className="flex">
                            <div className="">
                                <div className='flex items-center gap-2'>
                                    <Link to={`/profile/${user?._id}`} >
                                        <Avatar>
                                            <AvatarImage src={user?.profilePicture} alt="postimage" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div >
                                        <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                        <span className='text-gray-600 text-sm'>{user?.bio || 'bio here...'}</span>
                                    </div>
                                </div>
                            </div>
                            <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]'>Follow</span>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default SuggestedUser

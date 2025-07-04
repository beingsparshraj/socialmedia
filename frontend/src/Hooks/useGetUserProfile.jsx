import axios from "axios"
import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux";
import { setUserProfile } from "../redux/authSlice";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    // const [userProfile, setUserProfile] = useState(null);
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`https://socialmedia-3-13ju.onrender.com/api/v1/user/${userId}/profile`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchUserProfile();
    }, [userId,dispatch]);
}
export default useGetUserProfile;
import axios from "axios"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux";
import { setPosts } from "../redux/postSlice";

const useGetAllPost = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                const res = await axios.get('https://socialmedia-3-13ju.onrender.com/api/v1/post/all', { withCredentials: true });
                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));

                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllPost();
    }, []);
}
export default useGetAllPost;
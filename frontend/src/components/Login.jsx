import React from 'react'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import { useEffect } from 'react';
import store from '../redux/store';

const Signup = () => {

    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const changeEventHandler = (e) => {
        setInput({
            ...input, [e.target.name]: e.target.value
        });
    }

    const [input, setInput] = React.useState({
        email: "",
        password: ""
    })

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post("https://socialmedia-3-13ju.onrender.com/api/v1/user/login", input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });

            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({
                    email: "",
                    password: ""
                });
            }

        } catch (error) {
            console.error("Login failed:", toast.error(error.response.data.message));

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [])

    return (
        <div className='flex items-center justify-center h-screen w-screen'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                <div className='my-4 '>
                    <h1 className='text-center font-bold text-xl'>LOGO</h1>
                    <p className='text-sm text-center'>Login to see photos & videos from your friend</p>
                </div>


                <div >
                    <span className='font-medium'>Email</span>
                    <Input
                        className="focus-visible:ring-transparent" type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}

                    ></Input>
                </div>

                <div >
                    <span className='font-medium'>Password</span>
                    <Input
                        className="focus-visible:ring-transparent" type="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        name="password"></Input>
                </div>



                <Button type='submit'>Login</Button>
                <span className='text-center'>Don't  have an account ? <Link className='text-blue-600' to="/register">Sign Up</Link></span>
            </form>
        </div>
    )
}

export default Signup;

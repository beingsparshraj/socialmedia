import React from 'react'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {

  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();


  const changeEventHandler = (e) => {
    setInput({
      ...input, [e.target.name]: e.target.value
    });
  }

  const [input, setInput] = React.useState({
    username: "",
    email: "",
    password: ""
  })

  const signupHandler = async (e) => {
    e.preventDefault();
    console.log(input)
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/v1/user/register", input, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      if (res.data.success) {
        navigate('/login')
        toast.success(res.data.message);
        setInput({
          username: "",
          email: "",
          password: ""
        });
      }

    } catch (error) {
      console.error("Signup failed:", toast.error(error.response.data.message));

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex items-center justify-center h-screen w-screen'>
      <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
        <div className='my-4 '>
          <h1 className='text-center font-bold text-xl'>LOGO</h1>
          <p className='text-sm text-center'>signup to see photos & videos from your friend</p>
        </div>
        <div >
          <span className='font-medium'>username</span>
          <Input
            value={input.username} className="focus-visible:ring-transparent" type="text"
            onChange={changeEventHandler}
            name="username"></Input>
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
        <Button type='submit'>Signup</Button>
        <span className='text-center'>Already have an account ? <Link className='text-blue-600' to="/login">Login</Link></span>
      </form>
    </div>
  )
}

export default Signup;

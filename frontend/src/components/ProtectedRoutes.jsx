import React from 'react'
import { useSelector } from 'react-redux'
import store from '../redux/store'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoutes = ({children}) => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    useEffect(()=>{
        if(!user){
            navigate('/login');
        }
    },[])
    return <>{children}</>
}

export default ProtectedRoutes

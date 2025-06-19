import React from 'react'
import LeftSidebar from './LeftSidebar'
import { Outlet } from 'react-router-dom';


const MainLayout = () => {
  return (
    <div>
      <LeftSidebar />
      <div className="">
        <Outlet />
      </div>

    </div>
  )
}



export default MainLayout;

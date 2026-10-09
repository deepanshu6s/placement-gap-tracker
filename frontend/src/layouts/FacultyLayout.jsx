import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';

export const FacultyLayout = () => {
  return (
    <div className="min-h-screen bg-[#0A0908] text-[#F5F0EB] flex flex-col selection:bg-[#FF6A2A]/20 selection:text-[#FF6A2A]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar role="faculty" />
        <div className="flex-1 bg-[#0A0908] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FacultyLayout;

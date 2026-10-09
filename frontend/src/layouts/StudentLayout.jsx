import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';

export const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[#080B12] text-[#F3F7FC] flex flex-col selection:bg-[#42F5E8]/20 selection:text-[#42F5E8]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar role="student" />
        <div className="flex-1 bg-[#080B12] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';

export const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar role="student" />
        <div className="flex-1 bg-slate-950 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';

export const FacultyLayout = () => {
  return (
    <div
      className="min-h-screen flex flex-col selection:bg-[#FF6A2A]/20"
      style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar role="faculty" />
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-app)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FacultyLayout;

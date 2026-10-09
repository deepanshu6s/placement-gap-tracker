import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  UserCheck,
  Users,
  Target,
  BarChart3,
  X,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ role = 'student' }) => {
  const { isSidebarOpen, closeSidebar } = useUiStore();

  const studentLinks = [
    { to: '/student', label: 'Dashboard & Readiness', icon: LayoutDashboard },
    { to: '/student/roles', label: 'Career Roles & Skills', icon: Compass },
    { to: '/student/preparation', label: 'Preparation Tracker', icon: CalendarCheck },
    { to: '/student/profile-setup', label: 'My Academic Profile', icon: UserCheck },
  ];

  const facultyLinks = [
    { to: '/faculty', label: 'Cohort Readiness & Roster', icon: Users },
  ];

  const links = role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-[#080B12]/80 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-[#0D1320] border-r border-[#243249] flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } min-h-[calc(100vh-4.5rem)]`}
      >
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#243249]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#42F5E8]" />
            <span className="font-bold text-[#F3F7FC] text-sm">Navigation Menu</span>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-[#A6B4C8] hover:text-[#F3F7FC] hover:bg-[#17243A]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Label */}
        <div className="p-4 pb-2">
          <div className="text-[11px] font-bold text-[#77869B] uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>{role === 'faculty' ? 'Faculty Command' : 'Student Workspace'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#42F5E8]" />
          </div>

          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/student' || link.to === '/faculty'}
                  onClick={() => {
                    if (window.innerWidth < 1024) closeSidebar();
                  }}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#17243A] text-[#42F5E8] border border-[#42F5E8]/30 shadow-[0_0_15px_-4px_rgba(66,245,232,0.25)]'
                        : 'text-[#A6B4C8] hover:text-[#F3F7FC] hover:bg-[#17243A]/60 border border-transparent'
                    }`
                  }
                >
                  <Icon
                    size={18}
                    className="flex-shrink-0 transition-transform group-hover:scale-110"
                  />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Workspace Quick Tip Box */}
        <div className="mt-auto p-4 m-4 rounded-xl bg-[#111B2D] border border-[#243249]">
          <div className="flex items-center gap-2 mb-1.5">
            <Target size={15} className="text-[#C4FF58]" />
            <span className="text-xs font-bold text-[#F3F7FC]">Diagnostic Tip</span>
          </div>
          <p className="text-[12px] text-[#A6B4C8] leading-relaxed">
            {role === 'faculty'
              ? 'Filter by branch and batch year to inspect students with critical readiness gaps.'
              : 'Complete topic assessments to update your readiness score and receive tailored recommendations.'}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

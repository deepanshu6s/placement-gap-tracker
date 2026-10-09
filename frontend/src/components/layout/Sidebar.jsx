import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  UserCheck,
  Users,
  Target,
  X,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ role = 'student' }) => {
  const { isSidebarOpen, closeSidebar } = useUiStore();

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, closeSidebar]);

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
          className="fixed inset-0 z-40 bg-[#0A0908]/80 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-60 bg-[#12100E] border-r border-[#34271F] flex flex-col transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } min-h-[calc(100vh-4rem)]`}
      >
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#34271F]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FF6A2A]" />
            <span className="font-bold text-[#F5F0EB] text-sm">Navigation</span>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-[#C3B7AD] hover:text-[#F5F0EB] hover:bg-[#241B16]"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Label & Navigation Links */}
        <div className="p-3.5 pb-2">
          <div className="text-[11px] font-semibold text-[#A3978D] uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>{role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A2A]" />
          </div>

          <nav className="space-y-1">
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
                    `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'bg-[#241B16] text-[#FF6A2A] border-l-2 border-[#FF6A2A]'
                        : 'text-[#C3B7AD] hover:text-[#F5F0EB] hover:bg-[#241B16]/60 border-l-2 border-transparent'
                    }`
                  }
                >
                  <Icon
                    size={17}
                    className="flex-shrink-0"
                  />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Workspace Quick Tip Box */}
        <div className="mt-auto p-3.5 m-3.5 rounded-lg bg-[#191512] border border-[#34271F]">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-[#FFC857]" />
            <span className="text-xs font-semibold text-[#F5F0EB]">Diagnostic Tip</span>
          </div>
          <p className="text-[11px] text-[#A3978D] leading-relaxed">
            {role === 'faculty'
              ? 'Filter by batch and department to identify students who need placement intervention.'
              : 'Take topic assessments to recalculate your score and get targeted next steps.'}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

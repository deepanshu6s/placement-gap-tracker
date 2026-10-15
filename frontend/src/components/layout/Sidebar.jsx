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
  FolderGit2,
  X,
  Sparkles,
  ListChecks,
  BarChart3,
} from 'lucide-react';

export const Sidebar = ({ role = 'student' }) => {
  const { isSidebarOpen, closeSidebar } = useUiStore();

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) closeSidebar();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  const studentLinks = [
    { to: '/student',              label: 'Dashboard & Readiness', icon: LayoutDashboard },
    { to: '/student/roles',        label: 'Career Roles & Skills',  icon: Compass },
    { to: '/student/skill-baseline',label: 'Skill Baseline',        icon: ListChecks },
    { to: '/student/roadmap',      label: 'My Roadmap',             icon: Target },
    { to: '/student/evidence',     label: 'My Evidence',            icon: FolderGit2 },
    { to: '/student/preparation',  label: 'Preparation Tracker',    icon: CalendarCheck },
    { to: '/student/profile-setup',label: 'My Academic Profile',    icon: UserCheck },
  ];

  const facultyLinks = [
    { to: '/faculty',            label: 'Cohort Readiness & Roster', icon: Users     },
    { to: '/faculty/evidence',   label: 'Evidence Review',           icon: FolderGit2 },
    { to: '/faculty/analytics',  label: 'Placement Analytics',       icon: BarChart3  },
  ];

  const links = role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 lg:hidden transition-opacity"
          style={{ background: 'var(--overlay-bg)' }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-30 w-60 flex-shrink-0 flex flex-col border-r transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } min-h-[calc(100vh-4rem)]`}
        style={{
          background: 'var(--surface-elevated)',
          borderColor: 'var(--border-primary)',
        }}
      >
        {/* Mobile Header in Drawer */}
        <div
          className="lg:hidden flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: 'var(--color-orange)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Navigation</span>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close menu"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Label & Navigation Links */}
        <div className="p-3.5 pb-2">
          <div
            className="text-[11px] font-semibold uppercase tracking-wider px-3 mb-2 flex items-center justify-between"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>{role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}</span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-orange)' }}
            />
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/student' || link.to === '/faculty'}
                  onClick={() => { if (window.innerWidth < 1024) closeSidebar(); }}
                  className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 border-l-2"
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--surface-hover)' : 'transparent',
                    color: isActive ? 'var(--color-orange)' : 'var(--text-secondary)',
                    borderLeftColor: isActive ? 'var(--color-orange)' : 'transparent',
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.getAttribute('aria-current')) {
                      e.currentTarget.style.background = 'var(--surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.getAttribute('aria-current')) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Tip Box */}
        <div
          className="mt-auto p-3.5 m-3.5 rounded-lg border"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} style={{ color: 'var(--color-amber)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Diagnostic Tip</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
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

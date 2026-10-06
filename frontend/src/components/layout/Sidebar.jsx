import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar = ({ role = 'student' }) => {
  const studentLinks = [
    { to: '/student', label: 'Dashboard' },
    { to: '/student/assessment', label: 'Assessments' },
    { to: '/student/gaps', label: 'Skill Gaps' },
    { to: '/student/readiness', label: 'Readiness Score' },
    { to: '/student/recommendations', label: 'Recommendations' },
    { to: '/student/preparation', label: 'Preparation Log' },
  ];

  const facultyLinks = [
    { to: '/faculty', label: 'Batch Dashboard' },
    { to: '/faculty/interventions', label: 'Intervention List' },
    { to: '/faculty/roles', label: 'Role Management' },
    { to: '/faculty/skills', label: 'Skill Taxonomy' },
    { to: '/faculty/questions', label: 'Question Bank' },
  ];

  const links = role === 'faculty' ? facultyLinks : studentLinks;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 min-h-[calc(100vh-4rem)]">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
        {role === 'faculty' ? 'Faculty Portal' : 'Student Portal'} (Planned)
      </div>
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-800/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

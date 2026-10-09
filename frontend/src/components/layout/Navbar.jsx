import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { authService } from '../../services/authService';
import {
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
  ShieldCheck,
  ChevronRight,
  LayoutDashboard,
  Compass,
  FileCheck,
} from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout warning', err);
    } finally {
      clearAuth();
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const isPublicPage = location.pathname === '/' || !isAuthenticated;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#243249] bg-[#080B12]/85 backdrop-blur-md transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-[#A6B4C8] hover:text-[#F3F7FC] hover:bg-[#17243A] focus:outline-none focus:ring-2 focus:ring-[#42F5E8]"
              aria-label="Toggle navigation drawer"
            >
              <Menu size={20} />
            </button>
          )}

          <Link
            to={isAuthenticated ? (user?.role === 'faculty' ? '/faculty' : '/student') : '/'}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#42F5E8]/20 to-[#C4FF58]/10 border border-[#42F5E8]/40 flex items-center justify-center text-[#42F5E8] shadow-[0_0_15px_-3px_rgba(66,245,232,0.3)] group-hover:scale-105 transition-transform">
              <Sparkles size={18} className="text-[#42F5E8]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-[#F3F7FC] tracking-tight group-hover:text-[#42F5E8] transition-colors leading-tight">
                Placement<span className="text-[#42F5E8]">Tracker</span>
              </span>
              <span className="text-[10px] text-[#77869B] hidden sm:block tracking-wider uppercase font-semibold">
                Readiness & Skill Gap Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isPublicPage && !isAuthenticated ? (
            <nav className="flex items-center gap-6 text-sm font-medium text-[#A6B4C8]">
              <a href="#features" className="hover:text-[#42F5E8] transition-colors">
                Platform Features
              </a>
              <a href="#workflow" className="hover:text-[#42F5E8] transition-colors">
                How It Works
              </a>
              <a href="#analytics" className="hover:text-[#42F5E8] transition-colors">
                Skill Gap Engine
              </a>
            </nav>
          ) : null}
        </div>

        {/* Right: Actions / Auth State */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0D1320] border border-[#243249]">
                <div className="w-6 h-6 rounded-full bg-[#17243A] flex items-center justify-center text-[#42F5E8] text-xs font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#F3F7FC] truncate max-w-[130px]">
                    {user?.email}
                  </span>
                  <span className="text-[10px] text-[#77869B] capitalize">{user?.role}</span>
                </div>
                <Badge variant={user?.role === 'faculty' ? 'lime' : 'cyan'} size="sm">
                  {user?.role}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#FB7185] hover:text-[#FB7185] hover:bg-[#FB7185]/10 border border-[#FB7185]/20"
                icon={LogOut}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={Sparkles}>
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger for public links */}
          {isPublicPage && !isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#A6B4C8] hover:text-[#F3F7FC] hover:bg-[#17243A]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown for Public Page */}
      {isPublicPage && !isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-[#243249] bg-[#0D1320] px-4 py-5 space-y-4 animate-fade-in">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#A6B4C8]">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#17243A] hover:text-[#42F5E8]"
            >
              Platform Features
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#17243A] hover:text-[#42F5E8]"
            >
              How It Works
            </a>
            <a
              href="#analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#17243A] hover:text-[#42F5E8]"
            >
              Skill Gap Engine
            </a>
          </nav>
          <div className="pt-3 border-t border-[#243249] flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full" icon={Sparkles}>
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

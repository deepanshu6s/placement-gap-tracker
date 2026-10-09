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
    <header className="sticky top-0 z-40 w-full border-b border-[#34271F] bg-[#12100E] transition-colors">
      <div
        className={`w-full ${
          isPublicPage ? 'max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8' : 'px-4 sm:px-6'
        } h-16 flex items-center justify-between`}
      >
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-[#C3B7AD] hover:text-[#F5F0EB] hover:bg-[#241B16] focus:outline-none focus:ring-2 focus:ring-[#FF6A2A]"
              aria-label="Toggle navigation drawer"
            >
              <Menu size={20} />
            </button>
          )}

          <Link
            to={isAuthenticated ? (user?.role === 'faculty' ? '/faculty' : '/student') : '/'}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#241B16] border border-[#65402C] flex items-center justify-center text-[#FF6A2A] transition-colors group-hover:border-[#FF6A2A]">
              <Sparkles size={16} className="text-[#FF6A2A]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-[#F5F0EB] tracking-tight group-hover:text-[#FF6A2A] transition-colors leading-tight">
                Placement<span className="text-[#FF6A2A]">Tracker</span>
              </span>
              <span className="text-[10px] text-[#A3978D] hidden sm:block tracking-wider uppercase font-semibold">
                Readiness &amp; Skill Gap Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right: Desktop Navigation on Public Page */}
        <div className="hidden md:flex items-center gap-6">
          {isPublicPage && !isAuthenticated ? (
            <nav className="flex items-center gap-6 text-sm font-medium text-[#C3B7AD]">
              <a href="#workflow" className="hover:text-[#FF6A2A] transition-colors">
                How It Works
              </a>
              <a href="#features" className="hover:text-[#FF6A2A] transition-colors">
                Key Features
              </a>
            </nav>
          ) : null}
        </div>

        {/* Right: Actions / Auth State */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#191512] border border-[#34271F]">
                <div className="w-6 h-6 rounded-md bg-[#241B16] border border-[#34271F] flex items-center justify-center text-[#FF6A2A] text-xs font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span
                    className="text-xs font-semibold text-[#F5F0EB] truncate max-w-[130px] md:max-w-[180px]"
                    title={user?.email}
                  >
                    {user?.email}
                  </span>
                  <span className="text-[10px] text-[#A3978D] capitalize">{user?.role}</span>
                </div>
                <Badge variant={user?.role === 'faculty' ? 'amber' : 'orange'} size="sm">
                  {user?.role}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#FF526F] hover:text-[#FF526F] hover:bg-[#FF526F]/10 border border-[#34271F]"
                icon={LogOut}
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger for public links */}
          {isPublicPage && !isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#C3B7AD] hover:text-[#F5F0EB] hover:bg-[#241B16]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown for Public Page */}
      {isPublicPage && !isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-[#34271F] bg-[#12100E] px-4 py-4 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-[#C3B7AD]">
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#241B16] hover:text-[#FF6A2A]"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-[#241B16] hover:text-[#FF6A2A]"
            >
              Key Features
            </a>
          </nav>
          <div className="pt-3 border-t border-[#34271F] flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
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

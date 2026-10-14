import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
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
    <header
      className="sticky top-0 z-40 w-full border-b transition-colors"
      style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-primary)' }}
    >
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
              className="lg:hidden p-2 rounded-lg transition-colors focus:outline-none"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle navigation drawer"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Menu size={20} />
            </button>
          )}

          <Link
            to={isAuthenticated ? (user?.role === 'faculty' ? '/faculty' : '/student') : '/'}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-active)',
                color: 'var(--color-orange)',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col">
              <span
                className="font-bold text-base sm:text-lg tracking-tight leading-tight transition-colors group-hover:text-[var(--color-orange)]"
                style={{ color: 'var(--text-primary)' }}
              >
                Placement<span style={{ color: 'var(--color-orange)' }}>Tracker</span>
              </span>
              <span
                className="text-[10px] hidden sm:block tracking-wider uppercase font-semibold"
                style={{ color: 'var(--text-muted)' }}
              >
                Readiness &amp; Skill Gap Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation on Public Page */}
        <div className="hidden md:flex items-center gap-6">
          {isPublicPage && !isAuthenticated ? (
            <nav className="flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              <a
                href="#workflow"
                className="transition-colors hover:text-[var(--color-orange)]"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="transition-colors hover:text-[var(--color-orange)]"
              >
                Key Features
              </a>
            </nav>
          ) : null}
        </div>

        {/* Right: Actions / Auth State */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle — always visible */}
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User chip */}
              <div
                className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-lg border"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-primary)', color: 'var(--color-orange)' }}
                >
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span
                    className="text-xs font-semibold truncate max-w-[130px] md:max-w-[180px]"
                    style={{ color: 'var(--text-primary)' }}
                    title={user?.email}
                  >
                    {user?.email}
                  </span>
                  <span className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>
                    {user?.role}
                  </span>
                </div>
                <Badge variant={user?.role === 'faculty' ? 'amber' : 'orange'} size="sm">
                  {user?.role}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="border"
                style={{ color: 'var(--color-coral)', borderColor: 'var(--border-primary)' }}
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
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Toggle mobile menu"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown for Public Page */}
      {isPublicPage && !isAuthenticated && mobileMenuOpen && (
        <div
          className="md:hidden border-t px-4 py-4 space-y-3 animate-fade-in"
          style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-primary)' }}
        >
          <nav className="flex flex-col space-y-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg transition-colors hover:text-[var(--color-orange)]"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg transition-colors hover:text-[var(--color-orange)]"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Key Features
            </a>
          </nav>
          <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border-primary)' }}>
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

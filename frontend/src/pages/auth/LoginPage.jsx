import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password) {
      setError('Please provide both your college email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Backend returns: { success: true, data: { user: { id, email, role }, accessToken, refreshToken } }
      const data = await authService.login(email.trim(), password);

      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      const token = data.accessToken || data.token;
      setAuth(data.user, token);

      // Role-based destination routing
      if (data.user.role === 'student') {
        try {
          const profile = await studentService.getProfile();
          if (profile && profile.profile_completed) {
            navigate('/student', { replace: true });
          } else {
            navigate('/student/profile-setup', { replace: true });
          }
        } catch {
          // If profile fetch fails or hasn't been created yet, route to onboarding
          navigate('/student/profile-setup', { replace: true });
        }
      } else if (data.user.role === 'faculty' || data.user.role === 'admin') {
        navigate('/faculty', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.error?.message ||
        (err.response?.status === 401
          ? 'Invalid credentials or inactive account. Please check your email and password.'
          : err.response?.status === 503
          ? 'Database service is currently unavailable. Please verify that PostgreSQL is running.'
          : err.message === 'Network Error' || !err.response
          ? 'Unable to connect to the backend server. Please verify the API server is running.'
          : 'Login failed. Please try again.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Sign In"
      subtitle="Access your placement readiness score and diagnostic reports"
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="error" title="Authentication Failed">
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="email"
            label="College Email Address"
            type="email"
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            autoComplete="email"
            disabled={loading}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Password
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              >
                <Lock size={17} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none transition-all duration-150 border"
                style={{
                  background: 'var(--surface-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-orange)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 90, 24, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors focus:outline-none"
                style={{ color: 'var(--text-muted)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full mt-2"
            size="lg"
            type="submit"
            disabled={loading}
            icon={loading ? undefined : ArrowRight}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div
          className="pt-3 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-2"
          style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
        >
          <span>New to PlacementTracker?</span>
          <Link
            to="/register"
            className="font-semibold hover:underline inline-flex items-center gap-1 transition-colors"
            style={{ color: 'var(--color-orange)' }}
          >
            Create Student Account <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default LoginPage;

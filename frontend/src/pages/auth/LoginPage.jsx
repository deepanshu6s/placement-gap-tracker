import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { authService } from '../../services/authService';
import { studentService } from '../../services/studentService';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
          : err.message || 'Login failed. Please try again.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Sign In to Your Portal"
      subtitle="Access your placement readiness score and skill gap diagnostic reports"
      className="bg-[#111B2D] border-[#243249]"
    >
      <div className="space-y-5">
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
            <label htmlFor="password" className="block text-sm font-medium text-[#F3F7FC]">
              Account Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77869B]">
                <Lock size={18} />
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
                className="w-full bg-[#0D1320] border border-[#243249] hover:border-[#364A6B] focus:border-[#42F5E8] focus:ring-2 focus:ring-[#42F5E8]/20 rounded-lg pl-10 pr-10 py-2.5 text-[#F3F7FC] placeholder-[#77869B] text-sm md:text-base focus:outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#77869B] hover:text-[#F3F7FC] transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
            {loading ? 'Authenticating Credentials...' : 'Sign In'}
          </Button>
        </form>

        <div className="pt-4 border-t border-[#243249] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A6B4C8] gap-2">
          <span>New student to the tracker?</span>
          <Link
            to="/register"
            className="text-[#42F5E8] hover:text-[#24e8da] font-semibold hover:underline inline-flex items-center gap-1"
          >
            Create Account <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default LoginPage;

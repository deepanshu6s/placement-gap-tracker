import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!email.trim() || !password) {
      setError('Please provide an email address and password.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter matching passwords.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create account
      await authService.register(email.trim(), password);

      // 2. Automatically log in to establish authenticated session
      const loginData = await authService.login(email.trim(), password);

      if (loginData.refreshToken) {
        localStorage.setItem('refreshToken', loginData.refreshToken);
      }

      const token = loginData.accessToken || loginData.token;
      setAuth(loginData.user, token);

      // 3. Navigate new student directly into profile setup onboarding
      navigate('/student/profile-setup', { replace: true });
    } catch (err) {
      const serverMsg =
        err.response?.data?.error?.message ||
        (err.response?.status === 400
          ? 'Registration failed. Email may already be registered or invalid.'
          : err.response?.status === 503
          ? 'Database service is currently unavailable. Please verify that PostgreSQL is running.'
          : err.message === 'Network Error' || !err.response
          ? 'Unable to connect to the backend server. Please verify the API server is running.'
          : 'Registration failed. Please try again.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Create Student Account"
      subtitle="Start your diagnostic evaluation and track placement readiness"
      className="bg-[#191512] border-[#34271F]"
    >
      <div className="space-y-4">
        {error && (
          <Alert variant="error" title="Registration Failed">
            {error}
          </Alert>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
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
            helperText="Use your institutional or student college email"
          />

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[#F5F0EB]">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3978D]">
                <Lock size={17} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
                className="w-full bg-[#14110F] border border-[#34271F] hover:border-[#65402C] focus:border-[#FF6A2A] focus:ring-2 focus:ring-[#FF6A2A]/20 rounded-lg pl-10 pr-10 py-2 text-[#F5F0EB] placeholder-[#A3978D] text-sm focus:outline-none transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A3978D] hover:text-[#F5F0EB] transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={Lock}
            required
            autoComplete="new-password"
            disabled={loading}
          />

          <Button
            variant="primary"
            className="w-full mt-2"
            size="lg"
            type="submit"
            disabled={loading}
            icon={loading ? undefined : UserPlus}
          >
            {loading ? 'Creating Account...' : 'Register & Start Setup'}
          </Button>
        </form>

        <div className="pt-3 border-t border-[#34271F] flex flex-col sm:flex-row items-center justify-between text-xs text-[#C3B7AD] gap-2">
          <span>Already registered?</span>
          <Link
            to="/login"
            className="text-[#FF6A2A] hover:text-[#FF7B43] font-semibold hover:underline inline-flex items-center gap-1"
          >
            Sign In <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default RegisterPage;

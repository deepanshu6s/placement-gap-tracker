import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

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
          : err.message || 'Registration failed. Please try again.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Create Student Account"
      subtitle="Start your guided journey toward campus placement readiness"
      className="bg-[#111B2D] border-[#243249]"
    >
      <div className="space-y-5">
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
            <label htmlFor="password" className="block text-sm font-medium text-[#F3F7FC]">
              Create Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77869B]">
                <Lock size={18} />
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
            variant="accent"
            className="w-full mt-2"
            size="lg"
            type="submit"
            disabled={loading}
            icon={loading ? undefined : UserPlus}
          >
            {loading ? 'Creating Student Account...' : 'Register & Start Setup'}
          </Button>
        </form>

        <div className="pt-4 border-t border-[#243249] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A6B4C8] gap-2">
          <span>Already have an account?</span>
          <Link
            to="/login"
            className="text-[#42F5E8] hover:text-[#24e8da] font-semibold hover:underline inline-flex items-center gap-1"
          >
            Sign In Portal <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default RegisterPage;

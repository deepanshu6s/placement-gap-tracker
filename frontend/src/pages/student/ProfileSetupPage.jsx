import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { studentService, roleService } from '../../services/studentService';
import { useAuthStore } from '../../store/authStore';
import {
  User,
  GraduationCap,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

export const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    full_name: '',
    roll_number: '',
    branch: 'CS',
    batch_year: new Date().getFullYear(),
    cgpa: '',
    target_role_id: '',
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const [prof, rolesData] = await Promise.all([
          studentService.getProfile().catch(() => null),
          roleService.getRoles().catch(() => []),
        ]);

        if (isMounted) {
          if (rolesData && Array.isArray(rolesData)) {
            setRoles(rolesData);
          }

          if (prof) {
            setHasExistingProfile(true);
            setFormData({
              full_name: prof.full_name || '',
              roll_number: prof.roll_number || '',
              branch: prof.branch || 'CS',
              batch_year: prof.batch_year || new Date().getFullYear(),
              cgpa: prof.cgpa !== null && prof.cgpa !== undefined ? prof.cgpa.toString() : '',
              target_role_id: prof.target_role_id || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to init profile setup', err);
      } finally {
        if (isMounted) setInitLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.full_name.trim() || !formData.roll_number.trim() || !formData.target_role_id) {
      setError('Please provide your name, roll number, and choose your target career role.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        roll_number: formData.roll_number.trim(),
        branch: formData.branch.trim(),
        batch_year: parseInt(formData.batch_year, 10),
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        target_role_id: formData.target_role_id,
        profile_completed: true,
      };

      if (hasExistingProfile) {
        await studentService.updateProfile(payload);
      } else {
        await studentService.setupProfile(payload);
      }

      navigate('/student', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to save student profile. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <PageWrapper title="Academic Profile Setup">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[#A3978D]">Loading profile information...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Academic Profile &amp; Role Setup"
      subtitle="Complete your student credentials and choose your target career benchmark"
    >
      <div className="max-w-2xl mx-auto w-full">
        <Card>
          {error && (
            <Alert variant="error" title="Setup Incomplete" className="mb-5">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Academic Identification */}
            <div>
              <div
                className="flex items-center gap-2 mb-3 pb-2 border-b"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <GraduationCap size={16} style={{ color: 'var(--color-orange)' }} />
                <h3
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-primary)' }}
                >
                  1. Academic Information
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    id="full_name"
                    label="Full Name"
                    placeholder="e.g. Alex Johnson"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    icon={User}
                  />

                  <Input
                    id="roll_number"
                    label="University Roll / Reg Number"
                    placeholder="e.g. 21CS104"
                    value={formData.roll_number}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label
                      htmlFor="branch"
                      className="block text-xs sm:text-sm font-medium mb-1.5"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Department
                    </label>
                    <select
                      id="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 border"
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
                    >
                      <option value="CS">Computer Science (CS)</option>
                      <option value="IT">Information Tech (IT)</option>
                      <option value="ECE">Electronics (ECE)</option>
                      <option value="EE">Electrical (EE)</option>
                      <option value="MECH">Mechanical (MECH)</option>
                      <option value="OTHER">Other Engineering</option>
                    </select>
                  </div>

                  <Input
                    id="batch_year"
                    label="Graduation Year"
                    type="number"
                    min="2020"
                    max="2035"
                    value={formData.batch_year}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />

                  <Input
                    id="cgpa"
                    label="CGPA (Optional)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.4"
                    value={formData.cgpa}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Target Career Pathway */}
            <div>
              <div
                className="flex items-center gap-2 mb-3 pb-2 border-b"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <Briefcase size={16} style={{ color: 'var(--color-amber)' }} />
                <h3
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-primary)' }}
                >
                  2. Target Career Pathway
                </h3>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="target_role_id"
                  className="block text-xs sm:text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Select Target Recruitment Role
                </label>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Your skill gap analysis and readiness calculations will be benchmarked against this role.
                </p>

                <select
                  id="target_role_id"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all duration-150 border"
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
                  value={formData.target_role_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">-- Choose your primary placement goal --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Bar */}
            <div
              className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                You can change your target role later from the role catalogue.
              </span>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
                icon={loading ? undefined : ArrowRight}
              >
                {loading ? 'Saving Profile...' : 'Save & Enter Dashboard'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default ProfileSetupPage;

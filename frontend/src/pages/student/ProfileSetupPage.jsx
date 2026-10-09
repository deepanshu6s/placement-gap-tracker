import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { studentService, roleService } from '../../services/studentService';
import { useAuthStore } from '../../store/authStore';
import {
  User,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
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
      setError('Please fill in your name, roll number, and choose your target career role.');
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
      setError(err.response?.data?.error?.message || 'Failed to save student profile. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <PageWrapper title="Academic Profile Setup">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[#77869B]">Loading available role catalogue...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Academic Profile &amp; Role Setup"
      subtitle="Complete your student credentials and choose your target career benchmark"
    >
      <div className="max-w-3xl mx-auto w-full">
        <Card className="bg-[#111B2D] border-[#243249]">
          {error && (
            <Alert variant="error" title="Setup Incomplete" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Academic Identification */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#243249]">
                <GraduationCap size={18} className="text-[#42F5E8]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F7FC]">
                  1. Academic Information
                </h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-[#F3F7FC] mb-2">
                      Department / Branch
                    </label>
                    <select
                      id="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full bg-[#0D1320] border border-[#243249] hover:border-[#364A6B] focus:border-[#42F5E8] focus:ring-2 focus:ring-[#42F5E8]/20 rounded-lg px-4 py-2.5 text-[#F3F7FC] text-sm md:text-base focus:outline-none transition-all duration-200"
                    >
                      <option value="CS">Computer Science (CS)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="ECE">Electronics &amp; Comm. (ECE)</option>
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

            {/* Step 2: Target Career Pathway */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#243249]">
                <Briefcase size={18} className="text-[#C4FF58]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F3F7FC]">
                  2. Target Career Pathway
                </h3>
              </div>

              <div className="space-y-3">
                <label htmlFor="target_role_id" className="block text-sm font-medium text-[#F3F7FC]">
                  Select Target Recruitment Role
                </label>
                <p className="text-xs text-[#A6B4C8] mb-2">
                  Your skill gap analysis and readiness calculations will be benchmarked against this role's specific requirements.
                </p>

                <select
                  id="target_role_id"
                  className="w-full bg-[#0D1320] border border-[#243249] hover:border-[#364A6B] focus:border-[#42F5E8] focus:ring-2 focus:ring-[#42F5E8]/20 rounded-lg px-4 py-3 text-[#F3F7FC] text-sm md:text-base focus:outline-none transition-all duration-200"
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

            {/* Form Submit */}
            <div className="pt-4 border-t border-[#243249] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#77869B]">
                You can adjust your target role at any time from the role catalogue.
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

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { preparationService } from '../../services/preparationService';
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  Plus,
  Lock,
} from 'lucide-react';

export const PreparationPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    skill_id: '',
    activity_type: 'study',
    description: '',
    resource_url: '',
    hours_spent: '1.5',
    activity_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await preparationService.getLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load preparation logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;

    if (!formData.hours_spent || parseFloat(formData.hours_spent) <= 0) {
      setError('Please specify a positive duration for hours spent.');
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        activity_type: formData.activity_type,
        hours_spent: parseFloat(formData.hours_spent),
        activity_date: formData.activity_date,
        description: formData.description.trim() || null,
        resource_url: formData.resource_url.trim() || null,
        skill_id: formData.skill_id || null,
      };

      const newLog = await preparationService.logActivity(payload);
      if (newLog) {
        setLogs([newLog, ...logs]);
      }

      setSuccessMsg('Preparation activity recorded successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);

      // Reset form defaults
      setFormData({
        skill_id: '',
        activity_type: 'study',
        description: '',
        resource_url: '',
        hours_spent: '1.0',
        activity_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save preparation entry.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalHours = logs.reduce((acc, log) => acc + (parseFloat(log.hours_spent) || 0), 0);

  if (loading) {
    return (
      <PageWrapper title="Preparation Tracker">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[#A3978D]">Loading activity history...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Student Preparation Tracker"
      subtitle="Log your self-study routines, mock tests, and practice hours"
      badge={
        <Badge variant="orange" size="md">
          {totalHours.toFixed(1)} Total Hours Recorded
        </Badge>
      }
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Quick Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <Card hover className="bg-[#191512] border-[#34271F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                Total Hours
              </span>
              <div className="p-2 rounded-md bg-[#241B16] text-[#FF6A2A]">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-2.5 text-3xl font-extrabold text-[#F5F0EB]">
              {totalHours.toFixed(1)}h
            </div>
            <p className="text-xs text-[#A3978D] mt-1">Logged study commitment</p>
          </Card>

          <Card hover className="bg-[#191512] border-[#34271F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                Total Entries
              </span>
              <div className="p-2 rounded-md bg-[#241B16] text-[#FFC857]">
                <CalendarCheck size={16} />
              </div>
            </div>
            <div className="mt-2.5 text-3xl font-extrabold text-[#F5F0EB]">
              {logs.length}
            </div>
            <p className="text-xs text-[#A3978D] mt-1">Activities recorded</p>
          </Card>

          <Card hover className="bg-[#191512] border-[#34271F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                Data Privacy
              </span>
              <div className="p-2 rounded-md bg-[#241B16] text-[#FF6A2A]">
                <Lock size={16} />
              </div>
            </div>
            <div className="mt-2.5 text-lg font-bold text-[#F5F0EB]">
              100% Private Notes
            </div>
            <p className="text-xs text-[#A3978D] mt-1">Faculty views aggregates only</p>
          </Card>
        </div>

        {/* Form and Activity List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Column */}
          <div className="lg:col-span-5">
            <Card
              title="Log Study Activity"
              subtitle="Record personal problem solving and learning resource reviews"
              className="bg-[#191512] border-[#34271F]"
            >
              {error && (
                <Alert variant="error" className="mb-4">
                  {error}
                </Alert>
              )}
              {successMsg && (
                <Alert variant="success" className="mb-4">
                  {successMsg}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="activity_type" className="block text-xs sm:text-sm font-medium text-[#F5F0EB] mb-1.5">
                    Activity Type
                  </label>
                  <select
                    id="activity_type"
                    className="w-full bg-[#14110F] border border-[#34271F] hover:border-[#65402C] focus:border-[#FF6A2A] focus:ring-2 focus:ring-[#FF6A2A]/20 rounded-lg px-3.5 py-2 text-[#F5F0EB] text-sm focus:outline-none transition-all duration-150"
                    value={formData.activity_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="study">Conceptual Study</option>
                    <option value="practice">Hands-on Coding / Practice</option>
                    <option value="mock_test">Mock Test / Assessment</option>
                    <option value="video">Video Lecture / Course</option>
                    <option value="reading">Documentation / Reading</option>
                    <option value="other">Other Practice</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    id="activity_date"
                    label="Date"
                    type="date"
                    value={formData.activity_date}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    id="hours_spent"
                    label="Hours Spent"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formData.hours_spent}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  id="description"
                  label="Private Session Notes"
                  placeholder="e.g. Solved LeetCode tree traversal problems"
                  value={formData.description}
                  onChange={handleChange}
                  helperText="These notes are confidential to your student account."
                />

                <Input
                  id="resource_url"
                  label="Resource Reference Link (Optional)"
                  type="url"
                  placeholder="https://..."
                  value={formData.resource_url}
                  onChange={handleChange}
                />

                <Button
                  variant="primary"
                  className="w-full mt-2"
                  size="lg"
                  type="submit"
                  disabled={submitLoading}
                  icon={submitLoading ? undefined : Plus}
                >
                  {submitLoading ? 'Saving...' : 'Record Activity'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Activity Timeline Column */}
          <div className="lg:col-span-7">
            <Card
              title="Activity History"
              subtitle="Chronological list of all logged preparation sessions"
              className="bg-[#191512] border-[#34271F]"
            >
              {logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-lg bg-[#14110F] border border-[#34271F] hover:border-[#65402C] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="orange" size="sm">
                            {log.activity_type?.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-[#A3978D]">
                            {new Date(log.activity_date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#FF6A2A] bg-[#241B16] px-2.5 py-0.5 rounded border border-[#34271F]">
                          {log.hours_spent} Hours
                        </span>
                      </div>

                      {log.description ? (
                        <p className="text-xs sm:text-sm text-[#F5F0EB] mb-2 leading-relaxed">
                          {log.description}
                        </p>
                      ) : (
                        <p className="text-xs text-[#A3978D] italic mb-2">
                          No private notes recorded.
                        </p>
                      )}

                      {log.resource_url && (
                        <div className="pt-2 border-t border-[#34271F] flex items-center justify-between text-xs">
                          <a
                            href={log.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#FF6A2A] hover:text-[#FF7B43] hover:underline font-medium"
                          >
                            <span>Study Material Link</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-[#A3978D] border border-dashed border-[#34271F] rounded-lg">
                  <CalendarCheck size={36} className="mx-auto text-[#A3978D] mb-2" />
                  <p className="text-sm font-semibold text-[#F5F0EB]">No Preparation Logged Yet</p>
                  <p className="text-xs text-[#A3978D] max-w-sm mx-auto mt-1">
                    Track your technical practice to build placement readiness momentum and keep an accurate record.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PreparationPage;

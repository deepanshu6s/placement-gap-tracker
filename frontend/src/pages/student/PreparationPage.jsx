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
  BookOpen,
  ExternalLink,
  Plus,
  Sparkles,
  Lock,
  Calendar,
  CheckCircle2,
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

      setSuccessMsg('Preparation activity logged successfully.');
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
          <p className="text-sm text-[#77869B]">Loading activity timeline...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Student Preparation Tracker"
      subtitle="Log your self-study routines, mock tests, and practice hours"
      badge={
        <Badge variant="cyan" size="md">
          {totalHours.toFixed(1)} Total Hours Recorded
        </Badge>
      }
    >
      <div className="space-y-8">
        {/* Quick Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card hover className="bg-[#111B2D] border-[#243249]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                Total Hours
              </span>
              <div className="p-2 rounded-lg bg-[#42F5E8]/10 text-[#42F5E8]">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#F3F7FC]">
              {totalHours.toFixed(1)}h
            </div>
            <p className="text-xs text-[#77869B] mt-1">Logged study commitment</p>
          </Card>

          <Card hover className="bg-[#111B2D] border-[#243249]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                Total Entries
              </span>
              <div className="p-2 rounded-lg bg-[#C4FF58]/10 text-[#C4FF58]">
                <CalendarCheck size={18} />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-[#F3F7FC]">
              {logs.length}
            </div>
            <p className="text-xs text-[#77869B] mt-1">Activities recorded</p>
          </Card>

          <Card hover className="bg-[#111B2D] border-[#243249]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                Data Privacy
              </span>
              <div className="p-2 rounded-lg bg-[#4ADE80]/10 text-[#4ADE80]">
                <Lock size={18} />
              </div>
            </div>
            <div className="mt-3 text-lg font-bold text-[#F3F7FC]">
              100% Private Notes
            </div>
            <p className="text-xs text-[#77869B] mt-1">Faculty views aggregates only</p>
          </Card>
        </div>

        {/* Form and Activity List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-5">
            <Card
              title="Log Study Activity"
              subtitle="Keep record of personal problem solving and resource reviews"
              className="bg-[#111B2D] border-[#243249]"
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
                  <label htmlFor="activity_type" className="block text-sm font-medium text-[#F3F7FC] mb-2">
                    Activity Type
                  </label>
                  <select
                    id="activity_type"
                    className="w-full bg-[#0D1320] border border-[#243249] hover:border-[#364A6B] focus:border-[#42F5E8] focus:ring-2 focus:ring-[#42F5E8]/20 rounded-lg px-4 py-2.5 text-[#F3F7FC] text-sm focus:outline-none transition-all duration-200"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="e.g. Solved LeetCode graph traversal problems"
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
              className="bg-[#111B2D] border-[#243249]"
            >
              {logs.length > 0 ? (
                <div className="space-y-3.5">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-[#0D1320] border border-[#243249] hover:border-[#364A6B] transition-all"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="cyan" size="sm">
                            {log.activity_type?.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-[#77869B]">
                            {new Date(log.activity_date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#42F5E8] bg-[#17243A] px-2.5 py-1 rounded-md border border-[#243249]">
                          {log.hours_spent} Hours
                        </span>
                      </div>

                      {log.description ? (
                        <p className="text-sm text-[#F3F7FC] mb-2 leading-relaxed">
                          {log.description}
                        </p>
                      ) : (
                        <p className="text-xs text-[#77869B] italic mb-2">
                          No private notes recorded.
                        </p>
                      )}

                      {log.resource_url && (
                        <div className="pt-2 border-t border-[#243249]/60 flex items-center justify-between text-xs">
                          <a
                            href={log.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[#60A5FA] hover:underline font-semibold"
                          >
                            <span>Study Material Link</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center text-[#77869B] border border-dashed border-[#243249] rounded-xl">
                  <CalendarCheck size={40} className="mx-auto text-[#77869B] mb-3" />
                  <p className="text-base font-semibold text-[#F3F7FC]">No Preparation Logged Yet</p>
                  <p className="text-xs text-[#77869B] max-w-sm mx-auto mt-1">
                    Track your daily technical practice to build placement readiness momentum and keep an accurate record.
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

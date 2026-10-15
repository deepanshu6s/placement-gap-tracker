import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { facultyService } from '../../services/facultyService';
import {
  Users,
  AlertTriangle,
  Target,
  Search,
  Filter,
  GraduationCap,
  Download,
} from 'lucide-react';

export const FacultyDashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // Scoped filters
  const [batchYear, setBatchYear] = useState('2024');
  const [branch, setBranch] = useState('CS');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const blob = await facultyService.exportStudentsCSV(parseInt(batchYear, 10), branch);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cohort_roster_${branch}_${batchYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export cohort CSV', err);
      setError('Could not export cohort roster CSV. Please verify your faculty permissions.');
    } finally {
      setExporting(false);
    }
  };

  const fetchFacultyData = async (selectedYear, selectedBranch) => {
    setLoading(true);
    setError('');
    try {
      const prof = await facultyService.getProfile();
      setProfile(prof);

      const [studentsData, analyticsData] = await Promise.all([
        facultyService.getStudents(parseInt(selectedYear, 10), selectedBranch).catch(() => []),
        facultyService.getBatchAnalytics(parseInt(selectedYear, 10), selectedBranch).catch(() => null),
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load faculty dashboard', err);
      setError('Unable to load faculty dashboard data. Verify your faculty authorization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData(batchYear, branch);
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchFacultyData(batchYear, branch);
  };

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(query) ||
      s.roll_number?.toLowerCase().includes(query) ||
      s.target_role_name?.toLowerCase().includes(query)
    );
  });

  const studentsNeedingIntervention = students.filter(
    (s) => s.readiness_score !== null && s.readiness_score < 50
  ).length;

  return (
    <PageWrapper
      title={`Faculty Dashboard • ${profile?.full_name || 'Academic Mentor'}`}
      subtitle={
        profile?.is_tpo
          ? 'Training & Placement Office (TPO) • Cohort diagnostic oversight'
          : `Department of ${profile?.department || 'Computer Science & Engineering'}`
      }
      badge={
        <Badge variant={profile?.is_tpo ? 'amber' : 'orange'} size="sm">
          {profile?.is_tpo ? 'TPO Administrator' : 'Department Faculty'}
        </Badge>
      }
    >
      <div className="space-y-6 sm:space-y-8 w-full">
        {error && (
          <Alert variant="error" title="Access Error">
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* SCOPED FILTER TOOLBAR */}
        {/* ========================================================================= */}
        <Card className="p-4">
          <form
            onSubmit={handleApplyFilter}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4"
          >
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <Filter size={14} className="text-[var(--color-orange)]" />
                <span>Scope:</span>
              </div>

              <div>
                <select
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                  className="rounded-lg px-2.5 py-1.5 text-xs sm:text-sm border focus:outline-none transition-colors"
                  style={{
                    background: 'var(--surface-input)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="2023">Batch 2023</option>
                  <option value="2024">Batch 2024</option>
                  <option value="2025">Batch 2025</option>
                  <option value="2026">Batch 2026</option>
                </select>
              </div>

              <div>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="rounded-lg px-2.5 py-1.5 text-xs sm:text-sm border focus:outline-none transition-colors"
                  style={{
                    background: 'var(--surface-input)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="CS">Computer Science (CS)</option>
                  <option value="IT">Information Tech (IT)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="EE">Electrical (EE)</option>
                </select>
              </div>

              <Button variant="secondary" size="sm" type="submit">
                Apply Scope
              </Button>

              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleExportCSV}
                disabled={exporting || students.length === 0}
                icon={Download}
              >
                {exporting ? 'Exporting...' : 'Export Cohort CSV'}
              </Button>
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none transition-colors"
                style={{
                  background: 'var(--surface-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </form>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-[#A3978D]">Loading cohort analytics...</p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* AGGREGATE COHORT METRICS */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <Card hover>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Total Enrolled
                  </span>
                  <div className="p-2 rounded-md bg-[var(--surface-hover)] text-[var(--color-orange)] border border-[var(--border-primary)]">
                    <Users size={16} />
                  </div>
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-[var(--text-primary)]">
                  {students.length}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Students in selected cohort</p>
              </Card>

              <Card hover>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Avg. Readiness
                  </span>
                  <div className="p-2 rounded-md bg-[var(--surface-hover)] text-[var(--color-amber)] border border-[var(--border-primary)]">
                    <Target size={16} />
                  </div>
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-[var(--color-amber)]">
                  {analytics?.avg_readiness ? `${Math.round(analytics.avg_readiness)}%` : 'N/A'}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Cohort placement average</p>
              </Card>

              <Card hover>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Critical Gap Areas
                  </span>
                  <div className="p-2 rounded-md bg-[var(--surface-hover)] text-[var(--color-coral)] border border-[var(--border-primary)]">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-[var(--color-coral)]">
                  {analytics?.critical_gaps_count || 0}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Identified curriculum gaps</p>
              </Card>

              <Card hover>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Intervention Need
                  </span>
                  <div className="p-2 rounded-md bg-[var(--surface-hover)] text-[var(--color-coral)] border border-[var(--border-primary)]">
                    <GraduationCap size={16} />
                  </div>
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-[var(--color-coral)]">
                  {studentsNeedingIntervention}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Candidates with score &lt; 50%</p>
              </Card>
            </div>

            {/* ========================================================================= */}
            {/* STUDENT ROSTER TABLE */}
            {/* ========================================================================= */}
            <Card
              title={`Student Cohort Roster (${branch} • Batch ${batchYear})`}
              subtitle={`Displaying ${filteredStudents.length} of ${students.length} candidates`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead
                    className="text-xs uppercase tracking-wider"
                    style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
                  >
                    <tr>
                      <th className="px-3.5 py-2.5 rounded-l-lg font-semibold">Student Name</th>
                      <th className="px-3.5 py-2.5 font-semibold">Roll Number</th>
                      <th className="px-3.5 py-2.5 font-semibold">Target Career Role</th>
                      <th className="px-3.5 py-2.5 font-semibold">Readiness Score</th>
                      <th className="px-3.5 py-2.5 rounded-r-lg font-semibold text-right">
                        Status / Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-primary)]">
                    {filteredStudents.map((s) => {
                      const score =
                        s.readiness_score !== null && s.readiness_score !== undefined
                          ? Math.round(s.readiness_score)
                          : null;
                      const needsHelp = score !== null && score < 50;
                      return (
                        <tr key={s.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                          <td className="px-3.5 py-3 font-semibold text-[var(--text-primary)]">
                            {s.full_name}
                          </td>
                          <td className="px-3.5 py-3 font-mono text-xs text-[var(--text-secondary)]">
                            {s.roll_number || 'N/A'}
                          </td>
                          <td className="px-3.5 py-3">
                            <Badge variant="neutral" size="sm">
                              {s.target_role_name || 'Unassigned'}
                            </Badge>
                          </td>
                          <td className="px-3.5 py-3">
                            {score !== null ? (
                              <span
                                className={`font-bold ${
                                  score >= 70
                                    ? 'text-[var(--color-orange)]'
                                    : score >= 50
                                    ? 'text-[var(--color-amber)]'
                                    : 'text-[var(--color-coral)]'
                                }`}
                              >
                                {score}%
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)] text-xs">Unassessed</span>
                            )}
                          </td>
                          <td className="px-3.5 py-3 text-right">
                            {needsHelp ? (
                              <Badge variant="coral" size="sm">
                                Needs Intervention
                              </Badge>
                            ) : score !== null && score >= 70 ? (
                              <Badge variant="orange" size="sm">
                                Placement Ready
                              </Badge>
                            ) : (
                              <Badge variant="amber" size="sm">
                                Active Prep
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-10 text-center text-[var(--text-muted)] text-xs">
                          No students found matching your criteria in this cohort.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default FacultyDashboardPage;

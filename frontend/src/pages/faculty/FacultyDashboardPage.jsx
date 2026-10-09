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
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';

export const FacultyDashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scoped filters
  const [batchYear, setBatchYear] = useState('2024');
  const [branch, setBranch] = useState('CS');
  const [searchQuery, setSearchQuery] = useState('');

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
      title={`Faculty Overview • ${profile?.full_name || 'Academic Mentor'}`}
      subtitle={
        profile?.is_tpo
          ? 'Training & Placement Office (TPO) • Cross-department oversight'
          : `Department of ${profile?.department || 'Computer Science & Engineering'}`
      }
      badge={
        <Badge variant="lime" size="md">
          {profile?.is_tpo ? 'TPO Administrator' : 'Department Faculty'}
        </Badge>
      }
    >
      <div className="space-y-8 w-full">
        {error && (
          <Alert variant="error" title="Access Error">
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* SCOPED FILTER TOOLBAR */}
        {/* ========================================================================= */}
        <Card className="bg-[#111B2D] border-[#243249] p-4 sm:p-5">
          <form
            onSubmit={handleApplyFilter}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#A6B4C8] uppercase tracking-wider">
                <Filter size={15} className="text-[#42F5E8]" />
                <span>Cohort Scope:</span>
              </div>

              <div>
                <select
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                  className="bg-[#0D1320] border border-[#243249] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-[#F3F7FC] focus:outline-none focus:border-[#42F5E8]"
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
                  className="bg-[#0D1320] border border-[#243249] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-[#F3F7FC] focus:outline-none focus:border-[#42F5E8]"
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
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[220px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77869B] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search roster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D1320] border border-[#243249] rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-[#F3F7FC] placeholder-[#77869B] focus:outline-none focus:border-[#42F5E8]"
              />
            </div>
          </form>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-[#77869B]">Loading cohort analytics...</p>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* AGGREGATE COHORT METRICS */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card hover className="bg-[#111B2D] border-[#243249]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                    Total Enrolled
                  </span>
                  <div className="p-2 rounded-lg bg-[#42F5E8]/10 text-[#42F5E8]">
                    <Users size={18} />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#F3F7FC]">
                  {students.length}
                </div>
                <p className="text-xs text-[#77869B] mt-1">Students in selected batch</p>
              </Card>

              <Card hover className="bg-[#111B2D] border-[#243249]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                    Avg. Readiness
                  </span>
                  <div className="p-2 rounded-lg bg-[#C4FF58]/10 text-[#C4FF58]">
                    <Target size={18} />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#C4FF58]">
                  {analytics?.avg_readiness ? `${Math.round(analytics.avg_readiness)}%` : 'N/A'}
                </div>
                <p className="text-xs text-[#77869B] mt-1">Cohort placement benchmark</p>
              </Card>

              <Card hover className="bg-[#111B2D] border-[#243249]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                    Critical Gap Areas
                  </span>
                  <div className="p-2 rounded-lg bg-[#FB7185]/10 text-[#FB7185]">
                    <AlertTriangle size={18} />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#FB7185]">
                  {analytics?.critical_gaps_count || 0}
                </div>
                <p className="text-xs text-[#77869B] mt-1">Gaps requiring workshop</p>
              </Card>

              <Card hover className="bg-[#111B2D] border-[#243249]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                    Intervention Need
                  </span>
                  <div className="p-2 rounded-lg bg-[#FBBF24]/10 text-[#FBBF24]">
                    <GraduationCap size={18} />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#FBBF24]">
                  {studentsNeedingIntervention}
                </div>
                <p className="text-xs text-[#77869B] mt-1">Students score &lt; 50%</p>
              </Card>
            </div>

            {/* ========================================================================= */}
            {/* STUDENT ROSTER TABLE */}
            {/* ========================================================================= */}
            <Card
              title={`Student Cohort Roster (${branch} • Batch ${batchYear})`}
              subtitle={`Displaying ${filteredStudents.length} of ${students.length} candidates`}
              className="bg-[#111B2D] border-[#243249]"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0D1320] text-[#77869B] text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 rounded-l-lg font-semibold">Student Name</th>
                      <th className="px-4 py-3.5 font-semibold">Roll Number</th>
                      <th className="px-4 py-3.5 font-semibold">Target Career Role</th>
                      <th className="px-4 py-3.5 font-semibold">Readiness Score</th>
                      <th className="px-4 py-3.5 rounded-r-lg font-semibold text-right">
                        Status / Intervention
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#243249]">
                    {filteredStudents.map((s) => {
                      const score = s.readiness_score !== null && s.readiness_score !== undefined ? Math.round(s.readiness_score) : null;
                      const needsHelp = score !== null && score < 50;
                      return (
                        <tr key={s.id} className="hover:bg-[#17243A]/40 transition-colors">
                          <td className="px-4 py-3.5 font-semibold text-[#F3F7FC]">
                            {s.full_name}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-[#A6B4C8]">
                            {s.roll_number || 'N/A'}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge variant="neutral" size="sm">
                              {s.target_role_name || 'Unassigned'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            {score !== null ? (
                              <span
                                className={`font-bold ${
                                  score >= 70
                                    ? 'text-[#4ADE80]'
                                    : score >= 50
                                    ? 'text-[#FBBF24]'
                                    : 'text-[#FB7185]'
                                }`}
                              >
                                {score}%
                              </span>
                            ) : (
                              <span className="text-[#77869B] text-xs">Unassessed</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {needsHelp ? (
                              <Badge variant="danger" size="sm">
                                Needs Intervention
                              </Badge>
                            ) : score !== null && score >= 70 ? (
                              <Badge variant="lime" size="sm">
                                Placement Ready
                              </Badge>
                            ) : (
                              <Badge variant="cyan" size="sm">
                                Active Prep
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-12 text-center text-[#77869B]">
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

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
        <Card className="bg-[#191512] border-[#34271F] p-4">
          <form
            onSubmit={handleApplyFilter}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4"
          >
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                <Filter size={14} className="text-[#FF6A2A]" />
                <span>Scope:</span>
              </div>

              <div>
                <select
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                  className="bg-[#14110F] border border-[#34271F] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-[#F5F0EB] focus:outline-none focus:border-[#FF6A2A]"
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
                  className="bg-[#14110F] border border-[#34271F] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-[#F5F0EB] focus:outline-none focus:border-[#FF6A2A]"
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
            <div className="relative min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3978D] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#14110F] border border-[#34271F] rounded-lg pl-8 pr-3 py-1.5 text-xs sm:text-sm text-[#F5F0EB] placeholder-[#A3978D] focus:outline-none focus:border-[#FF6A2A]"
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
              <Card hover className="bg-[#191512] border-[#34271F]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                    Total Enrolled
                  </span>
                  <div className="p-2 rounded-md bg-[#241B16] text-[#FF6A2A]">
                    <Users size={16} />
                  </div>
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-[#F5F0EB]">
                  {students.length}
                </div>
                <p className="text-xs text-[#A3978D] mt-1">Students in selected cohort</p>
              </Card>

              <Card hover className="bg-[#191512] border-[#34271F]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                    Avg. Readiness
                  </span>
                  <div className="p-2 rounded-md bg-[#241B16] text-[#FFC857]">
                    <Target size={16} />
                  </div>
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-[#FFC857]">
                  {analytics?.avg_readiness ? `${Math.round(analytics.avg_readiness)}%` : 'N/A'}
                </div>
                <p className="text-xs text-[#A3978D] mt-1">Cohort placement average</p>
              </Card>

              <Card hover className="bg-[#191512] border-[#34271F]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                    Critical Gap Areas
                  </span>
                  <div className="p-2 rounded-md bg-[#241B16] text-[#FF526F]">
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-[#FF526F]">
                  {analytics?.critical_gaps_count || 0}
                </div>
                <p className="text-xs text-[#A3978D] mt-1">Identified curriculum gaps</p>
              </Card>

              <Card hover className="bg-[#191512] border-[#34271F]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                    Intervention Need
                  </span>
                  <div className="p-2 rounded-md bg-[#241B16] text-[#FF526F]">
                    <GraduationCap size={16} />
                  </div>
                </div>
                <div className="mt-2.5 text-3xl font-extrabold text-[#FF526F]">
                  {studentsNeedingIntervention}
                </div>
                <p className="text-xs text-[#A3978D] mt-1">Candidates with score &lt; 50%</p>
              </Card>
            </div>

            {/* ========================================================================= */}
            {/* STUDENT ROSTER TABLE */}
            {/* ========================================================================= */}
            <Card
              title={`Student Cohort Roster (${branch} • Batch ${batchYear})`}
              subtitle={`Displaying ${filteredStudents.length} of ${students.length} candidates`}
              className="bg-[#191512] border-[#34271F]"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#14110F] text-[#A3978D] text-xs uppercase tracking-wider">
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
                  <tbody className="divide-y divide-[#34271F]">
                    {filteredStudents.map((s) => {
                      const score =
                        s.readiness_score !== null && s.readiness_score !== undefined
                          ? Math.round(s.readiness_score)
                          : null;
                      const needsHelp = score !== null && score < 50;
                      return (
                        <tr key={s.id} className="hover:bg-[#241B16]/50 transition-colors">
                          <td className="px-3.5 py-3 font-semibold text-[#F5F0EB]">
                            {s.full_name}
                          </td>
                          <td className="px-3.5 py-3 font-mono text-xs text-[#C3B7AD]">
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
                                    ? 'text-[#FF6A2A]'
                                    : score >= 50
                                    ? 'text-[#FFC857]'
                                    : 'text-[#FF526F]'
                                }`}
                              >
                                {score}%
                              </span>
                            ) : (
                              <span className="text-[#A3978D] text-xs">Unassessed</span>
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
                        <td colSpan="5" className="px-4 py-10 text-center text-[#A3978D] text-xs">
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

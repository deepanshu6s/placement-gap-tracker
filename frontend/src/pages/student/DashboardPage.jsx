import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { studentService } from '../../services/studentService';
import { dashboardService } from '../../services/dashboardService';
import { preparationService } from '../../services/preparationService';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Target,
  BookOpen,
  Brain,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Award,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [prepLogs, setPrepLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const prof = await studentService.getProfile();
        if (!prof || !prof.profile_completed) {
          navigate('/student/profile-setup', { replace: true });
          return;
        }
        if (isMounted) setProfile(prof);

        // Fetch dashboard metrics in parallel
        const [readinessData, gapsData, recsData, logsData] = await Promise.all([
          dashboardService.getReadiness().catch(() => ({ data: null })),
          dashboardService.getSkillGaps().catch(() => []),
          dashboardService.getRecommendations().catch(() => []),
          preparationService.getLogs().catch(() => []),
        ]);

        if (isMounted) {
          setReadiness(readinessData?.data || null);
          setGaps(Array.isArray(gapsData) ? gapsData : []);
          setRecommendations(Array.isArray(recsData) ? recsData : []);
          setPrepLogs(Array.isArray(logsData) ? logsData : []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        if (isMounted) {
          setError('Could not load all dashboard data. Please try refreshing.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <PageWrapper title="Student Dashboard">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[#A3978D]">Calculating placement readiness metrics...</p>
        </div>
      </PageWrapper>
    );
  }

  // Calculate real metrics from API responses
  const readinessScore =
    readiness?.score !== null && readiness?.score !== undefined ? Math.round(readiness.score) : null;
  const criticalGapsCount = gaps.filter(
    (g) => g.is_assessed && (g.gap_category === 'critical' || g.gap > 35)
  ).length;
  const assessedSkillsCount = readiness?.assessedSkillsCount !== undefined
    ? readiness.assessedSkillsCount
    : gaps.filter((g) => g.is_assessed).length;
  const totalSkillsCount = readiness?.totalSkillsCount || gaps.length;
  const assessmentCoverage = readiness?.assessmentCoverage !== undefined
    ? readiness.assessmentCoverage
    : totalSkillsCount > 0 ? Math.round((assessedSkillsCount / totalSkillsCount) * 100) : 0;
  const totalLoggedHours = prepLogs.reduce((sum, l) => sum + (parseFloat(l.hours_spent) || 0), 0);

  // Radar data formatting for Recharts
  const radarData = gaps.map((g) => ({
    subject: g.skill_name || 'Skill',
    current: Math.round(g.current_score || 0),
    required: Math.round(g.required_level || 0),
    fullMark: 100,
  }));

  const isRoleWithoutSkills = readiness?.status === 'ROLE_HAS_NO_SKILLS' || (!loading && gaps.length === 0);
  const isUnassessed = totalSkillsCount > 0 && assessedSkillsCount === 0;

  return (
    <PageWrapper
      title={`Hello, ${profile?.full_name || 'Student'}`}
      subtitle={`Target Role: ${profile?.target_role_name || 'Not Configured'} • Roll: ${profile?.roll_number || 'N/A'}`}
      badge={
        <Badge variant="orange" size="sm">
          {profile?.branch} &bull; Batch {profile?.batch_year}
        </Badge>
      }
      action={
        <Link to="/student/roles">
          <Button variant="secondary" size="sm" icon={Compass}>
            Change Target Role
          </Button>
        </Link>
      }
    >
      <div className="space-y-6 sm:space-y-8 w-full">
        {error && (
          <Alert variant="warning" title="Notice">
            {error}
          </Alert>
        )}

        {/* Role has no configured skills */}
        {isRoleWithoutSkills && (
          <Alert variant="warning" title="No Skill Requirements Defined">
            Your selected target role ({profile?.target_role_name || 'Current Role'}) has no skill criteria configured by faculty administrators yet. Please select an active role from the catalogue to begin assessments and track readiness.
            <div className="mt-3">
              <Link to="/student/roles">
                <Button variant="secondary" size="sm" icon={Compass}>
                  Open Career Role Catalogue
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        {/* Role has skills but student hasn't taken any assessments */}
        {!isRoleWithoutSkills && isUnassessed && (
          <Alert variant="info" title="Take Your First Skill Assessment">
            You haven't assessed any skills for this role yet. Complete your first diagnostic test to establish your scores and calculate your readiness percentage.
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* FOUR SUMMARY METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Placement Readiness */}
          <Card hover className="bg-[#191512] border-[#34271F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                Placement Readiness
              </span>
              <div className="p-2 rounded-md bg-[#241B16] text-[#FF6A2A]">
                <Award size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#F5F0EB] tracking-tight">
                {readinessScore !== null ? `${readinessScore}%` : 'Not Assessed'}
              </span>
              <span className="text-xs text-[#C3B7AD]">
                {readinessScore !== null ? (readiness?.isFullyAssessed ? 'Fully Assessed' : 'Partial Score') : 'Diagnostic Pending'}
              </span>
            </div>
            <div className="mt-3 w-full bg-[#241B16] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#FF6A2A] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, readinessScore || 0)}%` }}
              />
            </div>
          </Card>

          {/* Card 2: Critical Skill Gaps */}
          <Card hover className="bg-[#191512] border-[#34271F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                Critical Skill Gaps
              </span>
              <div className="p-2 rounded-md bg-[#241B16] text-[#FF526F]">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold tracking-tight ${
                  criticalGapsCount > 0 ? 'text-[#FF526F]' : 'text-[#F5F0EB]'
                }`}
              >
                {criticalGapsCount}
              </span>
              <span className="text-xs text-[#C3B7AD]">
                {criticalGapsCount === 1 ? 'High Priority Area' : 'High Priority Areas'}
              </span>
            </div>
            <p className="mt-3 text-xs text-[#A3978D]">
              {criticalGapsCount === 0
                ? isUnassessed
                  ? 'Assess skills to evaluate gap severity'
                  : 'No critical deficiencies identified'
                : 'Deficiency > 35% against role benchmark'}
            </p>
          </Card>

          {/* Card 3: Skills Assessed & Coverage */}
          <Card hover className="bg-[#191512] border-[#34271F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                Skills Evaluated
              </span>
              <div className="p-2 rounded-md bg-[#241B16] text-[#FFC857]">
                <Brain size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#F5F0EB] tracking-tight">
                {assessedSkillsCount}{' '}
                <span className="text-lg text-[#A3978D] font-normal">/ {totalSkillsCount}</span>
              </span>
              <span className="text-xs text-[#FFC857] font-semibold">
                {assessmentCoverage}% Coverage
              </span>
            </div>
            <div className="mt-3 w-full bg-[#241B16] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#FFC857] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, assessmentCoverage || 0)}%` }}
              />
            </div>
          </Card>

          {/* Card 4: Logged Preparation */}
          <Card hover className="bg-[#191512] border-[#34271F]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#A3978D] uppercase tracking-wider">
                Logged Preparation
              </span>
              <div className="p-2 rounded-md bg-[#241B16] text-[#FF6A2A]">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#F5F0EB] tracking-tight">
                {totalLoggedHours.toFixed(1)}h
              </span>
              <span className="text-xs text-[#C3B7AD]">{prepLogs.length} sessions</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <Link
                to="/student/preparation"
                className="text-[#FF6A2A] hover:text-[#FF7B43] font-semibold inline-flex items-center gap-1"
              >
                <Plus size={13} /> Log Practice Hours
              </Link>
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TWO-COLUMN WORKSPACE: SECTION A (READINESS & GAPS) & SECTION B (RECOMMENDATIONS) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Section A: Role Competency Benchmark Radar */}
          <div className="lg:col-span-7 flex flex-col">
            <Card
              title="Skill Benchmark Comparison"
              subtitle={`Your current evaluation scores vs requirements for ${profile?.target_role_name || 'Role'}`}
              className="bg-[#191512] border-[#34271F] flex-1 flex flex-col"
            >
              {radarData.length > 0 ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="h-64 sm:h-72 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#34271F" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: '#C3B7AD', fontSize: 11, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{ fill: '#A3978D', fontSize: 10 }}
                          stroke="#34271F"
                        />
                        <Radar
                          name="Role Benchmark"
                          dataKey="required"
                          stroke="#FFC857"
                          fill="#FFC857"
                          fillOpacity={0.15}
                          strokeWidth={1.5}
                        />
                        <Radar
                          name="Your Score"
                          dataKey="current"
                          stroke="#FF6A2A"
                          fill="#FF6A2A"
                          fillOpacity={0.35}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="pt-3 border-t border-[#34271F] flex items-center justify-center gap-6 text-xs text-[#C3B7AD]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A2A]" />
                      <span>Your Assessed Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFC857]" />
                      <span>Role Benchmark Requirement</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#34271F] rounded-lg my-2">
                  <Brain size={32} className="text-[#A3978D] mb-2" />
                  <p className="text-sm font-semibold text-[#F5F0EB]">No Skill Criteria Configured</p>
                  <p className="text-xs text-[#A3978D] max-w-sm mt-1">
                    Select a target role with defined skills to populate your benchmark radar chart.
                  </p>
                  <Link to="/student/roles" className="mt-3">
                    <Button variant="secondary" size="sm">
                      View Role Catalogue
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Section B: What to Improve Next (Priority Action Plan) */}
          <div className="lg:col-span-5 flex flex-col">
            <Card
              title="What to Improve Next"
              subtitle="Prioritized recommendations based on gap severity and role weight"
              className="bg-[#191512] border-[#34271F] flex-1 flex flex-col"
            >
              {recommendations.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {recommendations.slice(0, 4).map((rec) => {
                    const isHigh = rec.priority === 'high';
                    const isMedium = rec.priority === 'medium';
                    return (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-lg bg-[#14110F] border border-[#34271F] hover:border-[#65402C] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#F5F0EB]">
                              {rec.skill_name || 'Action Item'}
                            </span>
                            <Badge
                              variant={isHigh ? 'coral' : isMedium ? 'amber' : 'neutral'}
                              size="sm"
                            >
                              {rec.priority}
                            </Badge>
                          </div>

                          {rec.skill_id ? (
                            <Link to={`/student/assessments/${rec.skill_id}`}>
                              <Button variant="outline" size="sm" className="text-xs py-1">
                                Assess
                              </Button>
                            </Link>
                          ) : (
                            <Link to="/student/preparation">
                              <Button variant="secondary" size="sm" className="text-xs py-1">
                                Practice
                              </Button>
                            </Link>
                          )}
                        </div>

                        <p className="text-xs text-[#C3B7AD] leading-relaxed">
                          {rec.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 size={32} className="text-[#FF6A2A] mb-2" />
                  <p className="text-sm font-semibold text-[#F5F0EB]">No Pending Actions</p>
                  <p className="text-xs text-[#A3978D] max-w-xs mt-1">
                    {gaps.length === 0
                      ? 'Select an active role with skills to generate targeted recommendations.'
                      : 'You are on track! Log study hours to maintain consistency.'}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DETAILED COMPETENCY BREAKDOWN TABLE */}
        {/* ========================================================================= */}
        <Card
          title="Role Competency Breakdown"
          subtitle="Detailed mapping of target requirements vs your assessed scores"
          className="bg-[#191512] border-[#34271F]"
        >
          {gaps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#14110F] text-[#A3978D] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5 rounded-l-lg font-semibold">Skill Domain</th>
                    <th className="px-3.5 py-2.5 font-semibold">Current Score</th>
                    <th className="px-3.5 py-2.5 font-semibold">Target Benchmark</th>
                    <th className="px-3.5 py-2.5 font-semibold">Severity</th>
                    <th className="px-3.5 py-2.5 rounded-r-lg font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#34271F]">
                  {gaps.map((gap) => {
                    const isCritical = gap.is_assessed && (gap.gap_category === 'critical' || gap.gap > 35 || gap.gap_value > 35);
                    const isMedium = gap.is_assessed && (gap.gap_category === 'medium' || (gap.gap > 15 && gap.gap <= 35));
                    const isMet = gap.is_assessed && (gap.gap <= 0 || gap.current_score >= gap.required_level);
                    return (
                      <tr key={gap.skill_id} className="hover:bg-[#241B16]/50 transition-colors">
                        <td className="px-3.5 py-3 font-semibold text-[#F5F0EB]">
                          {gap.skill_name}
                        </td>
                        <td className="px-3.5 py-3">
                          {gap.is_assessed ? (
                            <span className="font-bold text-[#FF6A2A]">
                              {Math.round(gap.current_score)}%
                            </span>
                          ) : (
                            <span className="text-xs text-[#A3978D]">Not Assessed</span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-[#C3B7AD]">
                          {Math.round(gap.required_level)}%
                        </td>
                        <td className="px-3.5 py-3">
                          <Badge
                            variant={
                              !gap.is_assessed
                                ? 'neutral'
                                : isMet
                                ? 'orange'
                                : isCritical
                                ? 'coral'
                                : isMedium
                                ? 'amber'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {!gap.is_assessed
                              ? 'Not Assessed'
                              : isMet
                              ? 'Benchmark Met'
                              : isCritical
                              ? 'Critical Gap'
                              : isMedium
                              ? 'Moderate Gap'
                              : 'Minor Gap'}
                          </Badge>
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <Link to={`/student/assessments/${gap.skill_id}`}>
                            <Button variant="ghost" size="sm" icon={Activity} className="text-xs py-1">
                              {gap.is_assessed ? 'Retest' : 'Assess'}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-[#A3978D] text-xs">
              No skill criteria configured for your selected target role yet.
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;

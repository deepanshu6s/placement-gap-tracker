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
} from 'recharts';
import {
  Target,
  BookOpen,
  Brain,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Compass,
  Award,
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
      <PageWrapper title="Diagnostic Dashboard">
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-[#77869B] animate-pulse">Calculating readiness metrics...</p>
        </div>
      </PageWrapper>
    );
  }

  // Calculate real metrics from API responses
  const readinessScore = readiness?.score !== null && readiness?.score !== undefined ? Math.round(readiness.score) : null;
  const criticalGapsCount = gaps.filter((g) => g.gap_category === 'critical' || g.gap_value > 35).length;
  const assessedSkillsCount = gaps.filter((g) => g.is_assessed || g.current_score > 0).length;
  const totalLoggedHours = prepLogs.reduce((sum, l) => sum + (parseFloat(l.hours_spent) || 0), 0);

  // Radar data formatting
  const radarData = gaps.map((g) => ({
    subject: g.skill_name || 'Skill',
    current: Math.round(g.current_score || 0),
    required: Math.round(g.required_level || 0),
    fullMark: 100,
  }));

  const getSeverityBadgeVariant = (category) => {
    switch (category) {
      case 'critical':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'small':
        return 'cyan';
      default:
        return 'success';
    }
  };

  return (
    <PageWrapper
      title={`Welcome back, ${profile?.full_name || 'Student'}`}
      subtitle={`Target Role: ${profile?.target_role_name || 'Not Selected'} • Roll: ${profile?.roll_number || 'N/A'}`}
      badge={
        <Badge variant={readinessScore !== null && readinessScore >= 75 ? 'lime' : 'cyan'}>
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
      <div className="space-y-8 w-full">
        {error && (
          <Alert variant="warning" title="Notice">
            {error}
          </Alert>
        )}

        {readiness?.status === 'ROLE_HAS_NO_SKILLS' && (
          <Alert variant="warning" title="No Skill Requirements Defined">
            Your selected role ({profile?.target_role_name}) currently has no skill requirements configured by faculty. Please select another role from the catalogue to begin assessments.
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* EXECUTIVE SUMMARY STATS (REAL API BACKED) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Readiness Score */}
          <Card hover className="bg-[#111B2D] border-[#243249]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                Placement Readiness
              </span>
              <div className="p-2 rounded-lg bg-[#42F5E8]/10 text-[#42F5E8]">
                <Award size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
                {readinessScore !== null ? `${readinessScore}%` : 'N/A'}
              </span>
              <span className="text-xs text-[#A6B4C8]">
                {readinessScore !== null ? 'Weighted Score' : 'Awaiting Tests'}
              </span>
            </div>
            <div className="mt-3 w-full bg-[#17243A] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#42F5E8] to-[#C4FF58] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, readinessScore || 0)}%` }}
              />
            </div>
          </Card>

          {/* Card 2: Critical Gaps */}
          <Card hover className="bg-[#111B2D] border-[#243249]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                Critical Skill Gaps
              </span>
              <div className="p-2 rounded-lg bg-[#FB7185]/10 text-[#FB7185]">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#FB7185] tracking-tight">
                {criticalGapsCount}
              </span>
              <span className="text-xs text-[#A6B4C8]">High Priority Areas</span>
            </div>
            <p className="mt-3 text-xs text-[#77869B]">
              {criticalGapsCount === 0
                ? 'No critical deficiencies identified'
                : 'Requires targeted practice before placement tests'}
            </p>
          </Card>

          {/* Card 3: Skills Assessed */}
          <Card hover className="bg-[#111B2D] border-[#243249]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                Skills Evaluated
              </span>
              <div className="p-2 rounded-lg bg-[#C4FF58]/10 text-[#C4FF58]">
                <Brain size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
                {assessedSkillsCount}{' '}
                <span className="text-xl text-[#77869B] font-normal">/ {gaps.length}</span>
              </span>
              <span className="text-xs text-[#A6B4C8]">Role Skills</span>
            </div>
            <p className="mt-3 text-xs text-[#77869B]">
              {gaps.length > 0 && assessedSkillsCount === gaps.length
                ? 'All required skills assessed'
                : `${gaps.length - assessedSkillsCount} skill(s) pending assessment`}
            </p>
          </Card>

          {/* Card 4: Logged Prep Time */}
          <Card hover className="bg-[#111B2D] border-[#243249]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#77869B] uppercase tracking-wider">
                Logged Preparation
              </span>
              <div className="p-2 rounded-lg bg-[#60A5FA]/10 text-[#60A5FA]">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
                {totalLoggedHours}h
              </span>
              <span className="text-xs text-[#A6B4C8]">{prepLogs.length} Activities Logged</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <Link to="/student/preparation" className="text-[#42F5E8] hover:underline font-semibold">
                + Log Practice Hours
              </Link>
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* RADAR VISUALIZATION & READINESS GAUGE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Circular Readiness Gauge */}
          <div className="lg:col-span-5 flex flex-col">
            <Card
              title="Target Role Alignment"
              subtitle={`Computed for ${profile?.target_role_name || 'selected role'}`}
              className="bg-[#111B2D] border-[#243249] flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                <div className="relative flex items-center justify-center w-48 h-48 rounded-full border-8 border-[#17243A] bg-[#0D1320] shadow-[0_0_30px_-5px_rgba(66,245,232,0.15)]">
                  {readinessScore !== null ? (
                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#42F5E8] to-[#C4FF58] tracking-tight">
                        {readinessScore}%
                      </span>
                      <span className="text-xs text-[#A6B4C8] uppercase font-bold tracking-wider mt-1">
                        Readiness
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center px-4">
                      <span className="text-sm font-semibold text-[#77869B]">No Score Yet</span>
                      <span className="text-xs text-[#77869B] mt-1">Take assessments to generate score</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#A6B4C8]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#42F5E8]" />
                    <span>Current Knowledge</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                    <span>Role Expectation (100%)</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Skill Gap Radar Chart */}
          <div className="lg:col-span-7 flex flex-col">
            <Card
              title="Skill Gap Benchmark Radar"
              subtitle="Comparison of your current scores against required role proficiencies"
              className="bg-[#111B2D] border-[#243249] flex-1 flex flex-col"
            >
              {radarData.length > 0 ? (
                <div className="h-72 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#243249" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#A6B4C8', fontSize: 12, fontWeight: 500 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#77869B', fontSize: 10 }}
                        stroke="#243249"
                      />
                      <Radar
                        name="Required Level"
                        dataKey="required"
                        stroke="#60A5FA"
                        fill="#60A5FA"
                        fillOpacity={0.15}
                        strokeWidth={1.5}
                      />
                      <Radar
                        name="Your Score"
                        dataKey="current"
                        stroke="#42F5E8"
                        fill="#42F5E8"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#243249] rounded-xl my-4">
                  <Brain size={36} className="text-[#77869B] mb-3" />
                  <p className="text-sm font-semibold text-[#F3F7FC]">No Skill Data Available</p>
                  <p className="text-xs text-[#77869B] max-w-sm mt-1">
                    Select a target role or take subject evaluations to populate your diagnostic radar.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRESCRIPTIVE RECOMMENDATIONS SECTION */}
        {/* ========================================================================= */}
        <Card
          title="Priority Action Plan & Recommendations"
          subtitle="System-generated interventions ordered by placement impact"
          className="bg-[#111B2D] border-[#243249]"
        >
          {recommendations.length > 0 ? (
            <div className="space-y-3.5">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0D1320] border border-[#243249] hover:border-[#364A6B] transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#17243A] text-[#42F5E8] flex-shrink-0 mt-0.5">
                      {rec.recommendation_type === 'take_assessment' && <Activity size={20} />}
                      {rec.recommendation_type === 'practice_skill' && <Brain size={20} />}
                      {rec.recommendation_type === 'study_resource' && <BookOpen size={20} />}
                      {rec.recommendation_type === 'review_weak_area' && <Target size={20} />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-[#F3F7FC] text-sm sm:text-base">
                          {rec.skill_name || 'General Recommendation'}
                        </span>
                        <Badge
                          variant={
                            rec.priority === 'high'
                              ? 'danger'
                              : rec.priority === 'medium'
                              ? 'warning'
                              : 'cyan'
                          }
                          size="sm"
                        >
                          {rec.priority} Priority
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-[#A6B4C8] leading-relaxed">
                        {rec.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 sm:self-center">
                    {rec.skill_id ? (
                      <Link to={`/student/assessments/${rec.skill_id}`}>
                        <Button variant="outline" size="sm" icon={Activity}>
                          Assess Now
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/student/preparation">
                        <Button variant="secondary" size="sm" icon={BookOpen}>
                          Log Practice
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-[#77869B]">
              <CheckCircle2 size={36} className="mx-auto text-[#4ADE80] mb-2" />
              <p className="text-sm font-semibold text-[#F3F7FC]">No Outstanding Actions</p>
              <p className="text-xs text-[#77869B] mt-1">
                You're in great shape! Keep maintaining practice hours or assess advanced skills.
              </p>
            </div>
          )}
        </Card>

        {/* ========================================================================= */}
        {/* DETAILED SKILL GAP TABLE */}
        {/* ========================================================================= */}
        <Card
          title="Role Competency Breakdown"
          subtitle="Detailed mapping of benchmark requirements vs your assessed scores"
          className="bg-[#111B2D] border-[#243249]"
        >
          {gaps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0D1320] text-[#77869B] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg font-semibold">Skill Domain</th>
                    <th className="px-4 py-3 font-semibold">Current Score</th>
                    <th className="px-4 py-3 font-semibold">Required Benchmark</th>
                    <th className="px-4 py-3 font-semibold">Gap Severity</th>
                    <th className="px-4 py-3 rounded-r-lg font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243249]">
                  {gaps.map((gap) => (
                    <tr key={gap.skill_id} className="hover:bg-[#17243A]/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-[#F3F7FC]">
                        {gap.skill_name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#42F5E8]">
                          {gap.is_assessed ? `${Math.round(gap.current_score)}%` : 'Not Assessed'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#A6B4C8]">
                        {Math.round(gap.required_level)}%
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={getSeverityBadgeVariant(gap.gap_category)} size="sm">
                          {gap.gap_category || 'pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link to={`/student/assessments/${gap.skill_id}`}>
                          <Button variant="ghost" size="sm" icon={Activity}>
                            Take Test
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-[#77869B]">
              No skill requirements available for this role.
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;

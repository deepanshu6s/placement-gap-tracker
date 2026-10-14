import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { roleService, studentService } from '../../services/studentService';
import {
  Compass,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export const RolesCataloguePage = () => {
  const [roles, setRoles] = useState([]);
  const [currentRoleId, setCurrentRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, profileData] = await Promise.all([
          roleService.getRoles().catch(() => []),
          studentService.getProfile().catch(() => null),
        ]);
        setRoles(rolesData || []);
        if (profileData) {
          setCurrentRoleId(profileData.target_role_id);
        }
      } catch (err) {
        console.error('Failed to fetch role catalogue', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSetTargetRole = async (roleId, roleName) => {
    try {
      await studentService.updateProfile({ target_role_id: roleId });
      setCurrentRoleId(roleId);
      setActionSuccess(`Target role updated to "${roleName}". Your readiness score has been recalibrated.`);
      setTimeout(() => setActionSuccess(''), 4500);
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Career Role Catalogue">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[#A3978D]">Loading career pathways...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Industry Career Role Catalogue"
      subtitle="Benchmark requirements and skill weightings configured for campus placement pathways"
    >
      <div className="space-y-6">
        {actionSuccess && (
          <Alert variant="success" title="Target Role Updated">
            {actionSuccess}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isTargetRole={currentRoleId === role.id}
              onSelectTarget={() => handleSetTargetRole(role.id, role.name)}
            />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

const RoleCard = ({ role, isTargetRole, onSelectTarget }) => {
  const [details, setDetails] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!expanded && !details) {
      setLoading(true);
      try {
        const data = await roleService.getRoleDetails(role.id);
        setDetails(data);
      } catch (err) {
        console.error('Failed to load role details', err);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <Card
      hover
      className="flex flex-col justify-between transition-colors"
      style={{
        borderColor: isTargetRole ? 'var(--color-orange)' : 'var(--border-primary)',
        boxShadow: isTargetRole ? '0 0 0 1px var(--color-orange)' : 'var(--shadow-card)',
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: 'var(--surface-hover)', color: 'var(--color-orange)' }}
          >
            <Compass size={18} />
          </div>
          {isTargetRole ? (
            <Badge variant="orange" size="sm">
              Current Target
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectTarget}
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              Set as Target
            </Button>
          )}
        </div>

        <h3
          className="text-base sm:text-lg font-bold mb-1.5"
          style={{ color: 'var(--text-primary)' }}
        >
          {role.name}
        </h3>
        <p
          className="text-xs sm:text-sm leading-relaxed line-clamp-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {role.description || 'Comprehensive placement pathway with curated skill criteria.'}
        </p>
      </div>

      <div className="mt-4 pt-3.5 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-xs font-semibold py-1 focus:outline-none transition-colors"
          style={{ color: 'var(--color-orange)' }}
        >
          <span>{expanded ? 'Hide Required Skills' : 'View Skill Criteria'}</span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expanded && (
          <div
            className="mt-2.5 space-y-2 pt-2.5 border-t animate-fade-in"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            {loading ? (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
              </div>
            ) : details?.requirements?.length > 0 ? (
              <div className="space-y-1.5">
                {details.requirements.map((req) => (
                  <Link
                    key={req.skill_id}
                    to={`/student/skills/${req.skill_id}`}
                    className="flex items-center justify-between p-2.5 rounded-lg border text-xs group transition-all"
                    style={{
                      background: 'var(--surface-input)',
                      borderColor: 'var(--border-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-active)';
                      e.currentTarget.style.background = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.background = 'var(--surface-input)';
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-semibold group-hover:text-[var(--color-orange)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {req.skill_name}
                      </span>
                      <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>
                        Req: {req.required_level}%
                      </span>
                      <Badge variant="neutral" size="sm">
                        Weight: {req.weight}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs italic py-2" style={{ color: 'var(--text-muted)' }}>
                No individual skill requirements configured for this role yet.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RolesCataloguePage;

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { roleService, studentService } from '../../services/studentService';
import {
  Compass,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Sparkles,
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
      setActionSuccess(`Target role successfully updated to "${roleName}". Your readiness score has been recalibrated.`);
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Career Role Catalogue">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[#77869B]">Loading career benchmark pathways...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Industry Career Role Catalogue"
      subtitle="Explore recruitment expectations and benchmark requirements defined by academic and industry experts"
    >
      <div className="space-y-6">
        {actionSuccess && (
          <Alert variant="success" title="Role Updated">
            {actionSuccess}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
      className={`bg-[#111B2D] border transition-all flex flex-col justify-between ${
        isTargetRole
          ? 'border-[#42F5E8]/60 shadow-[0_0_20px_-4px_rgba(66,245,232,0.2)]'
          : 'border-[#243249]'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-[#17243A] text-[#42F5E8]">
            <Compass size={20} />
          </div>
          {isTargetRole ? (
            <Badge variant="cyan" size="sm">
              Your Current Target
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectTarget}
              className="text-xs text-[#A6B4C8] hover:text-[#42F5E8]"
            >
              Set as Target
            </Button>
          )}
        </div>

        <h3 className="text-lg font-bold text-[#F3F7FC] mb-1.5">{role.name}</h3>
        <p className="text-sm text-[#A6B4C8] leading-relaxed line-clamp-3">
          {role.description || 'Comprehensive placement pathway with curated skill criteria.'}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-[#243249]">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#42F5E8] hover:text-[#24e8da] transition-colors py-1 focus:outline-none"
        >
          <span>{expanded ? 'Hide Required Skills' : 'View Skill Requirements'}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2.5 pt-3 border-t border-[#243249]/60 animate-fade-in">
            {loading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : details?.requirements?.length > 0 ? (
              <div className="space-y-2">
                {details.requirements.map((req) => (
                  <div
                    key={req.skill_id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1320] border border-[#243249] text-xs"
                  >
                    <span className="font-semibold text-[#F3F7FC]">{req.skill_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#A6B4C8]">Target: {req.required_level}%</span>
                      <Badge variant="neutral" size="sm">
                        Weight: {req.weight}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#77869B] italic py-2">
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

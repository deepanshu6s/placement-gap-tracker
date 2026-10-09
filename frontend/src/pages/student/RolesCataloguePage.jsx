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
  ChevronDown,
  ChevronUp,
  CheckCircle2,
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
      className={`bg-[#191512] border transition-colors flex flex-col justify-between ${
        isTargetRole
          ? 'border-[#FF6A2A]'
          : 'border-[#34271F]'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2 rounded-lg bg-[#241B16] text-[#FF6A2A]">
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
              className="text-xs text-[#C3B7AD] hover:text-[#FF6A2A]"
            >
              Set as Target
            </Button>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#F5F0EB] mb-1.5">{role.name}</h3>
        <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed line-clamp-3">
          {role.description || 'Comprehensive placement pathway with curated skill criteria.'}
        </p>
      </div>

      <div className="mt-4 pt-3.5 border-t border-[#34271F]">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-xs font-semibold text-[#FF6A2A] hover:text-[#FF7B43] transition-colors py-1 focus:outline-none"
        >
          <span>{expanded ? 'Hide Required Skills' : 'View Skill Criteria'}</span>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {expanded && (
          <div className="mt-2.5 space-y-2 pt-2.5 border-t border-[#34271F] animate-fade-in">
            {loading ? (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
              </div>
            ) : details?.requirements?.length > 0 ? (
              <div className="space-y-1.5">
                {details.requirements.map((req) => (
                  <div
                    key={req.skill_id}
                    className="flex items-center justify-between p-2 rounded bg-[#14110F] border border-[#34271F] text-xs"
                  >
                    <span className="font-semibold text-[#F5F0EB]">{req.skill_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#FFC857]">Req: {req.required_level}%</span>
                      <Badge variant="neutral" size="sm">
                        Weight: {req.weight}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#A3978D] italic py-2">
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

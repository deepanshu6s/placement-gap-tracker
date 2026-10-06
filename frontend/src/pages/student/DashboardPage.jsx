import React from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const DashboardPage = () => {
  return (
    <PageWrapper
      title="Student Readiness Dashboard"
      subtitle="Comprehensive view of your placement preparation and target role alignment"
      badge={<Badge variant="warning">Planned Phase 6</Badge>}
    >
      <div className="space-y-6">
        <Alert variant="info">
          The Student Dashboard is planned for integration in Phase 6. In Phase 1, this route
          confirms router layout and hierarchy integrity.
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Readiness Score (M03 / M10)" subtitle="Planned Phase 4">
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
              Role-Relative Readiness Ratio Gauge
            </div>
          </Card>
          <Card title="Skill Gap Radar (M03 / M09)" subtitle="Planned Phase 4">
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
              Radar Chart of Skill Gaps vs Requirements
            </div>
          </Card>
          <Card title="Top Recommendations (M04 / M12)" subtitle="Planned Phase 5">
            <div className="h-32 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
              Top 10 Actionable Recommendations (PHA-10)
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

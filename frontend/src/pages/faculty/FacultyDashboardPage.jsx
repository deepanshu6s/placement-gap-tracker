import React from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export const FacultyDashboardPage = () => {
  return (
    <PageWrapper
      title="Faculty & TPO Batch Analytics"
      subtitle="Cohort readiness metrics, common skill deficiencies, and student intervention rosters"
      badge={<Badge variant="warning">Planned Phase 5</Badge>}
    >
      <div className="space-y-6">
        <Alert variant="info">
          The Faculty & TPO Analytics Dashboard is planned for Phase 5. Aggregations will be
          strictly scoped by assigned batch_year and branch, with aggregate preparation metrics only
          (PHA-11).
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Batch Readiness Distribution (M14)" subtitle="Planned Phase 5">
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
              Readiness Score Histogram by Batch
            </div>
          </Card>
          <Card title="Cohort Intervention List (M14)" subtitle="Planned Phase 5">
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
              Roster of Students with ≥ 3 Critical Gaps
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

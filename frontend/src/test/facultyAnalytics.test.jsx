import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FacultyAnalyticsPage } from '../pages/faculty/FacultyAnalyticsPage';
import { facultyService } from '../services/facultyService';

vi.mock('../services/facultyService', () => ({
  facultyService: {
    getProfile: vi.fn(),
    getAnalyticsOverview: vi.fn(),
    getAnalyticsRoleDistribution: vi.fn(),
    getAnalyticsSkillGaps: vi.fn(),
    getStudentSupportList: vi.fn(),
    getAnalyticsInsights: vi.fn(),
    exportAnalyticsCSV: vi.fn(),
  },
}));

describe('FacultyAnalyticsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    facultyService.getProfile.mockResolvedValue({
      id: 'fac-1',
      full_name: 'Dr. Alan Turing',
      department: 'Computer Science',
      is_tpo: false,
    });

    facultyService.getAnalyticsOverview.mockResolvedValue({
      total_students: 45,
      students_with_role: 40,
      students_without_role: 5,
      students_with_baseline: 35,
      students_with_assessment: 28,
      total_tasks_completed: 120,
      evidence_pending_review: 4,
      evidence_needs_revision: 2,
      avg_readiness_score: 68.5,
    });

    facultyService.getAnalyticsRoleDistribution.mockResolvedValue([
      {
        role_id: 'r1',
        role_name: 'Full Stack Engineer',
        student_count: 25,
        avg_readiness: 72.0,
      },
      {
        role_id: 'r2',
        role_name: 'Data Analyst',
        student_count: 15,
        avg_readiness: 65.0,
      },
    ]);

    facultyService.getAnalyticsSkillGaps.mockResolvedValue([
      {
        skill_id: 's1',
        skill_name: 'SQL & Relational Databases',
        skill_category: 'technical',
        required_level: 'proficient',
        role_id: 'r1',
        role_name: 'Full Stack Engineer',
        cohort_size: 45,
        baseline_beginner: 12,
        baseline_intermediate: 15,
        baseline_proficient: 8,
        baseline_not_sure: 2,
        baseline_missing: 8,
        has_assessment: 28,
        avg_diagnostic_score: 64.2,
        gap_critical: 5,
      },
    ]);

    facultyService.getStudentSupportList.mockResolvedValue([
      {
        id: 'st-1',
        full_name: 'Alice Johnson',
        roll_number: 'CS202401',
        branch: 'CS',
        batch_year: 2024,
        cgpa: 8.5,
        target_role_name: 'Full Stack Engineer',
        readiness_score: 45.0,
        baseline_skills_count: 0,
        critical_gaps: 2,
        tasks_completed: 1,
        tasks_in_progress: 2,
        evidence_revision_pending: 1,
        evidence_awaiting_review: 0,
        baseline_pending: true,
        low_readiness: true,
        support_indicators: ['Baseline pending', 'Low readiness score', '2 critical gap(s)'],
      },
    ]);

    facultyService.getAnalyticsInsights.mockResolvedValue([
      {
        type: 'beginner_concentration',
        skill_id: 's1',
        skill_name: 'SQL & Relational Databases',
        role_name: 'Full Stack Engineer',
        metric_value: 48,
        message: '48% of students in Full Stack Engineer self-report Beginner proficiency in SQL & Relational Databases.',
        suggestion: 'Consider organising a foundational SQL workshop.',
      },
    ]);
  });

  it('renders analytics overview metrics cards and header', async () => {
    render(
      <MemoryRouter>
        <FacultyAnalyticsPage />
      </MemoryRouter>
    );

    // Wait for data load
    await waitFor(() => {
      expect(screen.getByText('Cohort Overview')).toBeInTheDocument();
    });

    // Check summary metric cards
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Baseline Submitted')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic Assessed')).toBeInTheDocument();
    expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
  });

  it('renders target role distribution view', async () => {
    render(
      <MemoryRouter>
        <FacultyAnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Target Role Distribution')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Full Stack Engineer').length).toBeGreaterThan(0);
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getAllByText('Data Analyst').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
  });

  it('renders skill gap heatmap with separated baseline and diagnostic information', async () => {
    render(
      <MemoryRouter>
        <FacultyAnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Skill Gap Heatmap')).toBeInTheDocument();
    });

    expect(screen.getAllByText('SQL & Relational Databases').length).toBeGreaterThan(0);
    expect(screen.getByText('Self-Report Distribution')).toBeInTheDocument();
    expect(screen.getByText('No Baseline')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic')).toBeInTheDocument();
    expect(screen.getByText('Critical Gaps')).toBeInTheDocument();
  });

  it('renders student support view and actionable insights', async () => {
    render(
      <MemoryRouter>
        <FacultyAnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Student Support View')).toBeInTheDocument();
    });

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('CS202401')).toBeInTheDocument();
    expect(screen.getByText('Baseline pending')).toBeInTheDocument();
    expect(screen.getByText('Cohort Insights & Suggested Actions')).toBeInTheDocument();
    expect(screen.getByText(/Consider organising a foundational SQL workshop/i)).toBeInTheDocument();
  });

  it('renders filter controls and CSV export button', async () => {
    render(
      <MemoryRouter>
        <FacultyAnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Export Analytics CSV')).toBeInTheDocument();
    });

    expect(screen.getByText('Scope Filter:')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});

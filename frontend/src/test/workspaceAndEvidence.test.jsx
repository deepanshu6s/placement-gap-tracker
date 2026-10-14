import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EvidencePortfolioPage } from '../pages/student/EvidencePortfolioPage';
import { evidenceService } from '../services/evidenceService';
import { skillService } from '../services/skillService';

vi.mock('../services/evidenceService', () => ({
  evidenceService: {
    getStudentEvidence: vi.fn(),
    submitEvidence: vi.fn(),
    updateEvidence: vi.fn(),
    deleteEvidence: vi.fn(),
  },
  default: {
    getStudentEvidence: vi.fn(),
  },
}));

vi.mock('../services/skillService', () => ({
  skillService: {
    getAllSkills: vi.fn(),
    getSkillDetail: vi.fn(),
  },
  default: {
    getAllSkills: vi.fn(),
  },
}));

describe('EvidencePortfolioPage Component', () => {
  it('renders student evidence portfolio, stats, and displays submissions with badges', async () => {
    evidenceService.getStudentEvidence.mockResolvedValue([
      {
        id: 'ev-1',
        student_id: 'st-1',
        skill_id: 'sk-1',
        skill_name: 'SQL & Relational Databases',
        title: 'Ecommerce Schema Migration & Indexing',
        evidence_type: 'github_repo',
        url: 'https://github.com/student/ecommerce-db',
        description: 'PostgreSQL schema with 3NF normalization, foreign key constraints, and index optimization.',
        status: 'accepted',
        faculty_feedback: 'Excellent normalization and indexing strategy. Approved.',
        created_at: '2026-10-10T00:00:00.000Z',
      },
      {
        id: 'ev-2',
        student_id: 'st-1',
        skill_id: 'sk-2',
        skill_name: 'Data Structures & Algorithms',
        title: 'LeetCode Solutions Monorepo',
        evidence_type: 'github_repo',
        url: 'https://github.com/student/dsa-solutions',
        description: 'Implemented 50+ medium algorithms in C++ with time and space complexity analyses.',
        status: 'needs_improvement',
        faculty_feedback: 'Please include unit tests for the graph algorithms.',
        created_at: '2026-10-12T00:00:00.000Z',
      },
    ]);

    skillService.getAllSkills.mockResolvedValue([
      { id: 'sk-1', name: 'SQL & Relational Databases', category: 'core_cs' },
      { id: 'sk-2', name: 'Data Structures & Algorithms', category: 'core_cs' },
    ]);

    render(
      <MemoryRouter>
        <EvidencePortfolioPage />
      </MemoryRouter>
    );

    // Verify page title and header
    await waitFor(() => {
      expect(screen.getByText('Evidence Portfolio')).toBeInTheDocument();
    });

    // Check stats counts
    expect(screen.getByText('Total Submitted')).toBeInTheDocument();
    expect(screen.getByText('Accepted by Faculty')).toBeInTheDocument();
    expect(screen.getAllByText('Needs Improvement').length).toBeGreaterThan(0);

    // Verify submission titles appear
    expect(screen.getByText('Ecommerce Schema Migration & Indexing')).toBeInTheDocument();
    expect(screen.getByText('LeetCode Solutions Monorepo')).toBeInTheDocument();

    // Verify feedback appears
    expect(screen.getByText(/Excellent normalization and indexing strategy/i)).toBeInTheDocument();
    expect(screen.getByText(/Please include unit tests for the graph algorithms/i)).toBeInTheDocument();

    // Verify filter buttons exist
    expect(screen.getByRole('button', { name: 'Accepted' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Needs Improvement' })).toBeInTheDocument();
  });
});

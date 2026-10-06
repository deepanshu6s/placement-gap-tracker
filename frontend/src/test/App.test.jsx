import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Root Component - Foundation Test', () => {
  it('renders application landing page and foundation status badge', () => {
    render(<App />);

    // Verify main brand heading renders
    expect(screen.getByText(/Smart Placement Readiness &/i)).toBeInTheDocument();
    expect(screen.getByText(/Skill Gap Tracker/i)).toBeInTheDocument();

    // Verify foundation badge renders
    expect(screen.getByText(/Phase 1: Project Foundation/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Root Component - Production Landing Page Test', () => {
  it('renders application landing page with brand heading and key sections', () => {
    render(<App />);

    // Verify main brand heading renders
    expect(screen.getByText(/Know Your Gaps/i)).toBeInTheDocument();
    expect(screen.getByText(/Build Your Skills/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Placement-Ready/i)).toBeInTheDocument();

    // Verify product sections render
    expect(screen.getByText(/How The Closed-Loop Workflow Works/i)).toBeInTheDocument();
    expect(screen.getByText(/Designed for Engineering Excellence/i)).toBeInTheDocument();
  });
});

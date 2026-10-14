import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from '../store/uiStore';
import { baselineService } from '../services/baselineService';
import { roadmapService } from '../services/roadmapService';
import { skillService } from '../services/skillService';
import { taskProgressService } from '../services/taskProgressService';
import { evidenceService } from '../services/evidenceService';
import { assessmentService } from '../services/assessmentService';

describe('Theme State Store & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('initializes with dark theme as default', () => {
    const theme = useUiStore.getState().theme;
    expect(theme).toBe('dark');
  });

  it('toggles theme to light and persists to localStorage and documentElement', () => {
    useUiStore.getState().toggleTheme();

    const newTheme = useUiStore.getState().theme;
    expect(newTheme).toBe('light');
    expect(localStorage.getItem('pt-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('sets theme directly to dark and updates attributes', () => {
    useUiStore.getState().setTheme('dark');

    expect(useUiStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('pt-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('scopes onboarding seen state by user ID', () => {
    const userId = 42;
    expect(useUiStore.getState().hasSeenOnboarding(userId)).toBe(false);

    useUiStore.getState().hideOnboarding(userId);
    expect(useUiStore.getState().hasSeenOnboarding(userId)).toBe(true);
    expect(localStorage.getItem(`pt-onboarding-seen-${userId}`)).toBe('true');

    // Other user should still not have seen onboarding
    expect(useUiStore.getState().hasSeenOnboarding(99)).toBe(false);
  });
});

describe('Frontend Services Surface Definition (Task 3)', () => {
  it('baselineService defines getBaseline, saveBaseline, updateSkillBaseline', () => {
    expect(typeof baselineService.getBaseline).toBe('function');
    expect(typeof baselineService.saveBaseline).toBe('function');
    expect(typeof baselineService.updateSkillBaseline).toBe('function');
  });

  it('roadmapService defines getRoadmap', () => {
    expect(typeof roadmapService.getRoadmap).toBe('function');
  });

  it('skillService defines getSkillDetail', () => {
    expect(typeof skillService.getSkillDetail).toBe('function');
  });

  it('taskProgressService defines getSkillTasks, updateTaskProgress, and getStats', () => {
    expect(typeof taskProgressService.getSkillTasks).toBe('function');
    expect(typeof taskProgressService.updateTaskProgress).toBe('function');
    expect(typeof taskProgressService.getStats).toBe('function');
  });

  it('evidenceService defines student and faculty portfolio review methods', () => {
    expect(typeof evidenceService.getStudentEvidence).toBe('function');
    expect(typeof evidenceService.submitEvidence).toBe('function');
    expect(typeof evidenceService.updateEvidence).toBe('function');
    expect(typeof evidenceService.deleteEvidence).toBe('function');
    expect(typeof evidenceService.getFacultyEvidenceQueue).toBe('function');
    expect(typeof evidenceService.reviewEvidence).toBe('function');
  });

  it('assessmentService defines startAttempt, getQuestions, submitAttempt, and getAttemptReview', () => {
    expect(typeof assessmentService.startAttempt).toBe('function');
    expect(typeof assessmentService.getQuestions).toBe('function');
    expect(typeof assessmentService.submitAttempt).toBe('function');
    expect(typeof assessmentService.getAttemptReview).toBe('function');
  });
});

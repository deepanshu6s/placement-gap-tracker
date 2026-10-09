export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const GAP_CATEGORIES = {
  NONE: 'none',
  SMALL: 'small',
  MEDIUM: 'medium',
  CRITICAL: 'critical',
};

export const GAP_LABELS = {
  none: 'No Gap',
  small: 'Small Gap',
  medium: 'Medium Gap',
  critical: 'Critical Gap',
};

export const READINESS_LABELS = [
  { min: 90, label: 'Placement Ready', badge: 'orange' },
  { min: 75, label: 'High Readiness', badge: 'orange' },
  { min: 60, label: 'Moderate Readiness', badge: 'amber' },
  { min: 40, label: 'Developing', badge: 'amber' },
  { min: 20, label: 'Early Stage', badge: 'coral' },
  { min: 0, label: 'Needs Preparation', badge: 'coral' },
];

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
  { min: 93, label: 'Highly Ready', color: 'emerald' },
  { min: 81, label: 'Ready', color: 'green' },
  { min: 66, label: 'Almost Ready', color: 'lime' },
  { min: 46, label: 'Developing', color: 'amber' },
  { min: 21, label: 'Early Stage', color: 'orange' },
  { min: 0, label: 'Not Ready', color: 'red' },
];

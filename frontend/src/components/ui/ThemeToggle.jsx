import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

/**
 * ThemeToggle — toggles between dark and light themes.
 * Persists the preference to localStorage via uiStore.
 */
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useUiStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-orange)] focus:ring-offset-1 focus:ring-offset-[var(--bg-app)] ${className}`}
      style={{
        background: 'var(--surface-hover)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-primary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-active)';
        e.currentTarget.style.color = 'var(--color-orange)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {/* Animated icon swap */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
        style={{ opacity: isDark ? 1 : 0, transform: isDark ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-30deg)' }}
        aria-hidden="true"
      >
        <Sun size={16} />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-200"
        style={{ opacity: isDark ? 0 : 1, transform: isDark ? 'scale(0.6) rotate(30deg)' : 'scale(1) rotate(0deg)' }}
        aria-hidden="true"
      >
        <Moon size={16} />
      </span>
    </button>
  );
};

export default ThemeToggle;

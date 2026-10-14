import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Alert = ({ children, variant = 'info', title, className = '' }) => {
  const configs = {
    info: {
      bg: 'bg-[var(--surface-card)]',
      border: 'border-[var(--color-orange)]/40',
      text: 'text-[var(--text-secondary)]',
      titleColor: 'text-[var(--color-orange)]',
      iconColor: 'text-[var(--color-orange)]',
      Icon: Info,
    },
    warning: {
      bg: 'bg-[var(--surface-card)]',
      border: 'border-[var(--color-amber)]/45',
      text: 'text-[var(--text-secondary)]',
      titleColor: 'text-[var(--color-amber)]',
      iconColor: 'text-[var(--color-amber)]',
      Icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-[var(--surface-card)]',
      border: 'border-[var(--color-coral)]/45',
      text: 'text-[var(--text-secondary)]',
      titleColor: 'text-[var(--color-coral)]',
      iconColor: 'text-[var(--color-coral)]',
      Icon: AlertCircle,
    },
    error: {
      bg: 'bg-[var(--surface-card)]',
      border: 'border-[var(--color-coral)]/45',
      text: 'text-[var(--text-secondary)]',
      titleColor: 'text-[var(--color-coral)]',
      iconColor: 'text-[var(--color-coral)]',
      Icon: AlertCircle,
    },
    success: {
      bg: 'bg-[var(--surface-card)]',
      border: 'border-[var(--color-orange)]/40',
      text: 'text-[var(--text-secondary)]',
      titleColor: 'text-[var(--color-orange)]',
      iconColor: 'text-[var(--color-orange)]',
      Icon: CheckCircle2,
    },
  };

  const config = configs[variant] || configs.info;
  const { Icon } = config;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border ${config.bg} ${config.border} flex items-start gap-3 text-xs sm:text-sm transition-all ${className}`}
      role="alert"
    >
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 space-y-0.5">
        {title && <h5 className={`font-semibold text-xs sm:text-sm ${config.titleColor}`}>{title}</h5>}
        <div className={`leading-relaxed ${config.text}`}>{children}</div>
      </div>
    </div>
  );
};

export default Alert;

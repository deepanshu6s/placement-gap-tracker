import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Alert = ({ children, variant = 'info', title, className = '' }) => {
  const configs = {
    info: {
      bg: 'bg-[#FF6A2A]/10',
      border: 'border-[#FF6A2A]/35',
      text: 'text-[#F5F0EB]',
      titleColor: 'text-[#FF6A2A]',
      iconColor: 'text-[#FF6A2A]',
      Icon: Info,
    },
    warning: {
      bg: 'bg-[#FFC857]/10',
      border: 'border-[#FFC857]/35',
      text: 'text-[#F5F0EB]',
      titleColor: 'text-[#FFC857]',
      iconColor: 'text-[#FFC857]',
      Icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-[#FF526F]/10',
      border: 'border-[#FF526F]/35',
      text: 'text-[#F5F0EB]',
      titleColor: 'text-[#FF526F]',
      iconColor: 'text-[#FF526F]',
      Icon: AlertCircle,
    },
    error: {
      bg: 'bg-[#FF526F]/10',
      border: 'border-[#FF526F]/35',
      text: 'text-[#F5F0EB]',
      titleColor: 'text-[#FF526F]',
      iconColor: 'text-[#FF526F]',
      Icon: AlertCircle,
    },
    success: {
      bg: 'bg-[#FF6A2A]/10',
      border: 'border-[#FF6A2A]/35',
      text: 'text-[#F5F0EB]',
      titleColor: 'text-[#FF6A2A]',
      iconColor: 'text-[#FF6A2A]',
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

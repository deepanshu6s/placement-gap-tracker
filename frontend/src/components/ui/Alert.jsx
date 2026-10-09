import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Alert = ({ children, variant = 'info', title, className = '' }) => {
  const configs = {
    info: {
      bg: 'bg-[#60A5FA]/10',
      border: 'border-[#60A5FA]/30',
      text: 'text-[#93C5FD]',
      titleColor: 'text-[#BFDBFE]',
      Icon: Info,
    },
    warning: {
      bg: 'bg-[#FBBF24]/10',
      border: 'border-[#FBBF24]/30',
      text: 'text-[#FDE68A]',
      titleColor: 'text-[#FEF08A]',
      Icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-[#FB7185]/10',
      border: 'border-[#FB7185]/30',
      text: 'text-[#FECDD3]',
      titleColor: 'text-[#FFE4E6]',
      Icon: AlertCircle,
    },
    error: {
      bg: 'bg-[#FB7185]/10',
      border: 'border-[#FB7185]/30',
      text: 'text-[#FECDD3]',
      titleColor: 'text-[#FFE4E6]',
      Icon: AlertCircle,
    },
    success: {
      bg: 'bg-[#4ADE80]/10',
      border: 'border-[#4ADE80]/30',
      text: 'text-[#BBF7D0]',
      titleColor: 'text-[#DCFCE7]',
      Icon: CheckCircle2,
    },
  };

  const config = configs[variant] || configs.info;
  const { Icon } = config;

  return (
    <div
      className={`p-4 rounded-xl border ${config.bg} ${config.border} flex items-start gap-3.5 text-sm transition-all ${className}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.text}`} />
      <div className="flex-1 space-y-0.5">
        {title && <h5 className={`font-semibold ${config.titleColor}`}>{title}</h5>}
        <div className={`leading-relaxed ${config.text}`}>{children}</div>
      </div>
    </div>
  );
};

export default Alert;

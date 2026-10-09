import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0908]/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-[#12100E] border border-[#34271F] rounded-xl ${maxWidth} w-full p-6 shadow-card-elevated animate-fade-in`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#34271F]">
          <h3 className="text-lg font-bold text-[#F5F0EB] tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-[#A3978D] hover:text-[#F5F0EB] hover:bg-[#241B16] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

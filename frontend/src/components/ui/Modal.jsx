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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B12]/80 backdrop-blur-md animate-fade-in">
      <div
        className={`bg-[#0D1320] border border-[#243249] rounded-2xl ${maxWidth} w-full p-6 shadow-card-elevated animate-in fade-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#243249]">
          <h3 className="text-xl font-bold text-[#F3F7FC] tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-[#77869B] hover:text-[#F3F7FC] hover:bg-[#17243A] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

import type { ReactNode } from 'react';
import MaterialIcon from './MaterialIcon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={`animate-scale-in relative w-full md:max-w-lg bg-surface-container-low border border-outline-variant/20 rounded-t-[2rem] md:rounded-[1.75rem] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] z-10 max-h-[90vh] overflow-y-auto mb-[76px] md:mb-0 ${className}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-on-surface">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-150"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

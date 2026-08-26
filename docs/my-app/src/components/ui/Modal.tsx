'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-card border border-card-border text-foreground shadow-2xl transition-all ${className ? className : 'p-6'}`}>
        {title ? (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 rounded-full p-1.5 bg-black/50 text-slate-400 hover:text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
          >
            <X size={16} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

'use client';

import { useEffect } from 'react';
import { theme } from '@/lib/theme';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`absolute inset-0 ${theme.overlay} transition-opacity`}
        onClick={onClose}
        aria-hidden
      />
      <div className={`transition-smooth relative z-10 w-full max-w-md ${theme.modalPanel}`}>
        <div className={theme.modalHeader}>
          <h2 id="modal-title" className={theme.modalTitle}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={theme.modalClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <span aria-hidden className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

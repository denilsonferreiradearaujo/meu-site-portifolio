'use client';

import React from 'react';
import { ToastState } from '@/types';

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    if (toast.type === 'error') return '!';
    if (toast.type === 'info') return 'i';
    return '✓';
  };

  return (
    <div
      className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-copy">
        <b>{toast.title}</b>
        {toast.message && <span>{toast.message}</span>}
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Fechar">
        ×
      </button>
    </div>
  );
};

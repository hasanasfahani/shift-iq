'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
}

export function Toast({ message, type = 'success', onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors =
    type === 'success'
      ? 'bg-[#0F3D36] text-white'
      : type === 'error'
      ? 'bg-red-600 text-white'
      : 'bg-[#7426E8] text-white';

  return (
    <div
      role="alert"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-semibold ${colors}`}
    >
      {message}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}

// Lightweight hook to manage a single toast at a time
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const show = (message: string, type: ToastType = 'success') =>
    setToast({ message, type: type as ToastType });

  const dismiss = () => setToast(null);

  return { toast, show, dismiss };
}

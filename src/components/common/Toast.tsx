import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { clsx } from 'clsx';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useUIStore();

  if (!toast.isOpen) return null;

  const bgClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between px-4 py-3 rounded-lg shadow-lg max-w-sm w-full animate-bounce">
      <div className={clsx('flex-1 rounded-lg px-4 py-3 flex justify-between items-center', bgClasses[toast.type])}>
        <span className="font-semibold">{toast.message}</span>
        <button onClick={hideToast} className="ml-2 font-bold focus:outline-none">
          ✕
        </button>
      </div>
    </div>
  );
};

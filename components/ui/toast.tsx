'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastStore } from '@/lib/store';

export function Toast() {
  const { message, type, isVisible, hideToast } = useToastStore();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible, hideToast]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div
        className={`rounded-md p-4 shadow-lg flex items-center justify-between gap-2 ${
          type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : type === 'error' 
              ? 'bg-red-100 border-red-400 text-red-700' 
              : 'bg-blue-100 border-blue-400 text-blue-700'
        }`}
      >
        <p>{message}</p>
        <button onClick={hideToast} className="text-gray-500 hover:text-gray-800">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLive } from '../context/LiveContext';

export const ErrorAlert: React.FC = () => {
  const { error, setError } = useLive();

  if (!error) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-rose-950/90 border border-rose-500/50 text-rose-200 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start space-x-3 animate-fade-in">
      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-xs">
        <p className="font-bold text-white mb-0.5">Stream Error / Notice</p>
        <p>{error}</p>
      </div>
      <button
        onClick={() => setError(null)}
        className="p-1 text-rose-400 hover:text-white rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

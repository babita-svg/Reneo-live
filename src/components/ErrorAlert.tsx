import React from 'react';
import { useLive } from '../context/LiveContext';
import { AlertCircle, X, ShieldAlert, WifiOff, CameraOff, VideoOff, RotateCcw } from 'lucide-react';

export const ErrorAlertContainer: React.FC = () => {
  const { streamErrors, dismissStreamError } = useLive();

  if (streamErrors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full space-y-2 pointer-events-none p-2">
      {streamErrors.map((err) => (
        <div
          key={err.id}
          className="pointer-events-auto bg-[#0F172A] border border-blue-500/40 text-slate-100 p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-slideUp"
        >
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg mt-0.5">
            {err.type === 'camera_denied' || err.type === 'mic_unavailable' ? (
              <CameraOff className="w-5 h-5" />
            ) : err.type === 'network_error' ? (
              <WifiOff className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-xs text-blue-300">{err.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{err.message}</p>
            {err.actionableText && (
              <div className="mt-2 text-[11px] font-semibold text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-md inline-block border border-blue-500/20">
                💡 Actionable Suggestion: {err.actionableText}
              </div>
            )}
          </div>

          <button
            onClick={() => dismissStreamError(err.id)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { Activity, Key, Plus, Sparkles, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { ApiStatus } from '../types';

interface HeaderProps {
  apiStatus: ApiStatus;
  isVerifying: boolean;
  onOpenConfig: () => void;
  onNewAnalysis: () => void;
  hasActiveReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  isVerifying,
  onOpenConfig,
  onNewAnalysis,
  hasActiveReport,
}) => {
  return (
    <header className="border-b border-[#E2DFD6] bg-[#FAF9F5]/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C6F432] text-[#0F0F0E] rounded-sm flex items-center justify-center font-mono font-bold text-sm tracking-wider shadow-sm">
            CS
          </div>
          <div className="flex items-center gap-3">
            <span className="font-editorial text-lg tracking-wider text-[#0F0F0E] uppercase font-semibold">
              CultureShift
            </span>
            <span className="text-[#D1CDC3]">|</span>
            <span className="text-xs tracking-widest uppercase font-mono text-[#52524E]">
              Cultural Intelligence
            </span>
          </div>
        </div>

        {/* Right controls: API status badge & actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Qloo API Status Badge */}
          <button
            onClick={onOpenConfig}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono transition-all border ${
              isVerifying
                ? 'bg-[#F3F1EA] text-[#52524E] border-[#E2DFD6]'
                : apiStatus.configured && apiStatus.verified
                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] hover:border-[#86EFAC]'
                : apiStatus.configured
                ? 'bg-[#FEFCE8] text-[#A16207] border-[#FEF08A] hover:border-[#FDE047]'
                : 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5] hover:border-[#F87171] animate-pulse'
            }`}
            title="Click to view Qloo API connection details & secret configuration"
            aria-label="Qloo API Connection Status"
          >
            {isVerifying ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin text-[#52524E]" />
                <span className="hidden md:inline">TESTING QLOO...</span>
              </>
            ) : apiStatus.configured && apiStatus.verified ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E]"></span>
                <span className="font-medium">Qloo connected</span>
              </>
            ) : apiStatus.configured ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#CA8A04]" />
                <span>QLOO KEY SET</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                <span className="font-semibold">QLOO KEY REQUIRED</span>
              </>
            )}
          </button>

          {/* Config & Settings Button */}
          <button
            onClick={onOpenConfig}
            className="flex items-center justify-center w-8 h-8 rounded-sm text-xs font-mono bg-white text-[#0F0F0E] border border-[#E2DFD6] hover:border-[#C8C3B8] transition-colors shadow-sm"
            aria-label="Configure Qloo Secret"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-[#0F0F0E]" />
          </button>

          {/* New Analysis Trigger */}
          {hasActiveReport && (
            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono bg-[#C8F832] text-[#0F0F0E] font-semibold hover:bg-[#B8E822] active:scale-[0.98] transition-all shadow-sm"
              aria-label="Start New Cultural Analysis"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Brief</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

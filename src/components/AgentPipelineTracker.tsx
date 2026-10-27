import React from 'react';
import { Target, Search, ShieldAlert, Compass, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';

export type AgentStageKey =
  | 'overview'
  | 'marketAnalyst'
  | 'culturalResearcher'
  | 'redTeam'
  | 'strategyArchitect'
  | 'evidenceVerifier'
  | 'crossMarket';

interface AgentPipelineTrackerProps {
  activeStage: AgentStageKey;
  onSelectStage: (stage: AgentStageKey) => void;
  hasCrossMarket: boolean;
}

export const AgentPipelineTracker: React.FC<AgentPipelineTrackerProps> = ({
  activeStage,
  onSelectStage,
  hasCrossMarket,
}) => {
  const agents = [
    {
      id: 'marketAnalyst' as const,
      num: '01',
      title: 'Market Analyst',
      subtitle: 'Brief Deconstruction',
      icon: Target,
    },
    {
      id: 'culturalResearcher' as const,
      num: '02',
      title: 'Cultural Researcher',
      subtitle: 'Live Qloo API Graph',
      icon: Search,
    },
    {
      id: 'redTeam' as const,
      num: '03',
      title: 'Red-Team Adversary',
      subtitle: 'Stress-Test & Friction',
      icon: ShieldAlert,
    },
    {
      id: 'strategyArchitect' as const,
      num: '04',
      title: 'Strategy Architect',
      subtitle: 'Comparison Lab',
      icon: Compass,
    },
    {
      id: 'evidenceVerifier' as const,
      num: '05',
      title: 'Evidence Verifier',
      subtitle: 'Truth Calibration',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-[#0C0E13] border border-[#202532] rounded-sm p-3.5 space-y-2 font-mono-code text-xs">
      <div className="flex items-center justify-between text-[11px] text-[#71788A] pb-2 border-b border-[#1A1F2B]">
        <div className="flex items-center gap-1.5 text-[#CCFF00]">
          <Cpu className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">COORDINATED MULTI-AGENT WORKFLOW</span>
        </div>
        <span className="text-[#565D6F]">STRUCTURED OUTPUT PIPELINE</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
        {agents.map(ag => {
          const isActive = activeStage === ag.id;
          const Icon = ag.icon;
          return (
            <button
              key={ag.id}
              type="button"
              onClick={() => onSelectStage(ag.id)}
              className={`p-2.5 rounded-sm border text-left transition-all flex items-start gap-2.5 ${
                isActive
                  ? 'bg-[#151924] border-[#CCFF00] text-[#F4F3EF] shadow-[0_0_12px_rgba(204,255,0,0.12)]'
                  : 'bg-[#0E1015] border-[#222734] text-[#868E9F] hover:border-[#384154] hover:text-[#ECEBE6]'
              }`}
            >
              <div
                className={`p-1 rounded shrink-0 ${
                  isActive ? 'bg-[#CCFF00] text-black' : 'bg-[#151822] text-[#CCFF00]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[10px] text-[#5D6475]">
                  <span>AGENT {ag.num}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
                </div>
                <div className="text-xs font-semibold truncate text-[#ECEBE6]">
                  {ag.title}
                </div>
                <div className="text-[10px] text-[#707787] truncate">
                  {ag.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

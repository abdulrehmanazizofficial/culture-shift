import React from 'react';
import { ShieldAlert, AlertTriangle, Flame, Shield, ArrowRight } from 'lucide-react';
import { RedTeamStage } from '../types';

interface RedTeamDossierProps {
  stage: RedTeamStage;
}

export const RedTeamDossier: React.FC<RedTeamDossierProps> = ({ stage }) => {
  const getSeverityStyle = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
      case 'High':
        return 'bg-[#291010] text-[#FCA5A5] border-[#5E2222]';
      case 'Medium':
        return 'bg-[#2B210E] text-[#FDE68A] border-[#57411B]';
      case 'Low':
        return 'bg-[#121F17] text-[#86EFAC] border-[#224A30]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Verdict */}
      <div className="p-6 rounded-sm bg-[#110D0F] border border-[#301B20] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#29171C]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#F87171]" />
              <h3 className="font-editorial text-lg text-[#F4F3EF] uppercase tracking-wider font-semibold">
                Red-Team Adversarial Review
              </h3>
            </div>
            <p className="text-xs text-[#8C7A7E]">
              Adversarial stress-testing challenging founder assumptions against verified taste data
            </p>
          </div>

          <div className="px-3 py-1 rounded bg-[#1C0E11] border border-[#401C22] text-xs font-mono-code text-[#FCA5A5]">
            <span className="text-[#A65B66] uppercase block text-[9px]">VERDICT:</span>
            <span className="font-bold">{stage.adversarialVerdict}</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono-code uppercase tracking-wider text-[#A6616C] font-semibold block">
            ADVERSARIAL CRITIQUE:
          </span>
          <p className="text-xs font-mono-code text-[#DEC9CC] leading-relaxed">
            {stage.adversarialCritique}
          </p>
        </div>
      </div>

      {/* Friction Points Grid */}
      <div className="space-y-4">
        <span className="text-xs font-mono-code uppercase tracking-wider text-[#A7ADB9] block font-medium">
          Identified Friction Points & Positioning Risks ({stage.frictionPoints.length})
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stage.frictionPoints.map((point, idx) => (
            <div
              key={idx}
              className="p-5 rounded-sm bg-[#110D0F] border border-[#301B20] hover:border-[#4D262F] transition-all space-y-3 font-mono-code text-xs flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border uppercase font-medium ${getSeverityStyle(
                      point.severity
                    )}`}
                  >
                    {point.severity} Severity
                  </span>
                  <span className="text-[10px] text-[#695156]">RISK 0{idx + 1}</span>
                </div>

                <h4 className="text-sm font-semibold text-[#F4F3EF]">
                  {point.riskTitle}
                </h4>

                <div className="p-3 rounded bg-[#180E10] border border-[#36191E] space-y-1 text-[#FCA5A5]">
                  <span className="text-[10px] text-[#A6626D] uppercase block font-bold">
                    CONFLICT WITH OBSERVED TASTE:
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {point.conflictWithObservedTaste}
                  </p>
                </div>

                <div className="space-y-1 text-[#C4B2B6]">
                  <span className="text-[10px] text-[#8C7A7E] uppercase block font-semibold">
                    POTENTIAL BACKLASH OR APATHY:
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {point.potentialBacklashOrApathy}
                  </p>
                </div>

                <div className="space-y-1 text-[#C4B2B6]">
                  <span className="text-[10px] text-[#8C7A7E] uppercase block font-semibold">
                    STRESS-TEST FAILURE SCENARIO:
                  </span>
                  <p className="text-[11px] leading-relaxed italic">
                    "{point.stressTestScenario}"
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#26171B] text-[11px] text-[#86EFAC]">
                <strong className="text-[#34D399]">RECOMMENDED SAFEGUARD: </strong>
                <span>{point.recommendedSafeguard}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlooked Blindspots */}
      {stage.overlookedBlindspots && stage.overlookedBlindspots.length > 0 && (
        <div className="p-4 rounded-sm bg-[#0E1015] border border-[#222734] space-y-2 font-mono-code text-xs">
          <span className="text-xs uppercase font-semibold text-[#CBD0DC] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />
            Overlooked Cultural Blindspots
          </span>
          <ul className="space-y-1.5 text-[11px] text-[#9EA6B6]">
            {stage.overlookedBlindspots.map((blindspot, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#FBBF24]">•</span>
                <span>{blindspot}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

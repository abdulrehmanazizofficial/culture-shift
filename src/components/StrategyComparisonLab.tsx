import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  FlaskConical,
  Lightbulb,
  Compass,
  Sparkles,
  Award,
  FileText,
  Copy,
  Check,
  X,
  Target,
} from 'lucide-react';
import { StrategyOption, ValidatedLaunchConfig, MultiAgentReport } from '../types';

interface StrategyComparisonLabProps {
  originalPositioning: string;
  strategies: StrategyOption[];
  strategicDirection: string;
  report?: MultiAgentReport | null;
}

export const StrategyComparisonLab: React.FC<StrategyComparisonLabProps> = ({
  originalPositioning,
  strategies = [],
  strategicDirection,
  report,
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    strategies[0]?.id || 'original'
  );
  const [preferredStrategyId, setPreferredStrategyId] = useState<string | null>(
    strategies[0]?.id || null
  );
  const [isBriefModalOpen, setIsBriefModalOpen] = useState(false);
  const [revisedBriefData, setRevisedBriefData] = useState<any | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const activeStrategy = strategies.find(s => s.id === selectedStrategyId);

  const handleGenerateRevisedBrief = async (strategyId: string) => {
    setIsGeneratingBrief(true);
    try {
      if (report) {
        const res = await fetch('/api/brief/revise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ report, strategyId }),
        });
        if (res.ok) {
          const data = await res.json();
          setRevisedBriefData(data.revisedBrief);
          setIsBriefModalOpen(true);
          return;
        }
      }

      // Client-side fallback if server offline
      const strat = strategies.find(s => s.id === strategyId);
      if (strat) {
        setRevisedBriefData({
          originalProduct: report?.validatedConfig?.productName || 'Your Product',
          selectedArchetype: strat.archetype,
          revisedTagline: strat.tagline,
          revisedPositioning: strat.coreThesis,
          targetAudience: strat.intendedAudience,
          primaryMarket: report?.validatedConfig?.primaryMarket || 'Tokyo',
          brandAllies: strat.keyBrandAllies,
          creativeDirection: strat.creativeDirection,
          aestheticCues: strat.culturalAesthetic,
          immediateLaunchAction: strat.launchPlaybookStep,
          recommendedFirstExperiment: report?.experiments?.[0] || null,
          generatedAt: new Date().toISOString(),
        });
        setIsBriefModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to generate revised brief:', err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const copyBriefToClipboard = () => {
    if (!revisedBriefData) return;
    const text = `# REVISED LAUNCH BRIEF: ${revisedBriefData.originalProduct}
Archetype: ${revisedBriefData.selectedArchetype}
Tagline: "${revisedBriefData.revisedTagline}"
Revised Positioning: ${revisedBriefData.revisedPositioning}
Target Audience: ${revisedBriefData.targetAudience}
Primary Market: ${revisedBriefData.primaryMarket}
Brand Allies: ${(revisedBriefData.brandAllies || []).join(', ')}
Creative Direction: ${revisedBriefData.creativeDirection}
Aesthetic: ${revisedBriefData.aestheticCues}
Immediate Launch Action: ${revisedBriefData.immediateLaunchAction}
Generated: ${revisedBriefData.generatedAt}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#202532] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#CCFF00]" />
            <h3 className="font-editorial text-lg text-[#F4F3EF] uppercase tracking-wider font-semibold">
              Strategy Comparison Lab
            </h3>
          </div>
          <p className="text-xs text-[#7F8697]">
            Evaluate 3 alternative positioning paths side by side, grounded in verified Qloo taste vectors and adversarial stress-testing
          </p>
        </div>

        {strategicDirection && (
          <div className="px-3 py-1 rounded bg-[#131720] border border-[#232938] text-xs font-mono-code text-[#B4BAC8] max-w-md">
            <span className="text-[#CCFF00] font-semibold">DIRECTION: </span>
            <span>{strategicDirection}</span>
          </div>
        )}
      </div>

      {/* Archetype Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Baseline Card */}
        <button
          type="button"
          onClick={() => setSelectedStrategyId('original')}
          className={`p-4 rounded-sm border text-left transition-all ${
            selectedStrategyId === 'original'
              ? 'bg-[#151922] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.1)]'
              : 'bg-[#0E1015] border-[#222734] hover:border-[#333B4C]'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono-code text-[#737B8C] mb-2">
            <span>BASELINE HYPOTHESIS</span>
            <span className="text-[10px] text-[#A6ACB9]">Founder Input</span>
          </div>
          <h4 className="text-xs font-semibold text-[#ECEBE6] font-editorial mb-1">
            Original Proposed Angle
          </h4>
          <p className="text-[11px] text-[#7C8394] line-clamp-2">
            {originalPositioning}
          </p>
        </button>

        {/* 3 Alternative Archetypes */}
        {strategies.map((strat, idx) => {
          const isSelected = selectedStrategyId === strat.id;
          const isPreferred = preferredStrategyId === strat.id;

          return (
            <button
              key={strat.id}
              type="button"
              onClick={() => setSelectedStrategyId(strat.id)}
              className={`p-4 rounded-sm border text-left transition-all relative ${
                isSelected
                  ? 'bg-[#151922] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                  : 'bg-[#0E1015] border-[#222734] hover:border-[#333B4C]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono-code text-[#737B8C] mb-2">
                <span>ARCHETYPE 0{idx + 1}</span>
                {isPreferred && (
                  <span className="text-[#CCFF00] font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" /> PREFERRED
                  </span>
                )}
              </div>
              <h4 className="text-xs font-semibold text-[#ECEBE6] font-editorial mb-1 truncate">
                {strat.archetype}
              </h4>
              <p className="text-[11px] text-[#7C8394] line-clamp-2 italic">
                "{strat.tagline}"
              </p>
              {strat.heuristicAlignmentScore && (
                <div className="mt-2 text-[10px] font-mono-code text-[#CCFF00] flex items-center justify-between">
                  <span>Heuristic Score:</span>
                  <span className="font-bold">{strat.heuristicAlignmentScore.score}/100</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Blueprint */}
      {selectedStrategyId === 'original' ? (
        <div className="p-6 rounded-sm bg-[#0E1015] border border-[#202532] space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <span className="text-[10px] font-mono-code text-[#767E90] uppercase tracking-wider">
              Baseline Brief Evaluation
            </span>
            <h4 className="text-base font-editorial text-[#F4F3EF] font-semibold">
              Original Founder Positioning Thesis
            </h4>
          </div>
          <div className="p-4 rounded bg-[#090A0D] border border-[#191D26] text-xs font-mono-code text-[#D0D5E0] leading-relaxed">
            "{originalPositioning}"
          </div>
          <p className="text-xs text-[#8A92A3] leading-relaxed font-mono-code">
            This angle establishes a foundational hypothesis, but may face friction from cultural blindspots identified
            in the taste graph. Select the alternative archetypes above to review concrete advantages, risks, assumptions,
            and recommended validation experiments.
          </p>
        </div>
      ) : activeStrategy ? (
        <div className="p-6 rounded-sm bg-[#0E1015] border border-[#202532] space-y-6 animate-in fade-in duration-150">
          {/* Header & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E2330]">
            <div>
              <span className="text-[10px] font-mono-code text-[#CCFF00] uppercase tracking-wider font-semibold">
                // STRATEGY ARCHITECT BLUEPRINT
              </span>
              <h4 className="text-xl font-editorial text-[#F4F3EF] font-semibold mt-1">
                {activeStrategy.archetype}
              </h4>
              <p className="text-xs text-[#9DA4B5] italic mt-0.5 font-mono-code">
                "{activeStrategy.tagline}"
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setPreferredStrategyId(activeStrategy.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono-code text-xs transition-all ${
                  preferredStrategyId === activeStrategy.id
                    ? 'bg-[#18210A] border-[#CCFF00] text-[#CCFF00]'
                    : 'bg-[#13161F] border-[#252C3D] text-[#868E9F] hover:text-[#ECEBE6]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{preferredStrategyId === activeStrategy.id ? 'Selected as Preferred' : 'Select as Preferred'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateRevisedBrief(activeStrategy.id)}
                disabled={isGeneratingBrief}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-[#CCFF00] hover:bg-[#B8E600] text-black font-mono-code text-xs font-semibold transition-all shadow-[0_0_12px_rgba(204,255,0,0.15)] disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isGeneratingBrief ? 'Generating...' : 'Generate Revised Brief'}</span>
              </button>
            </div>
          </div>

          {/* Intended Audience & Heuristic Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-code">
            <div className="p-3.5 rounded bg-[#090A0E] border border-[#1B202A] space-y-1">
              <span className="text-[10px] text-[#6D7586] uppercase tracking-wider block">
                TARGET AUDIENCE CALIBRATION:
              </span>
              <p className="text-[#D8DCE5]">
                {activeStrategy.intendedAudience}
              </p>
            </div>

            {activeStrategy.heuristicAlignmentScore && (
              <div className="p-3.5 rounded bg-[#090A0E] border border-[#1B202A] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#6D7586] uppercase tracking-wider">
                    HEURISTIC ALIGNMENT SCORE:
                  </span>
                  <span className="text-sm font-bold text-[#CCFF00]">
                    {activeStrategy.heuristicAlignmentScore.score}/100
                  </span>
                </div>
                <p className="text-[10px] text-[#7F8698] leading-tight">
                  {activeStrategy.heuristicAlignmentScore.formulaExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Core Thesis & Launch Step */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-code">
            <div className="space-y-1.5 p-4 rounded bg-[#090A0E] border border-[#1B202A]">
              <span className="text-[#6D7586] uppercase tracking-wider text-[10px] block">
                STRATEGIC THESIS & NARRATIVE:
              </span>
              <p className="text-[#D8DCE5] leading-relaxed">
                {activeStrategy.coreThesis}
              </p>
            </div>

            <div className="space-y-1.5 p-4 rounded bg-[#090A0E] border border-[#1B202A]">
              <span className="text-[#6D7586] uppercase tracking-wider text-[10px] block">
                FLAGSHIP LAUNCH PLAYBOOK STEP:
              </span>
              <p className="text-[#D8DCE5] leading-relaxed">
                {activeStrategy.launchPlaybookStep}
              </p>
            </div>
          </div>

          {/* Advantages vs Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Advantages */}
            <div className="p-4 rounded-sm bg-[#0B100D] border border-[#1E3B24] space-y-2.5">
              <span className="text-xs font-mono-code uppercase font-semibold text-[#86EFAC] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                Evidence-Based Opportunities & Advantages
              </span>
              <ul className="space-y-1.5 text-xs font-mono-code text-[#C9D1C2]">
                {(activeStrategy.evidenceBasedOpportunities || []).map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#22C55E]">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks & Vulnerabilities */}
            <div className="p-4 rounded-sm bg-[#120D0E] border border-[#3E1F24] space-y-2.5">
              <span className="text-xs font-mono-code uppercase font-semibold text-[#FCA5A5] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
                Potential Risks & Vulnerabilities (Red-Team Factored)
              </span>
              <ul className="space-y-1.5 text-xs font-mono-code text-[#D9C3C6]">
                {activeStrategy.risksAndVulnerabilities.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#EF4444]">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Assumptions vs Validation Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assumptions */}
            <div className="p-4 rounded-sm bg-[#0E1015] border border-[#222734] space-y-2.5">
              <span className="text-xs font-mono-code uppercase font-semibold text-[#CBD0DC] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#CCFF00]" />
                Critical Underlying Assumptions
              </span>
              <ul className="space-y-1.5 text-xs font-mono-code text-[#9EA6B6]">
                {activeStrategy.underlyingAssumptions.map((assump, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#CCFF00]">•</span>
                    <span>{assump}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Validation Steps */}
            <div className="p-4 rounded-sm bg-[#0E1015] border border-[#222734] space-y-2.5">
              <span className="text-xs font-mono-code uppercase font-semibold text-[#CBD0DC] flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-[#38BDF8]" />
                Recommended Validation Steps
              </span>
              <ul className="space-y-1.5 text-xs font-mono-code text-[#9EA6B6]">
                {activeStrategy.recommendedValidationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#38BDF8]">→</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Messaging & Creative Direction */}
          {(activeStrategy.suggestedMessaging || activeStrategy.creativeDirection) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono-code p-4 rounded bg-[#090A0E] border border-[#1A1F2C]">
              {activeStrategy.suggestedMessaging && (
                <div className="space-y-1">
                  <span className="text-[#6D7586] uppercase tracking-wider text-[10px] block">
                    SUGGESTED MESSAGING HOOK:
                  </span>
                  <p className="text-[#CCFF00] font-medium italic">
                    "{activeStrategy.suggestedMessaging}"
                  </p>
                </div>
              )}
              {activeStrategy.creativeDirection && (
                <div className="space-y-1">
                  <span className="text-[#6D7586] uppercase tracking-wider text-[10px] block">
                    CREATIVE DIRECTION:
                  </span>
                  <p className="text-[#CBD0DC]">
                    {activeStrategy.creativeDirection}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cultural Allies & Aesthetic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#1C202C] text-xs font-mono-code">
            <div className="space-y-1.5">
              <span className="text-[#6D7586] uppercase tracking-wider text-[10px] block">
                COLLABORATIVE BRAND ALLIES (QLOO GROUNDED):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeStrategy.keyBrandAllies.map((brand, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xs bg-[#141720] border border-[#232938] text-[#CCFF00]"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[#6D7586] uppercase tracking-wider text-[10px] block">
                MATERIAL & CULTURAL AESTHETIC:
              </span>
              <p className="text-[#B9C0CF] italic leading-relaxed">
                {activeStrategy.culturalAesthetic}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal: Revised Launch Brief */}
      {isBriefModalOpen && revisedBriefData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-sm bg-[#0E1015] border border-[#262C3E] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202532]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#CCFF00]" />
                <h4 className="text-sm font-semibold text-[#F4F3EF] uppercase tracking-wider font-editorial">
                  Revised Launch Brief: {revisedBriefData.selectedArchetype}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsBriefModalOpen(false)}
                className="text-[#6D7586] hover:text-[#ECEBE6] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono-code text-xs text-[#CBD0DC]">
              <div className="p-3.5 rounded bg-[#090A0E] border border-[#1A1F2C] space-y-1">
                <span className="text-[10px] text-[#6D7586] uppercase block">Revised Positioning Statement</span>
                <p className="text-sm font-semibold text-[#CCFF00]">"{revisedBriefData.revisedTagline}"</p>
                <p className="text-xs text-[#D8DCE5] leading-relaxed mt-1">{revisedBriefData.revisedPositioning}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded bg-[#090A0E] border border-[#1A1F2C]">
                  <span className="text-[10px] text-[#6D7586] uppercase block">Target Audience Cohort</span>
                  <p className="text-xs text-[#D8DCE5] mt-0.5">{revisedBriefData.targetAudience}</p>
                </div>
                <div className="p-3 rounded bg-[#090A0E] border border-[#1A1F2C]">
                  <span className="text-[10px] text-[#6D7586] uppercase block">Primary Market Territory</span>
                  <p className="text-xs text-[#CCFF00] font-semibold mt-0.5">{revisedBriefData.primaryMarket}</p>
                </div>
              </div>

              <div className="p-3.5 rounded bg-[#090A0E] border border-[#1A1F2C] space-y-1.5">
                <span className="text-[10px] text-[#6D7586] uppercase block">Immediate Launch Execution Action</span>
                <p className="text-xs text-[#D8DCE5]">{revisedBriefData.immediateLaunchAction}</p>
              </div>

              <div className="p-3.5 rounded bg-[#090A0E] border border-[#1A1F2C] space-y-1">
                <span className="text-[10px] text-[#6D7586] uppercase block">Strategic Brand Allies</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(revisedBriefData.brandAllies || []).map((b: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-xs bg-[#141720] border border-[#232938] text-[#CCFF00] text-[11px]">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#202532]">
              <button
                type="button"
                onClick={copyBriefToClipboard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xs border border-[#242A3B] text-[#ECEBE6] hover:bg-[#151922] transition-colors font-mono-code text-xs font-semibold"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied Brief' : 'Copy Launch Brief'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBriefModalOpen(false)}
                className="px-4 py-2 rounded-xs bg-[#CCFF00] hover:bg-[#B8E600] text-black font-mono-code text-xs font-semibold transition-all shadow-[0_0_12px_rgba(204,255,0,0.15)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

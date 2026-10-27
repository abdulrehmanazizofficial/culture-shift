import React, { useState } from 'react';
import {
  FlaskConical,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Plus,
  X,
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react';
import { CulturalExperiment, VerifiedClaim } from '../types';

interface CulturalExperimentDesignerProps {
  experiments: CulturalExperiment[];
  claims?: VerifiedClaim[];
  onAddCustomExperiment?: (exp: CulturalExperiment) => void;
}

export const CulturalExperimentDesigner: React.FC<CulturalExperimentDesignerProps> = ({
  experiments = [],
  claims = [],
  onAddCustomExperiment,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedExpId, setSelectedExpId] = useState<string | null>(experiments[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom experiment form state
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState<'ab_test' | 'customer_interviews' | 'concept_survey' | 'creative_test' | 'market_validation'>('ab_test');
  const [customHypothesis, setCustomHypothesis] = useState('');
  const [customComparison, setCustomComparison] = useState('');
  const [customParticipants, setCustomParticipants] = useState('');
  const [customMeasurement, setCustomMeasurement] = useState('');
  const [customSuccess, setCustomSuccess] = useState('');

  const filteredExperiments = filterType === 'all'
    ? experiments
    : experiments.filter(e => e.experimentType === filterType);

  const activeExp = experiments.find(e => e.id === selectedExpId) || experiments[0];

  const getExperimentTypeLabel = (type: string) => {
    switch (type) {
      case 'ab_test':
        return { label: 'A/B Messaging Test', color: 'text-[#38BDF8] bg-[#0C1E2E] border-[#1E3B5C]' };
      case 'customer_interviews':
        return { label: 'Depth Interviews', color: 'text-[#A78BFA] bg-[#1E1430] border-[#3B2860]' };
      case 'concept_survey':
        return { label: 'Concept Survey', color: 'text-[#FBBF24] bg-[#261B0A] border-[#4D3614]' };
      case 'creative_test':
        return { label: 'Creative Direction Test', color: 'text-[#F472B6] bg-[#280F1D] border-[#531E3D]' };
      case 'market_validation':
        return { label: 'Localized Residency Test', color: 'text-[#4ADE80] bg-[#0E2316] border-[#1D4A2F]' };
      default:
        return { label: type, color: 'text-[#CCFF00] bg-[#1B210B] border-[#3E4D15]' };
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customHypothesis.trim()) return;

    const newExp: CulturalExperiment = {
      id: `EXP-CUST-${Date.now().toString().slice(-4)}`,
      title: customTitle.trim(),
      experimentType: customType,
      hypothesis: customHypothesis.trim(),
      whatIsBeingCompared: customComparison.trim() || 'Custom variant comparison',
      targetParticipants: customParticipants.trim() || 'Verified cohort members',
      measurementMethod: customMeasurement.trim() || 'Direct empirical observation',
      successCriteria: customSuccess.trim() || 'Statistically significant delta',
      potentialConfoundingFactors: [
        'Sample selection bias',
        'Cohort novelty effect',
      ],
      conclusionsSupported: 'Validates tactical hypothesis under controlled test parameters.',
      conclusionsNotSupported: 'Does not guarantee nationwide unprompted demand.',
    };

    if (onAddCustomExperiment) {
      onAddCustomExperiment(newExp);
    }
    setIsModalOpen(false);
    setSelectedExpId(newExp.id);
    // Reset form
    setCustomTitle('');
    setCustomHypothesis('');
    setCustomComparison('');
    setCustomParticipants('');
    setCustomMeasurement('');
    setCustomSuccess('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-sm bg-[#0E1015] border border-[#202532] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#CCFF00]" />
            <h3 className="font-editorial text-lg text-[#F4F3EF] uppercase tracking-wider font-semibold">
              Cultural Experiment Designer
            </h3>
          </div>
          <p className="text-xs text-[#7F8697] mt-1">
            Converts unverified positioning hypotheses into pre-launch empirical experiments with falsifiable criteria
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Filter dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#13161F] border border-[#242A3B] text-xs font-mono-code text-[#CBD0DC]">
            <Filter className="w-3.5 h-3.5 text-[#6D7586]" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-transparent border-none text-[#ECEBE6] text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#13161F]">All Experiment Types ({experiments.length})</option>
              <option value="ab_test" className="bg-[#13161F]">A/B Messaging Tests</option>
              <option value="customer_interviews" className="bg-[#13161F]">Depth Interviews</option>
              <option value="market_validation" className="bg-[#13161F]">Market Validation Residencies</option>
              <option value="concept_survey" className="bg-[#13161F]">Concept Surveys</option>
              <option value="creative_test" className="bg-[#13161F]">Creative Tests</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#CCFF00] hover:bg-[#B8E600] text-black font-mono-code text-xs font-semibold transition-all shadow-[0_0_12px_rgba(204,255,0,0.15)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Design Custom Experiment</span>
          </button>
        </div>
      </div>

      {/* Grid: Experiment Cards & Detailed Protocol View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Experiment List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[11px] font-mono-code text-[#737A8C] uppercase tracking-wider block font-medium">
            Generated Validation Protocols ({filteredExperiments.length})
          </span>

          <div className="space-y-2.5">
            {filteredExperiments.map(exp => {
              const typeBadge = getExperimentTypeLabel(exp.experimentType);
              const isSelected = activeExp?.id === exp.id;
              return (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => setSelectedExpId(exp.id)}
                  className={`w-full text-left p-4 rounded-sm border transition-all ${
                    isSelected
                      ? 'bg-[#151922] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.08)]'
                      : 'bg-[#0E1015] border-[#222734] hover:border-[#353D4E]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 font-mono-code text-[10px]">
                    <span className="text-[#6D7586]">{exp.id}</span>
                    <span className={`px-2 py-0.5 rounded-xs border font-medium ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#F4F3EF] font-editorial mb-1.5 line-clamp-1">
                    {exp.title}
                  </h4>
                  <p className="text-[11px] text-[#868E9F] font-mono-code line-clamp-2 leading-relaxed">
                    {exp.hypothesis}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Experiment Protocol Specification */}
        <div className="lg:col-span-7">
          {activeExp ? (
            <div className="p-6 rounded-sm bg-[#0E1015] border border-[#202532] space-y-5 animate-in fade-in duration-150">
              {/* Header */}
              <div className="pb-4 border-b border-[#1E2330]">
                <div className="flex items-center justify-between gap-2 font-mono-code text-[10px] mb-1.5">
                  <span className="text-[#CCFF00] font-semibold">// EXPERIMENT BLUEPRINT</span>
                  <span className={`px-2 py-0.5 rounded-xs border font-medium ${getExperimentTypeLabel(activeExp.experimentType).color}`}>
                    {getExperimentTypeLabel(activeExp.experimentType).label}
                  </span>
                </div>
                <h4 className="text-lg font-editorial text-[#F4F3EF] font-semibold">
                  {activeExp.title}
                </h4>
              </div>

              {/* Hypothesis & Comparison */}
              <div className="space-y-3 font-mono-code text-xs">
                <div className="p-3.5 rounded bg-[#090A0E] border border-[#1A1F2A] space-y-1">
                  <span className="text-[10px] text-[#6D7586] uppercase tracking-wider block">
                    FALSIFIABLE HYPOTHESIS:
                  </span>
                  <p className="text-[#D8DCE5] leading-relaxed">
                    "{activeExp.hypothesis}"
                  </p>
                </div>

                <div className="p-3.5 rounded bg-[#090A0E] border border-[#1A1F2A] space-y-1">
                  <span className="text-[10px] text-[#6D7586] uppercase tracking-wider block">
                    WHAT IS BEING COMPARED / VARIANT SETUP:
                  </span>
                  <p className="text-[#CBD0DC] leading-relaxed">
                    {activeExp.whatIsBeingCompared}
                  </p>
                </div>
              </div>

              {/* Target Cohort & Measurement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono-code text-xs">
                <div className="p-3.5 rounded bg-[#0B0D12] border border-[#1E2330] space-y-1">
                  <span className="text-[10px] text-[#6D7586] uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-[#38BDF8]" />
                    TARGET PARTICIPANTS:
                  </span>
                  <p className="text-[#CBD0DC]">
                    {activeExp.targetParticipants}
                  </p>
                </div>

                <div className="p-3.5 rounded bg-[#0B0D12] border border-[#1E2330] space-y-1">
                  <span className="text-[10px] text-[#6D7586] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-[#CCFF00]" />
                    MEASUREMENT METHOD:
                  </span>
                  <p className="text-[#CBD0DC]">
                    {activeExp.measurementMethod}
                  </p>
                </div>
              </div>

              {/* Pre-Defined Success Criteria */}
              <div className="p-4 rounded-sm bg-[#0C1510] border border-[#1D3B26] space-y-1.5 font-mono-code text-xs">
                <span className="text-xs font-semibold text-[#86EFAC] flex items-center gap-1.5 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  SUCCESS CRITERIA (DEFINED BEFORE TESTING):
                </span>
                <p className="text-[#D1E0D5] leading-relaxed">
                  {activeExp.successCriteria}
                </p>
              </div>

              {/* Confounding Factors */}
              {activeExp.potentialConfoundingFactors && activeExp.potentialConfoundingFactors.length > 0 && (
                <div className="p-4 rounded-sm bg-[#15100E] border border-[#3E2519] space-y-2 font-mono-code text-xs">
                  <span className="text-xs font-semibold text-[#FDBA74] flex items-center gap-1.5 uppercase">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F97316]" />
                    POTENTIAL CONFOUNDING FACTORS:
                  </span>
                  <ul className="space-y-1 text-[#E0CFC6]">
                    {activeExp.potentialConfoundingFactors.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#F97316]">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Supported vs Unsupported Conclusions (Methodological boundaries) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-[#1C202C] font-mono-code text-[11px]">
                <div className="space-y-1 text-[#4ADE80]">
                  <span className="text-[10px] uppercase tracking-wider text-[#6D7586] block">
                    CONCLUSIONS RESULTS CAN SUPPORT:
                  </span>
                  <p className="leading-relaxed">
                    {activeExp.conclusionsSupported}
                  </p>
                </div>

                <div className="space-y-1 text-[#F87171]">
                  <span className="text-[10px] uppercase tracking-wider text-[#6D7586] block">
                    CONCLUSIONS RESULTS CANNOT SUPPORT:
                  </span>
                  <p className="leading-relaxed">
                    {activeExp.conclusionsNotSupported}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-sm bg-[#0E1015] border border-[#202532] text-center text-xs font-mono-code text-[#737A8C]">
              Select an experiment protocol from the left to view detailed execution parameters.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Design Custom Validation Experiment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl p-6 rounded-sm bg-[#0E1015] border border-[#262C3E] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#202532]">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#CCFF00]" />
                <h4 className="text-sm font-semibold text-[#F4F3EF] uppercase tracking-wider font-editorial">
                  Design Custom Validation Experiment
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#6D7586] hover:text-[#ECEBE6] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-3.5 font-mono-code text-xs">
              <div>
                <label className="text-[10px] text-[#7E8698] uppercase block mb-1">
                  Experiment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Waitlist Copy Resonance Test"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xs bg-[#090A0E] border border-[#232938] text-[#ECEBE6] focus:border-[#CCFF00] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#7E8698] uppercase block mb-1">
                  Experiment Type
                </label>
                <select
                  value={customType}
                  onChange={e => setCustomType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xs bg-[#090A0E] border border-[#232938] text-[#ECEBE6] focus:border-[#CCFF00] focus:outline-hidden cursor-pointer"
                >
                  <option value="ab_test">A/B Messaging Test</option>
                  <option value="customer_interviews">Customer In-Depth Interviews</option>
                  <option value="concept_survey">Concept Testing Survey</option>
                  <option value="creative_test">Alternative Creative Direction Test</option>
                  <option value="market_validation">Market-Specific Localized Validation</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#7E8698] uppercase block mb-1">
                  Falsifiable Hypothesis
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Positioning as an instrument will yield higher engagement than productivity utility..."
                  value={customHypothesis}
                  onChange={e => setCustomHypothesis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xs bg-[#090A0E] border border-[#232938] text-[#ECEBE6] focus:border-[#CCFF00] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#7E8698] uppercase block mb-1">
                    What is Being Compared
                  </label>
                  <input
                    type="text"
                    placeholder="Variant A vs Variant B"
                    value={customComparison}
                    onChange={e => setCustomComparison(e.target.value)}
                    className="w-full px-3 py-2 rounded-xs bg-[#090A0E] border border-[#232938] text-[#ECEBE6] focus:border-[#CCFF00] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#7E8698] uppercase block mb-1">
                    Target Participants
                  </label>
                  <input
                    type="text"
                    placeholder="50 design professionals"
                    value={customParticipants}
                    onChange={e => setCustomParticipants(e.target.value)}
                    className="w-full px-3 py-2 rounded-xs bg-[#090A0E] border border-[#232938] text-[#ECEBE6] focus:border-[#CCFF00] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#7E8698] uppercase block mb-1">
                    Measurement Method
                  </label>
                  <input
                    type="text"
                    placeholder="Waitlist conversion & time on page"
                    value={customMeasurement}
                    onChange={e => setCustomMeasurement(e.target.value)}
                    className="w-full px-3 py-2 rounded-xs bg-[#090A0E] border border-[#232938] text-[#ECEBE6] focus:border-[#CCFF00] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#7E8698] uppercase block mb-1">
                    Pre-Defined Success Criteria
                  </label>
                  <input
                    type="text"
                    placeholder=">= 30% lift in signup rate"
                    value={customSuccess}
                    onChange={e => setCustomSuccess(e.target.value)}
                    className="w-full px-3 py-2 rounded-xs bg-[#090A0E] border border-[#232938] text-[#ECEBE6] focus:border-[#CCFF00] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#202532]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xs border border-[#242A3B] text-[#8991A2] hover:text-[#ECEBE6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xs bg-[#CCFF00] hover:bg-[#B8E600] text-black font-semibold transition-all shadow-[0_0_12px_rgba(204,255,0,0.15)]"
                >
                  Save Experiment Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

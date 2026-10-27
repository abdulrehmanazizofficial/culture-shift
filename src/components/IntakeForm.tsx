import React, { useState } from 'react';
import { ArrowRight, Sparkles, AlertCircle, X, ShieldAlert, SlidersHorizontal, Globe, Target, Plus, Search, Tag, Layers, CheckCircle2, Building2 } from 'lucide-react';
import { AnalysisInput, ApiStatus, LaunchObjective, QlooEntity } from '../types';
import { PRESET_BRIEFS, PresetBrief } from '../data/presets';
import { EntitySearchLookup } from './EntitySearchLookup';

const POPULAR_MARKETS = [
  'Tokyo',
  'London',
  'New York',
  'San Francisco',
  'Berlin',
  'Austin',
  'Paris',
  'Seoul',
];

const OBJECTIVES: Array<{ id: LaunchObjective; label: string; desc: string }> = [
  {
    id: 'cult_status',
    label: 'Cult & Subcultural Gravity',
    desc: 'Deep brand devotion and organic tastemaker advocacy',
  },
  {
    id: 'category_creation',
    label: 'Category Creation',
    desc: 'Define a novel behavioral or product paradigm',
  },
  {
    id: 'brand_awareness',
    label: 'Broad Cultural Reach',
    desc: 'Cross-domain relevance across mainstream cultural nodes',
  },
  {
    id: 'high_velocity_sales',
    label: 'High-Velocity Conversion',
    desc: 'Frictionless positioning optimized for rapid adoption',
  },
  {
    id: 'counter_cultural',
    label: 'Counter-Cultural Disruption',
    desc: 'Challenging bloated incumbents with subversive craft',
  },
];

interface IntakeFormProps {
  onSubmit: (input: AnalysisInput) => void;
  isLoading: boolean;
  apiStatus: ApiStatus;
  onOpenConfig: () => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({
  onSubmit,
  isLoading,
  apiStatus,
  onOpenConfig,
}) => {
  // Pre-load Kinetic Brew preset by default to match screenshot exactly
  const [formData, setFormData] = useState<AnalysisInput>({
    productName: 'Kinetic Brew',
    category: 'Functional beverage',
    description: 'A cold-extracted, single-origin botanical nootropic beverage designed to provide sustained cognitive flow state without jitter or crash, packaged in matte smoked glass.',
    targetMarkets: ['Tokyo', 'London'],
    primaryMarket: 'Tokyo',
    targetAudience: 'Design-minded founders and creative professionals, software engineers, and digital curators (ages 24-40).',
    proposedPositioning: 'Positioned as an elite bio-computational cognitive enhancer for deep work and high-output creative sprints.',
    launchObjective: 'cult_status',
    seedKeywords: ['Blue Bottle', 'Monocle', 'Aesop'],
    resolvedSeedEntities: [
      { id: 'blue-bottle', name: 'Blue Bottle Coffee', category: 'Coffee & Cafes', type: 'brand' },
      { id: 'monocle', name: 'Monocle', category: 'Publishing & Media', type: 'media' },
      { id: 'aesop', name: 'Aesop', category: 'Skincare & Design', type: 'brand' },
    ],
  });

  const [marketInput, setMarketInput] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>('Kinetic Brew');
  const [showEntityExplorer, setShowEntityExplorer] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const applyPreset = (preset: PresetBrief) => {
    setActivePreset(preset.productName);
    setFormData({
      productName: preset.productName,
      category: preset.category,
      description: preset.description,
      targetMarkets: preset.targetMarkets || ['Tokyo', 'London'],
      primaryMarket: preset.primaryMarket || preset.targetMarkets?.[0] || 'Tokyo',
      targetAudience: preset.targetAudience,
      proposedPositioning: preset.proposedPositioning,
      launchObjective: preset.launchObjective || 'cult_status',
      seedKeywords: preset.seedKeywords || [],
      resolvedSeedEntities: [],
    });
    setValidationErrors({});
  };

  const addMarket = (market: string) => {
    const trimmed = market.trim();
    if (!trimmed) return;
    if (!formData.targetMarkets.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        targetMarkets: [...prev.targetMarkets, trimmed],
        primaryMarket: prev.primaryMarket || trimmed,
      }));
    }
    setMarketInput('');
  };

  const removeMarket = (market: string) => {
    setFormData(prev => {
      const remaining = prev.targetMarkets.filter(m => m !== market);
      return {
        ...prev,
        targetMarkets: remaining,
        primaryMarket: prev.primaryMarket === market ? remaining[0] || '' : prev.primaryMarket,
      };
    });
  };

  const handleEntitySelect = (entity: QlooEntity) => {
    setFormData(prev => {
      const existing = prev.resolvedSeedEntities || [];
      const alreadyExists = existing.some(e => e.id === entity.id);
      if (alreadyExists) {
        return {
          ...prev,
          resolvedSeedEntities: existing.filter(e => e.id !== entity.id),
        };
      }
      return {
        ...prev,
        resolvedSeedEntities: [...existing, entity],
      };
    });
  };

  const removeSeedEntity = (id: string) => {
    setFormData(prev => ({
      ...prev,
      resolvedSeedEntities: (prev.resolvedSeedEntities || []).filter(e => e.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.productName.trim()) errors.productName = 'Product name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.description.trim()) errors.description = 'Product description is required';
    if (!formData.targetMarkets || formData.targetMarkets.length === 0) {
      errors.targetMarkets = 'At least one target market is required';
    }
    if (!formData.targetAudience.trim()) errors.targetAudience = 'Audience persona description is required';
    if (!formData.proposedPositioning.trim()) errors.proposedPositioning = 'Proposed positioning angle is required';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onSubmit(formData);
  };

  const pipelineSteps = [
    { num: '01', title: 'Market context', desc: 'Analyze brief & audience', icon: Tag },
    { num: '02', title: 'Qloo research', desc: 'Retrieve cultural intelligence', icon: Layers },
    { num: '03', title: 'Red-team review', desc: 'Challenge assumptions', icon: ShieldAlert },
    { num: '04', title: 'Strategy synthesis', desc: 'Generate alternatives', icon: Sparkles },
    { num: '05', title: 'Evidence verification', desc: 'Validate & compile report', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Editorial Header & Step Indicator */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E2DFD6] pb-6">
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-widest text-[#52524E]">
            AI CULTURAL LAUNCH SIMULATOR
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#0F0F0E] tracking-tight font-normal">
            Stress-test your next launch.
          </h1>
          <p className="text-sm text-[#52524E] max-w-xl">
            Cultural intelligence for sharper product positioning.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Preset Buttons quick bar */}
          <div className="hidden xl:flex items-center gap-1.5 bg-[#F3F1EA] p-1 rounded-sm border border-[#E2DFD6]">
            <span className="text-[10px] font-mono px-2 text-[#71716A]">PRESET:</span>
            {PRESET_BRIEFS.map(p => (
              <button
                key={p.productName}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-2.5 py-1 text-xs font-mono rounded-sm transition-colors ${
                  activePreset === p.productName
                    ? 'bg-white text-[#0F0F0E] font-medium shadow-sm'
                    : 'text-[#52524E] hover:text-[#0F0F0E]'
                }`}
              >
                {p.productName}
              </button>
            ))}
          </div>
          <div className="text-xs font-mono text-[#52524E] border border-[#E2DFD6] px-3 py-1.5 rounded-sm bg-white shadow-sm">
            01 / LAUNCH BRIEF
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Form on Left, Pipeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Intake Form Card */}
        <div className="lg:col-span-8 bg-white border border-[#E2DFD6] rounded-lg p-6 lg:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                  Product Name <span className="text-[#16A34A]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#82827B]">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Kinetic Brew"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-[#FAF9F5] border rounded-sm text-[#0F0F0E] placeholder:text-[#82827B] focus:outline-none transition-colors ${
                      validationErrors.productName
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[#E2DFD6] focus:border-[#0F0F0E]'
                    }`}
                  />
                </div>
                {validationErrors.productName && (
                  <span className="text-[11px] font-mono text-red-600">
                    {validationErrors.productName}
                  </span>
                )}
              </div>

              {/* Industry & Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                  Industry & Category <span className="text-[#16A34A]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#82827B]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Functional beverage"
                    className={`w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-[#FAF9F5] border rounded-sm text-[#0F0F0E] placeholder:text-[#82827B] focus:outline-none transition-colors ${
                      validationErrors.category
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[#E2DFD6] focus:border-[#0F0F0E]'
                    }`}
                  />
                </div>
                {validationErrors.category && (
                  <span className="text-[11px] font-mono text-red-600">
                    {validationErrors.category}
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                Product Description & Value Proposition <span className="text-[#16A34A]">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-[#82827B]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what the product does, its tangible materials, hardware/software mechanics, and core appeal..."
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-[#FAF9F5] border rounded-sm text-[#0F0F0E] placeholder:text-[#82827B] focus:outline-none transition-colors leading-relaxed ${
                    validationErrors.description
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[#E2DFD6] focus:border-[#0F0F0E]'
                  }`}
                />
              </div>
              {validationErrors.description && (
                <span className="text-[11px] font-mono text-red-600">
                  {validationErrors.description}
                </span>
              )}
            </div>

            {/* Target Markets */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                Target Markets For Cross-Market Comparison <span className="text-[#16A34A]">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 bg-[#FAF9F5] border border-[#E2DFD6] rounded-sm min-h-[48px]">
                {formData.targetMarkets.map((market, idx) => {
                  const isPrimary = formData.primaryMarket === market;
                  return (
                    <span
                      key={market}
                      onClick={() => setFormData({ ...formData, primaryMarket: market })}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-sm cursor-pointer transition-all border ${
                        isPrimary
                          ? 'bg-[#16A34A] text-white border-[#15803D]'
                          : 'bg-white text-[#0F0F0E] border-[#E2DFD6] hover:border-[#C8C3B8]'
                      }`}
                      title="Click to set as primary comparison market"
                    >
                      <span className="font-medium">{market}</span>
                      {isPrimary && (
                        <span className="text-[9px] uppercase tracking-wider bg-black/20 px-1 rounded">
                          PRIMARY
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          removeMarket(market);
                        }}
                        className="hover:opacity-75 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}

                <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                  <input
                    type="text"
                    value={marketInput}
                    onChange={e => setMarketInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMarket(marketInput);
                      }
                    }}
                    placeholder="+ Add market..."
                    className="w-full bg-transparent text-xs font-mono px-2 py-1 text-[#0F0F0E] placeholder:text-[#82827B] focus:outline-none"
                  />
                  {marketInput.trim() && (
                    <button
                      type="button"
                      onClick={() => addMarket(marketInput)}
                      className="px-2 py-1 text-xs font-mono bg-[#0F0F0E] text-white rounded-sm hover:bg-black"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Suggested creative hubs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono text-[#52524E]">
                <span>Suggested Creative Hubs:</span>
                {POPULAR_MARKETS.filter(m => !formData.targetMarkets.includes(m)).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => addMarket(m)}
                    className="px-2 py-0.5 rounded bg-[#F3F1EA] text-[#52524E] border border-[#E2DFD6] hover:text-[#0F0F0E] hover:border-[#C8C3B8] transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience & Launch Objective */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                  Target Audience Persona <span className="text-[#16A34A]">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.targetAudience}
                  onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="Design-minded founders and creative professionals..."
                  className={`w-full px-3.5 py-2.5 text-xs font-mono bg-[#FAF9F5] border rounded-sm text-[#0F0F0E] placeholder:text-[#82827B] focus:outline-none transition-colors ${
                    validationErrors.targetAudience
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[#E2DFD6] focus:border-[#0F0F0E]'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                  Launch Objective <span className="text-[#16A34A]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.launchObjective}
                    onChange={e => setFormData({ ...formData, launchObjective: e.target.value as LaunchObjective })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#FAF9F5] border border-[#E2DFD6] rounded-sm text-[#0F0F0E] focus:outline-none focus:border-[#0F0F0E] appearance-none"
                  >
                    {OBJECTIVES.map(obj => (
                      <option key={obj.id} value={obj.id} className="bg-white text-[#0F0F0E]">
                        {obj.label} — {obj.desc}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-[#52524E] font-mono">
                  {OBJECTIVES.find(o => o.id === formData.launchObjective)?.desc}
                </p>
              </div>
            </div>

            {/* Proposed Positioning Angle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                Proposed Positioning Angle (Hypothesis To Stress-Test) <span className="text-[#16A34A]">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.proposedPositioning}
                onChange={e => setFormData({ ...formData, proposedPositioning: e.target.value })}
                placeholder="Positioned as an elite bio-computational cognitive enhancer for deep work and high-output creative sprints..."
                className={`w-full px-3.5 py-2.5 text-xs font-mono bg-[#FAF9F5] border rounded-sm text-[#0F0F0E] placeholder:text-[#82827B] focus:outline-none transition-colors ${
                  validationErrors.proposedPositioning
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#E2DFD6] focus:border-[#0F0F0E]'
                }`}
              />
            </div>

            {/* Cultural Seed Anchors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#52524E]">
                  Cultural Seed Anchors (Qloo Search)
                </label>
                <button
                  type="button"
                  onClick={() => setShowEntityExplorer(true)}
                  className="flex items-center gap-1.5 text-xs font-mono text-[#16A34A] hover:text-[#15803D] transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Explore entities</span>
                </button>
              </div>
              <p className="text-[11px] text-[#52524E]">
                Ground the analysis in cultural entities (brands, artists, media, places) retrieved from Qloo.
              </p>

              <div className="flex flex-wrap items-center gap-2 p-2.5 bg-[#FAF9F5] border border-[#E2DFD6] rounded-sm min-h-[46px]">
                {formData.resolvedSeedEntities && formData.resolvedSeedEntities.length > 0 ? (
                  formData.resolvedSeedEntities.map(entity => (
                    <span
                      key={entity.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-white text-[#0F0F0E] border border-[#E2DFD6] rounded-sm shadow-sm"
                    >
                      <span>{entity.name}</span>
                      <span className="text-[10px] text-[#82827B]">({entity.category || entity.type})</span>
                      <button
                        type="button"
                        onClick={() => removeSeedEntity(entity.id)}
                        className="hover:text-red-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-mono text-[#82827B] italic">
                    No cultural anchors selected. Click "Explore entities" to query Qloo Taste API.
                  </span>
                )}
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="pt-4 border-t border-[#E2DFD6] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#52524E]">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span>Five coordinated stages · Evidence-verified recommendations</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-[#C8F832] hover:bg-[#B8E822] text-[#0F0F0E] font-semibold text-xs font-mono rounded-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-[#0F0F0E]" />
                    <span>Running multi-agent simulation...</span>
                  </>
                ) : (
                  <>
                    <span>Run launch simulation</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Analysis Pipeline Sidebar */}
        <div className="lg:col-span-4 bg-white border border-[#E2DFD6] rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2DFD6]">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0F0F0E]">
              Analysis Pipeline
            </span>
            <span className="text-[10px] font-mono text-[#52524E]">5 STAGES</span>
          </div>

          <div className="space-y-3">
            {pipelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-3 bg-[#FAF9F5] border border-[#E2DFD6] rounded-sm flex items-start gap-3 transition-colors"
                >
                  <div className="p-1.5 rounded bg-white border border-[#E2DFD6] text-[#16A34A] shrink-0 mt-0.5 shadow-sm">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#52524E]">
                      <span>STAGE {step.num}</span>
                      <span className="flex items-center gap-1 text-[#16A34A] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                        Ready to run
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#0F0F0E] mt-0.5">
                      {step.title}
                    </div>
                    <div className="text-[11px] text-[#52524E] leading-snug">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-[#F3F1EA] rounded-sm border border-[#E2DFD6] space-y-1.5 text-xs font-mono text-[#52524E]">
            <div className="font-medium text-[#0F0F0E]">Qloo Taste Graph Engine</div>
            <p className="text-[11px] text-[#52524E] leading-relaxed">
              Live queries evaluate cross-domain affinities and cultural correlation across target markets.
            </p>
          </div>
        </div>
      </div>

      {/* Entity Explorer Modal */}
      {showEntityExplorer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2DFD6] rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DFD6]">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#0F0F0E]">
                Qloo Cultural Entity Explorer
              </span>
              <button
                type="button"
                onClick={() => setShowEntityExplorer(false)}
                className="p-1 text-[#52524E] hover:text-[#0F0F0E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <EntitySearchLookup
              onSelectEntity={handleEntitySelect}
              selectedEntityIds={(formData.resolvedSeedEntities || []).map(e => e.id)}
            />
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEntityExplorer(false)}
                className="px-4 py-2 bg-[#0F0F0E] text-white text-xs font-mono rounded-sm hover:bg-black"
              >
                Done Selecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

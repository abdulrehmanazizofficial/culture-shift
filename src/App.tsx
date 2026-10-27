/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { IntakeForm } from './components/IntakeForm';
import { EvidenceSection } from './components/EvidenceSection';
import { StrategyComparisonLab } from './components/StrategyComparisonLab';
import { RedTeamDossier } from './components/RedTeamDossier';
import { EvidenceAuditReport } from './components/EvidenceAuditReport';
import { CrossMarketComparisonView } from './components/CrossMarketComparisonView';
import { AgentPipelineTracker, AgentStageKey } from './components/AgentPipelineTracker';
import { ApiConfigModal } from './components/ApiConfigModal';
import { ExportDrawer } from './components/ExportDrawer';
import { AnalysisInput, MultiAgentReport, ApiStatus } from './types';
import {
  Sparkles,
  Download,
  RotateCcw,
  AlertCircle,
  Database,
  Layers,
  Compass,
  ArrowRight,
  ShieldAlert,
  Globe,
  FileCheck2,
  Target,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    configured: false,
    maskedKey: null,
    source: 'none',
    verified: false,
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeReport, setActiveReport] = useState<MultiAgentReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<AgentStageKey>('overview');

  useEffect(() => {
    checkHealthAndVerify();
  }, []);

  const checkHealthAndVerify = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiStatus(prev => ({
          ...prev,
          configured: Boolean(data.qloo?.configured),
          maskedKey: data.qloo?.maskedKey || null,
          source: data.qloo?.source || 'none',
        }));

        if (data.qloo?.configured) {
          await runVerificationProbe();
        }
      }
    } catch (err) {
      console.error('Failed to query server health:', err);
    }
  };

  const runVerificationProbe = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/qloo/verify', { method: 'POST' });
      const data = await res.json();
      setApiStatus(prev => ({
        ...prev,
        verified: data.success,
        latencyMs: data.latencyMs,
        requestId: data.requestId,
        lastChecked: new Date().toISOString(),
        error: data.error,
      }));
    } catch (err: unknown) {
      setApiStatus(prev => ({
        ...prev,
        verified: false,
        error: (err as Error).message,
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveKey = async (apiKey: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/qloo/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApiStatus(prev => ({
          ...prev,
          configured: true,
          maskedKey: apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : '****',
          source: 'runtime',
          verified: data.verification?.success,
          latencyMs: data.verification?.latencyMs,
          requestId: data.verification?.requestId,
        }));
        return Boolean(data.verification?.success);
      }
      return false;
    } catch (err) {
      console.error('Failed to configure API key:', err);
      return false;
    }
  };

  const handleRunAnalysis = async (input: AnalysisInput) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error === 'QLOO_KEY_NOT_CONFIGURED') {
          setIsConfigOpen(true);
          throw new Error('Please configure your QLOO_API_KEY in the Settings modal to run live cultural analysis.');
        }
        throw new Error(errorData.error || errorData.message || `Analysis failed with HTTP ${res.status}`);
      }

      const report: MultiAgentReport = await res.json();
      setActiveReport(report);
      setActiveStage('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'An error occurred during cultural analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setActiveReport(null);
    setErrorMessage(null);
  };

  const hasCrossMarket = Boolean(
    activeReport?.crossMarketComparison &&
      activeReport.crossMarketComparison.marketsCompared.length > 1
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#0F0F0E] flex flex-col font-sans selection:bg-[#C8F832] selection:text-black">
      {/* Top Editorial Header */}
      <Header
        apiStatus={apiStatus}
        isVerifying={isVerifying}
        onOpenConfig={() => setIsConfigOpen(true)}
        onNewAnalysis={handleNewAnalysis}
        hasActiveReport={Boolean(activeReport)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-sm bg-[#1F0E0E] border border-[#522020] text-xs font-mono-code text-[#FCA5A5] flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[#B98282] hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {!activeReport ? (
          /* Intake & Setup Stage */
          <IntakeForm
            onSubmit={handleRunAnalysis}
            isLoading={isAnalyzing}
            apiStatus={apiStatus}
            onOpenConfig={() => setIsConfigOpen(true)}
          />
        ) : (
          /* Multi-Agent Analysis Report Stage */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Report Meta Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-sm bg-[#0E1015] border border-[#202532]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#161A24] border border-[#2B3244] text-[#CCFF00] font-semibold">
                    DOSSIER: {activeReport.id}
                  </span>
                  <span className="text-xs font-mono-code text-[#737A8C]">
                    {new Date(activeReport.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#131E15] border border-[#244D29] text-[#4ADE80]">
                    5 AGENTS EXECUTED
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-editorial font-semibold text-[#F4F3EF]">
                  {activeReport.input.productName}
                </h2>
                <p className="text-xs text-[#878E9F] font-mono-code">
                  Markets: <span className="text-[#ECEBE6]">{activeReport.input.targetMarkets.join(', ')}</span> (Primary: {activeReport.input.primaryMarket}) • Category:{' '}
                  <span className="text-[#ECEBE6]">{activeReport.input.category}</span> • Objective:{' '}
                  <span className="text-[#CCFF00]">{activeReport.input.launchObjective}</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 font-mono-code text-xs">
                <button
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="px-3.5 py-2 rounded-sm bg-[#CCFF00] text-black font-semibold hover:bg-[#bbf000] flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(204,255,0,0.15)]"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Export Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleNewAnalysis}
                  className="px-3.5 py-2 rounded-sm bg-[#141720] border border-[#272E3E] text-[#B0B7C6] hover:border-[#3E485E] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Simulation</span>
                </button>
              </div>
            </div>

            {/* Coordinated Multi-Agent Tracker */}
            <AgentPipelineTracker
              activeStage={activeStage}
              onSelectStage={setActiveStage}
              hasCrossMarket={hasCrossMarket}
            />

            {/* Stage Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#202532] font-mono-code text-xs">
              <button
                type="button"
                onClick={() => setActiveStage('overview')}
                className={`px-3 py-2 rounded-t-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeStage === 'overview'
                    ? 'border-[#CCFF00] text-[#CCFF00] bg-[#12151D]'
                    : 'border-transparent text-[#7F8697] hover:text-[#CCD1DC]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Executive Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('strategyArchitect')}
                className={`px-3 py-2 rounded-t-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeStage === 'strategyArchitect'
                    ? 'border-[#CCFF00] text-[#CCFF00] bg-[#12151D]'
                    : 'border-transparent text-[#7F8697] hover:text-[#CCD1DC]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Strategy Lab</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('redTeam')}
                className={`px-3 py-2 rounded-t-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeStage === 'redTeam'
                    ? 'border-[#CCFF00] text-[#CCFF00] bg-[#12151D]'
                    : 'border-transparent text-[#7F8697] hover:text-[#CCD1DC]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#F87171]" />
                <span>Red-Team Review ({activeReport.stages.redTeam.frictionPoints.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('culturalResearcher')}
                className={`px-3 py-2 rounded-t-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeStage === 'culturalResearcher'
                    ? 'border-[#CCFF00] text-[#CCFF00] bg-[#12151D]'
                    : 'border-transparent text-[#7F8697] hover:text-[#CCD1DC]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Live Qloo Evidence ({activeReport.connectionMetadata.totalEntitiesResolved})</span>
              </button>
              {hasCrossMarket && (
                <button
                  type="button"
                  onClick={() => setActiveStage('crossMarket')}
                  className={`px-3 py-2 rounded-t-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    activeStage === 'crossMarket'
                      ? 'border-[#CCFF00] text-[#CCFF00] bg-[#12151D]'
                      : 'border-transparent text-[#7F8697] hover:text-[#CCD1DC]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Cross-Market ({activeReport.crossMarketComparison?.marketsCompared.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveStage('evidenceVerifier')}
                className={`px-3 py-2 rounded-t-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeStage === 'evidenceVerifier'
                    ? 'border-[#CCFF00] text-[#CCFF00] bg-[#12151D]'
                    : 'border-transparent text-[#7F8697] hover:text-[#CCD1DC]'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Evidence Audit</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('marketAnalyst')}
                className={`px-3 py-2 rounded-t-sm border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  activeStage === 'marketAnalyst'
                    ? 'border-[#CCFF00] text-[#CCFF00] bg-[#12151D]'
                    : 'border-transparent text-[#7F8697] hover:text-[#CCD1DC]'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Market Brief</span>
              </button>
            </div>

            {/* Active View Content */}
            {activeStage === 'overview' && (
              <div className="space-y-8">
                {/* Executive Verdict Banner */}
                <div className="p-6 rounded-sm bg-[#0E1015] border border-[#202532] space-y-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <span className="text-[10px] font-mono-code uppercase tracking-widest text-[#CCFF00]">
                      // MULTI-AGENT LAUNCH EVALUATION
                    </span>
                    <h3 className="font-editorial text-2xl text-[#F4F3EF] font-medium">
                      "{activeReport.stages.redTeam.adversarialVerdict}"
                    </h3>
                    <p className="text-xs font-mono-code text-[#949CB0] leading-relaxed pt-1">
                      {activeReport.stages.strategyArchitect.executiveSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#1C202C] text-xs font-mono-code">
                    <div className="p-3 rounded bg-[#090A0E] border border-[#1A1F29] space-y-1">
                      <span className="text-[#6C7486] text-[10px] uppercase block">GROUNDING CONFIDENCE:</span>
                      <span className="text-[#34D399] font-bold">
                        {activeReport.stages.evidenceVerifier.overallGroundingConfidence}
                      </span>
                    </div>
                    <div className="p-3 rounded bg-[#090A0E] border border-[#1A1F29] space-y-1">
                      <span className="text-[#6C7486] text-[10px] uppercase block">ENTITIES RESOLVED:</span>
                      <span className="text-[#CCFF00] font-bold">
                        {activeReport.connectionMetadata.totalEntitiesResolved} Verified Nodes
                      </span>
                    </div>
                    <div className="p-3 rounded bg-[#090A0E] border border-[#1A1F29] space-y-1">
                      <span className="text-[#6C7486] text-[10px] uppercase block">RECOMMENDED PIVOT:</span>
                      <span className="text-[#ECEBE6] font-medium truncate block">
                        {activeReport.stages.strategyArchitect.strategicDirection}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strategy Lab Snapshot */}
                <StrategyComparisonLab
                  originalPositioning={activeReport.input.proposedPositioning}
                  strategies={activeReport.stages.strategyArchitect.alternativeStrategies}
                  strategicDirection={activeReport.stages.strategyArchitect.strategicDirection}
                />

                {/* Red Team Risk Snapshot */}
                <RedTeamDossier stage={activeReport.stages.redTeam} />
              </div>
            )}

            {activeStage === 'strategyArchitect' && (
              <StrategyComparisonLab
                originalPositioning={activeReport.input.proposedPositioning}
                strategies={activeReport.stages.strategyArchitect.alternativeStrategies}
                strategicDirection={activeReport.stages.strategyArchitect.strategicDirection}
              />
            )}

            {activeStage === 'redTeam' && (
              <RedTeamDossier stage={activeReport.stages.redTeam} />
            )}

            {activeStage === 'culturalResearcher' && (
              <EvidenceSection
                resolvedSeeds={activeReport.stages.culturalResearcher.resolvedSeeds}
                domains={activeReport.stages.culturalResearcher.domains}
                connectionMetadata={activeReport.connectionMetadata}
              />
            )}

            {activeStage === 'crossMarket' && activeReport.crossMarketComparison && (
              <CrossMarketComparisonView
                comparison={activeReport.crossMarketComparison}
                marketPlaces={activeReport.stages.culturalResearcher.marketSpecificPlaces}
              />
            )}

            {activeStage === 'evidenceVerifier' && (
              <EvidenceAuditReport stage={activeReport.stages.evidenceVerifier} />
            )}

            {activeStage === 'marketAnalyst' && (
              <div className="p-6 rounded-sm bg-[#0E1015] border border-[#202532] space-y-6 font-mono-code text-xs">
                <div className="pb-4 border-b border-[#1E2330]">
                  <span className="text-[10px] text-[#CCFF00] uppercase tracking-wider font-semibold">
                    AGENT 01 // MARKET ANALYST DOSSIER
                  </span>
                  <h3 className="font-editorial text-xl text-[#F4F3EF] font-semibold mt-1">
                    Structured Launch Brief Deconstruction
                  </h3>
                  <p className="text-[#949CB0] mt-1">{activeReport.stages.marketAnalyst.summary}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[#6D7586] uppercase tracking-wider block">CORE POSITIONING THESIS:</span>
                  <div className="p-3.5 rounded bg-[#090A0E] border border-[#1A1F29] text-[#D8DCE5]">
                    "{activeReport.stages.marketAnalyst.corePositioningThesis}"
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded bg-[#090A0E] border border-[#1A1F29] space-y-2">
                    <span className="text-[#6D7586] uppercase tracking-wider block">INHERENT STRATEGIC TENSIONS:</span>
                    <ul className="space-y-1.5 text-[#C4C9D5]">
                      {activeReport.stages.marketAnalyst.strategicTensions.map((ten, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#CCFF00]">•</span>
                          <span>{ten}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded bg-[#090A0E] border border-[#1A1F29] space-y-2">
                    <span className="text-[#6D7586] uppercase tracking-wider block">TARGET CULTURAL VECTORS:</span>
                    <ul className="space-y-1.5 text-[#C4C9D5]">
                      {activeReport.stages.marketAnalyst.targetCulturalVectors.map((vec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#34D399]">•</span>
                          <span>{vec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E2DFD6] py-6 px-4 lg:px-8 mt-auto text-xs font-mono text-[#52524E] bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            CULTURESHIFT / QLOO INTELLIGENCE
          </div>
          <div>
            Better decisions. Deeper cultural understanding.
          </div>
        </div>
      </footer>

      {/* Configuration & Diagnostics Modal */}
      <ApiConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        apiStatus={apiStatus}
        onSaveKey={handleSaveKey}
        onVerify={runVerificationProbe}
        isVerifying={isVerifying}
      />

      {/* Structured Report Export Drawer */}
      {activeReport && (
        <ExportDrawer
          report={activeReport}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}

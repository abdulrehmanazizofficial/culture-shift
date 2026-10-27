import React, { useState } from 'react';
import { Download, Copy, Check, FileText, Code2, X } from 'lucide-react';
import { MultiAgentReport } from '../types';

interface ExportDrawerProps {
  report: MultiAgentReport;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDrawer: React.FC<ExportDrawerProps> = ({
  report,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json'>('markdown');

  if (!isOpen) return null;

  const generateMarkdown = () => {
    const markets = (report.input.targetMarkets || [report.input.primaryMarket]).join(', ');
    return `# CULTURESHIFT CULTURAL INTELLIGENCE & LAUNCH STRATEGY DOSSIER
Generated: ${report.timestamp}
Product: ${report.input.productName} (${report.input.category})
Target Markets: ${markets} (Primary: ${report.input.primaryMarket})
Audience: ${report.input.targetAudience}
Launch Objective: ${report.input.launchObjective}

===================================================================
1. MARKET ANALYST STAGE
===================================================================
Summary: ${report.stages.marketAnalyst.summary}
Core Thesis: "${report.stages.marketAnalyst.corePositioningThesis}"

Strategic Tensions:
${report.stages.marketAnalyst.strategicTensions.map(t => `- ${t}`).join('\n')}

Target Cultural Vectors:
${report.stages.marketAnalyst.targetCulturalVectors.map(v => `- ${v}`).join('\n')}

===================================================================
2. CULTURAL RESEARCHER STAGE (Real Qloo Taste AI Evidence)
===================================================================
Resolved Seed Anchors:
${report.stages.culturalResearcher.resolvedSeeds.map(s => `- ${s.name} (${s.type || 'Entity'}, ID: ${s.id})`).join('\n')}

Top Brand Affinities:
${report.stages.culturalResearcher.domains.brands.entities.slice(0, 8).map(e => `- ${e.name} | Affinity: ${e.affinity ? (e.affinity * 100).toFixed(1) + '%' : e.score || 'High'} | URN: ${e.id}`).join('\n')}

Top Sonic & Music Affinities:
${report.stages.culturalResearcher.domains.music.entities.slice(0, 8).map(e => `- ${e.name} | Affinity: ${e.affinity ? (e.affinity * 100).toFixed(1) + '%' : e.score || 'High'} | URN: ${e.id}`).join('\n')}

Top Places & Lifestyle Anchors (${report.input.primaryMarket}):
${report.stages.culturalResearcher.domains.places.entities.slice(0, 8).map(e => `- ${e.name} | Affinity: ${e.affinity ? (e.affinity * 100).toFixed(1) + '%' : e.score || 'High'} | URN: ${e.id}`).join('\n')}

===================================================================
3. RED-TEAM ADVERSARIAL STAGE
===================================================================
Adversarial Verdict: ${report.stages.redTeam.adversarialVerdict}

Critique:
${report.stages.redTeam.adversarialCritique}

Friction Points:
${report.stages.redTeam.frictionPoints.map((f, i) => `
[Risk 0${i + 1}] ${f.riskTitle} [Severity: ${f.severity}]
- Conflict with Observed Taste: ${f.conflictWithObservedTaste}
- Potential Backlash or Apathy: ${f.potentialBacklashOrApathy}
- Stress-Test Scenario: ${f.stressTestScenario}
- Safeguard: ${f.recommendedSafeguard}
`).join('\n')}

===================================================================
4. STRATEGY COMPARISON LAB (Strategy Architect)
===================================================================
Strategic Direction: ${report.stages.strategyArchitect.strategicDirection}

${report.stages.strategyArchitect.alternativeStrategies.map((s, i) => `
[Option 0${i + 1}] ${s.archetype}
Tagline: "${s.tagline}"
Thesis: ${s.coreThesis}
Aesthetic: ${s.culturalAesthetic}
Launch Playbook Step: ${s.launchPlaybookStep}

Advantages:
${s.evidenceBasedOpportunities.map(a => `  + ${a}`).join('\n')}

Risks & Vulnerabilities:
${s.risksAndVulnerabilities.map(r => `  - ${r}`).join('\n')}

Assumptions:
${s.underlyingAssumptions.map(u => `  * ${u}`).join('\n')}

Validation Steps:
${s.recommendedValidationSteps.map(v => `  > ${v}`).join('\n')}
`).join('\n')}

===================================================================
5. EVIDENCE VERIFIER AUDIT REPORT
===================================================================
Audit Verdict: ${report.stages.evidenceVerifier.auditVerdict}
Grounding Confidence: ${report.stages.evidenceVerifier.overallGroundingConfidence}

Verified Claims:
${report.stages.evidenceVerifier.verifiedClaims.map((c, i) => `
[Claim 0${i + 1}] [${c.classification}]
Statement: "${c.claim}"
Reasoning: ${c.reasoning}
Supporting Signals: ${c.supportingQlooEvidence.map(se => `${se.name}${se.affinity ? ` (${(se.affinity * 100).toFixed(0)}%)` : ''}`).join(', ') || 'N/A'}
Limitations: ${c.limitations}
`).join('\n')}

Critical Limitations:
${report.stages.evidenceVerifier.criticalLimitations.map(l => `- ${l}`).join('\n')}
`;
  };

  const handleCopy = async () => {
    const text = exportFormat === 'markdown' ? generateMarkdown() : JSON.stringify(report, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = exportFormat === 'markdown' ? generateMarkdown() : JSON.stringify(report, null, 2);
    const mime = exportFormat === 'markdown' ? 'text/markdown' : 'application/json';
    const ext = exportFormat === 'markdown' ? 'md' : 'json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.input.productName.toLowerCase().replace(/\s+/g, '_')}_cultural_report.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#101217] border border-[#262B37] rounded-sm w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202532] bg-[#141720]">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#CCFF00]" />
            <h3 className="font-editorial text-base text-[#F4F3EF] uppercase tracking-wider font-semibold">
              Export Multi-Agent Dossier
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7E8594] hover:text-[#ECEBE6] p-1 transition-colors"
            aria-label="Close export dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 font-mono-code text-xs">
          {/* Format Selector */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1C202C]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('markdown')}
                className={`px-3 py-1.5 rounded-sm border flex items-center gap-1.5 transition-colors ${
                  exportFormat === 'markdown'
                    ? 'bg-[#181C26] text-[#CCFF00] border-[#374154]'
                    : 'bg-[#0E1015] text-[#818999] border-[#222734] hover:text-[#D1D5E0]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Executive Brief (.md)</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`px-3 py-1.5 rounded-sm border flex items-center gap-1.5 transition-colors ${
                  exportFormat === 'json'
                    ? 'bg-[#181C26] text-[#CCFF00] border-[#374154]'
                    : 'bg-[#0E1015] text-[#818999] border-[#222734] hover:text-[#D1D5E0]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Full JSON Dossier</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-sm border border-[#2A3142] bg-[#151822] text-[#D1D5DF] hover:border-[#CCFF00] hover:text-[#CCFF00] flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-sm bg-[#CCFF00] text-black font-semibold hover:bg-[#bbf000] flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div className="space-y-1">
            <span className="text-[10px] text-[#697082] uppercase">Dossier Preview:</span>
            <pre className="p-4 rounded bg-[#090A0D] border border-[#1A1F29] text-[11px] text-[#A6ADB9] overflow-x-auto max-h-72 leading-relaxed">
              {exportFormat === 'markdown' ? generateMarkdown() : JSON.stringify(report, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#202532] bg-[#12151D] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono-code text-[#A6ABB8] hover:text-[#F4F3EF] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

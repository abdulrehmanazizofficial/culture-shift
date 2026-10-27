import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Filter,
  ArrowRight,
  Info,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  EvidenceVerifierStage,
  EvidenceClassification,
  VerificationStatus,
  VerifiedClaim,
} from '../types';

interface EvidenceAuditReportProps {
  stage: EvidenceVerifierStage;
}

export const EvidenceAuditReport: React.FC<EvidenceAuditReportProps> = ({ stage }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  const auditSummary = stage.integrityAuditSummary;

  const getBadgeStyle = (classification: EvidenceClassification) => {
    switch (classification) {
      case 'OBSERVED_EVIDENCE':
        return {
          bg: 'bg-[#101F14] border-[#1D4A27] text-[#4ADE80]',
          icon: ShieldCheck,
          label: 'OBSERVED EVIDENCE',
          desc: 'Direct empirical observation from Qloo Knowledge Graph',
        };
      case 'SUPPORTED_INTERPRETATION':
        return {
          bg: 'bg-[#181D0E] border-[#3B4A18] text-[#CCFF00]',
          icon: CheckCircle2,
          label: 'SUPPORTED INTERPRETATION',
          desc: 'Reasoned strategic inference grounded in verified Qloo anchors',
        };
      case 'UNVERIFIED_HYPOTHESIS':
        return {
          bg: 'bg-[#1F170E] border-[#4D381A] text-[#FBBF24]',
          icon: AlertCircle,
          label: 'UNVERIFIED HYPOTHESIS',
          desc: 'Plausible thesis requiring empirical market experimentation',
        };
      case 'CONTRADICTED':
        return {
          bg: 'bg-[#220E12] border-[#521E27] text-[#F87171]',
          icon: XCircle,
          label: 'CONTRADICTED',
          desc: 'Conflicts with observed taste behavior or Red-Team risk',
        };
      case 'UNSUPPORTED':
        return {
          bg: 'bg-[#1A1624] border-[#3F2B63] text-[#C084FC]',
          icon: HelpCircle,
          label: 'UNSUPPORTED',
          desc: 'No adequate supporting evidence found in retrieval cache',
        };
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return { label: 'AUDIT PASSED', color: 'text-[#4ADE80] bg-[#0E1F14] border-[#1C4524]' };
      case 'DOWNGRADED':
        return { label: 'DOWNGRADED', color: 'text-[#FBBF24] bg-[#221B0A] border-[#4A3814]' };
      case 'FLAGGED':
        return { label: 'FLAGGED / CAUTION', color: 'text-[#F97316] bg-[#22130A] border-[#4A2614]' };
      case 'CONTRADICTED':
        return { label: 'CONTRADICTED', color: 'text-[#EF4444] bg-[#240C0F] border-[#4D1A20]' };
      case 'UNSUPPORTED':
        return { label: 'UNSUPPORTED', color: 'text-[#A855F7] bg-[#1A0E26] border-[#3D1E5E]' };
    }
  };

  const filteredClaims = activeFilter === 'all'
    ? stage.verifiedClaims
    : stage.verifiedClaims.filter(c => c.classification === activeFilter || c.verificationStatus === activeFilter);

  return (
    <div className="space-y-6">
      {/* Header & Verification Verdict */}
      <div className="p-5 rounded-sm bg-[#0E1015] border border-[#202532] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2330]">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#CCFF00]" />
              <h3 className="font-editorial text-lg text-[#F4F3EF] uppercase tracking-wider font-semibold">
                Evidence Integrity & Verification Engine
              </h3>
            </div>
            <p className="text-xs text-[#7F8697]">
              Dedicated verification layer enforcing 8 automated integrity checks and 5 claim classifications
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#13161F] border border-[#252C3D] text-xs font-mono-code shrink-0">
            <span className="text-[#6D7586]">GROUNDING CONFIDENCE:</span>
            <span
              className={`font-bold ${
                stage.overallGroundingConfidence === 'High'
                  ? 'text-[#34D399]'
                  : stage.overallGroundingConfidence === 'Medium'
                  ? 'text-[#CCFF00]'
                  : 'text-[#F87171]'
              }`}
            >
              {stage.overallGroundingConfidence}
            </span>
          </div>
        </div>

        <p className="text-xs text-[#D8DCE5] font-mono-code leading-relaxed">
          {stage.auditVerdict}
        </p>

        {/* Breakdown counters */}
        {auditSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-[#1C202C] text-xs font-mono-code">
            <div className="p-2.5 rounded bg-[#090A0E] border border-[#1E2433]">
              <span className="text-[10px] text-[#6D7586] block">Observed Evidence</span>
              <span className="text-sm font-semibold text-[#4ADE80]">{auditSummary.observedEvidenceCount}</span>
            </div>
            <div className="p-2.5 rounded bg-[#090A0E] border border-[#1E2433]">
              <span className="text-[10px] text-[#6D7586] block">Supported Interp.</span>
              <span className="text-sm font-semibold text-[#CCFF00]">{auditSummary.supportedInterpretationCount}</span>
            </div>
            <div className="p-2.5 rounded bg-[#090A0E] border border-[#1E2433]">
              <span className="text-[10px] text-[#6D7586] block">Unverified Hyp.</span>
              <span className="text-sm font-semibold text-[#FBBF24]">{auditSummary.unverifiedHypothesisCount}</span>
            </div>
            <div className="p-2.5 rounded bg-[#090A0E] border border-[#1E2433]">
              <span className="text-[10px] text-[#6D7586] block">Contradicted</span>
              <span className="text-sm font-semibold text-[#F87171]">{auditSummary.contradictedCount}</span>
            </div>
            <div className="p-2.5 rounded bg-[#090A0E] border border-[#1E2433]">
              <span className="text-[10px] text-[#6D7586] block">Unsupported</span>
              <span className="text-sm font-semibold text-[#C084FC]">{auditSummary.unsupportedCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* 8 Automated Audit Rules Matrix */}
      {auditSummary?.checksSummary && (
        <div className="p-5 rounded-sm bg-[#0E1015] border border-[#202532] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2330]">
            <span className="text-xs font-mono-code uppercase font-semibold text-[#CCFF00] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Automated Integrity Checks Matrix (8 Platform Rules)
            </span>
            <span className={`text-[10px] font-mono-code px-2 py-0.5 rounded border ${
              auditSummary.overallStatus === 'PASS'
                ? 'bg-[#0E2014] border-[#1D4A27] text-[#4ADE80]'
                : 'bg-[#22130A] border-[#4A2614] text-[#F97316]'
            }`}>
              AUDIT STATUS: {auditSummary.overallStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {auditSummary.checksSummary.map(check => (
              <div
                key={check.ruleId}
                className="p-3 rounded-xs bg-[#090A0E] border border-[#1B202D] space-y-1 font-mono-code text-xs"
              >
                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="text-[#6D7586] truncate">{check.ruleTitle}</span>
                  {check.passed ? (
                    <span className="text-[#4ADE80] flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> PASS
                    </span>
                  ) : (
                    <span className="text-[#F97316] flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3 h-3" /> FLAG ({check.violationsCount})
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#8C94A6] leading-snug line-clamp-2">
                  {check.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claims Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono-code text-xs">
        <span className="text-[#A7ADB9] uppercase tracking-wider font-medium">
          Audited Strategic Claims ({filteredClaims.length} of {stage.verifiedClaims.length})
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-xs border text-[10px] transition-all ${
              activeFilter === 'all'
                ? 'bg-[#181D28] border-[#CCFF00] text-[#CCFF00]'
                : 'bg-[#0E1015] border-[#222734] text-[#767E90] hover:text-[#ECEBE6]'
            }`}
          >
            All Claims
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('OBSERVED_EVIDENCE')}
            className={`px-2.5 py-1 rounded-xs border text-[10px] transition-all ${
              activeFilter === 'OBSERVED_EVIDENCE'
                ? 'bg-[#101F14] border-[#4ADE80] text-[#4ADE80]'
                : 'bg-[#0E1015] border-[#222734] text-[#767E90] hover:text-[#ECEBE6]'
            }`}
          >
            Observed ({stage.verifiedClaims.filter(c => c.classification === 'OBSERVED_EVIDENCE').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('SUPPORTED_INTERPRETATION')}
            className={`px-2.5 py-1 rounded-xs border text-[10px] transition-all ${
              activeFilter === 'SUPPORTED_INTERPRETATION'
                ? 'bg-[#181D0E] border-[#CCFF00] text-[#CCFF00]'
                : 'bg-[#0E1015] border-[#222734] text-[#767E90] hover:text-[#ECEBE6]'
            }`}
          >
            Supported ({stage.verifiedClaims.filter(c => c.classification === 'SUPPORTED_INTERPRETATION').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('UNVERIFIED_HYPOTHESIS')}
            className={`px-2.5 py-1 rounded-xs border text-[10px] transition-all ${
              activeFilter === 'UNVERIFIED_HYPOTHESIS'
                ? 'bg-[#1F170E] border-[#FBBF24] text-[#FBBF24]'
                : 'bg-[#0E1015] border-[#222734] text-[#767E90] hover:text-[#ECEBE6]'
            }`}
          >
            Unverified ({stage.verifiedClaims.filter(c => c.classification === 'UNVERIFIED_HYPOTHESIS').length})
          </button>
        </div>
      </div>

      {/* Verified Claims List */}
      <div className="space-y-3.5">
        {filteredClaims.map((item, idx) => {
          const badge = getBadgeStyle(item.classification);
          const statusBadge = getStatusBadge(item.verificationStatus);
          const BadgeIcon = badge.icon;
          const isExpanded = expandedClaimId === item.id;

          return (
            <div
              key={item.id || idx}
              className="p-5 rounded-sm bg-[#0E1015] border border-[#202532] hover:border-[#343D4E] transition-all space-y-3.5 font-mono-code text-xs"
            >
              {/* Top row: Claim ID, Statement & Classification Badge */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2.5 border-b border-[#1A1F2B]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5A6273] uppercase tracking-wider font-semibold">
                      {item.id}
                    </span>
                    <span className="text-[10px] text-[#737B8D]">
                      Market: {item.marketContext}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-xs border ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#F4F3EF] leading-snug">
                    "{item.claim}"
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-semibold uppercase ${badge.bg}`}
                    title={badge.desc}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>
              </div>

              {/* Supporting Qloo Signals */}
              {item.supportingQlooEvidence && item.supportingQlooEvidence.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#6E7586] uppercase block">
                    Supporting Qloo Graph Entities & Signals:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.supportingQlooEvidence.map((ent, entIdx) => (
                      <span
                        key={entIdx}
                        className="px-2.5 py-1 rounded-xs bg-[#141722] border border-[#262C3E] text-[#D8DCE5] text-[11px] inline-flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]"></span>
                        <span className="font-medium">{ent.name}</span>
                        {ent.affinity !== undefined && (
                          <span className="text-[#CCFF00] font-semibold">
                            {(ent.affinity * 100).toFixed(0)}%
                          </span>
                        )}
                        {ent.id && (
                          <span className="text-[#656E81] text-[9px]">
                            {ent.id.slice(0, 10)}...
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning & Confidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#636B7C] uppercase block">
                    Reasoning & Grounding:
                  </span>
                  <p className="text-[#B9C0CF] leading-relaxed">
                    {item.reasoning}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#636B7C] uppercase block">
                    Confidence & Uncertainty:
                  </span>
                  <p className="text-[#B9C0CF] leading-relaxed">
                    {item.confidenceOrUncertainty}
                  </p>
                </div>
              </div>

              {/* Audit Correction or Downgrade Note (if any) */}
              {item.correctedOrDowngradedNote && (
                <div className="p-2.5 rounded-xs bg-[#1A160E] border border-[#3D2D16] text-[#FBBF24] text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span><strong>Audit Calibration:</strong> {item.correctedOrDowngradedNote}</span>
                </div>
              )}

              {/* Expandable Automated Audit Checks Details */}
              {item.automatedAuditChecks && item.automatedAuditChecks.length > 0 && (
                <div className="pt-2 border-t border-[#181C26]">
                  <button
                    type="button"
                    onClick={() => setExpandedClaimId(isExpanded ? null : item.id)}
                    className="flex items-center gap-1.5 text-[10px] text-[#7E8698] hover:text-[#CCFF00] transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{isExpanded ? 'Hide' : 'Inspect'} Automated Check Results ({item.automatedAuditChecks.length})</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-150">
                      {item.automatedAuditChecks.map(check => (
                        <div
                          key={check.checkId}
                          className="p-2 rounded bg-[#090A0E] border border-[#191D28] flex items-start justify-between gap-2 text-[10px]"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-[#D8DCE5]">{check.ruleName}</span>
                            <p className="text-[#7F8698]">{check.details}</p>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 uppercase ${
                              check.status === 'passed'
                                ? 'text-[#4ADE80] bg-[#0E1E14]'
                                : check.status === 'warning'
                                ? 'text-[#FBBF24] bg-[#221A0A]'
                                : 'text-[#F87171] bg-[#220C0F]'
                            }`}
                          >
                            {check.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Known Limitations */}
              <div className="pt-1.5 text-[10px] text-[#697284] flex items-center gap-1.5">
                <Info className="w-3 h-3 shrink-0" />
                <span><strong>Limitation:</strong> {item.limitations}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Platform Limitations */}
      <div className="p-4 rounded-sm bg-[#12100E] border border-[#382315] space-y-2 font-mono-code text-xs">
        <span className="text-xs font-semibold text-[#FDBA74] flex items-center gap-1.5 uppercase">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F97316]" />
          Platform Limitations & Analytical Boundaries
        </span>
        <ul className="space-y-1 text-[#DBC5B8] text-[11px]">
          {stage.criticalLimitations.map((lim, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#F97316]">•</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

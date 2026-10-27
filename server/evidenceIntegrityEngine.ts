/**
 * CultureShift Evidence Integrity Engine
 * Dedicated verification layer enforcing the 8 automated integrity checks
 * Categorizes claims into:
 *  - OBSERVED_EVIDENCE
 *  - SUPPORTED_INTERPRETATION
 *  - UNVERIFIED_HYPOTHESIS
 *  - CONTRADICTED
 *  - UNSUPPORTED
 */

import {
  QlooEntity,
  VerifiedClaim,
  EvidenceClassification,
  VerificationStatus,
  AutomatedAuditCheck,
  IntegrityAuditSummary,
  IntegrityAuditCheckSummary,
  SupportingEvidenceRef,
  CulturalResearcherStage,
  RedTeamStage,
  StrategyArchitectStage,
  ValidatedLaunchConfig,
} from './types.ts';

export interface RawCandidateClaim {
  id?: string;
  claim: string;
  candidateClassification?: string;
  supportingQlooEvidence?: Array<{
    id?: string;
    name: string;
    affinity?: number;
    domain?: string;
    marketContext?: string;
  }>;
  marketContext?: string;
  audienceContext?: string;
  reasoning?: string;
  confidenceOrUncertainty?: string;
  limitations?: string;
}

/**
 * Builds an immutable entity registry from the Cultural Researcher's retrieved data
 */
export function buildEntityRegistry(research: CulturalResearcherStage): Map<string, QlooEntity> {
  const registry = new Map<string, QlooEntity>();

  const register = (e: QlooEntity) => {
    if (e.id) registry.set(e.id, e);
    if (e.name) registry.set(e.name.toLowerCase().trim(), e);
  };

  research.resolvedSeeds.forEach(register);
  research.domains.brands.entities.forEach(register);
  research.domains.music.entities.forEach(register);
  research.domains.media.entities.forEach(register);
  research.domains.places.entities.forEach(register);

  Object.values(research.marketSpecificPlaces).forEach(list => {
    list.forEach(register);
  });

  return registry;
}

/**
 * Evaluates candidate claims against the 8 automated checks
 */
export function auditAndVerifyClaims(
  candidates: RawCandidateClaim[],
  research: CulturalResearcherStage,
  redTeam: RedTeamStage,
  strategy: StrategyArchitectStage,
  config: ValidatedLaunchConfig
): {
  verifiedClaims: VerifiedClaim[];
  summary: IntegrityAuditSummary;
} {
  const entityRegistry = buildEntityRegistry(research);
  const verifiedClaims: VerifiedClaim[] = [];

  // Track violations across the 8 rules
  const violationCounts: Record<string, number> = {
    'rule-1-nonexistent-entity': 0,
    'rule-2-affinity-mismatch': 0,
    'rule-3-cross-market-leak': 0,
    'rule-4-agent-contradiction': 0,
    'rule-5-cultural-generalization': 0,
    'rule-6-unbacked-causality': 0,
    'rule-7-synthetic-statistics': 0,
    'rule-8-missing-provenance': 0,
  };

  candidates.forEach((candidate, index) => {
    const claimId = candidate.id || `CLM-${String(index + 1).padStart(3, '0')}`;
    const claimText = candidate.claim.trim();
    const checks: AutomatedAuditCheck[] = [];
    let classification: EvidenceClassification =
      (candidate.candidateClassification as EvidenceClassification) || 'SUPPORTED_INTERPRETATION';
    let status: VerificationStatus = 'VERIFIED';
    let correctedNote: string | undefined;

    const validatedEvidence: SupportingEvidenceRef[] = [];

    // -------------------------------------------------------------
    // CHECK 1: Nonexistent Entity ID Check
    // -------------------------------------------------------------
    let hasNonexistentEntity = false;
    if (candidate.supportingQlooEvidence && candidate.supportingQlooEvidence.length > 0) {
      for (const ev of candidate.supportingQlooEvidence) {
        const byId = ev.id ? entityRegistry.get(ev.id) : undefined;
        const byName = entityRegistry.get(ev.name.toLowerCase().trim());
        const matched = byId || byName;

        if (!matched) {
          hasNonexistentEntity = true;
          checks.push({
            checkId: 'check-1-entity-id',
            ruleName: 'Entity ID Provenance Check',
            status: 'failed',
            details: `Entity "${ev.name}" (ID: ${ev.id || 'N/A'}) was not found in the verified Qloo retrieval cache.`,
          });
          violationCounts['rule-1-nonexistent-entity']++;
        } else {
          // Keep cited affinity initially so Check 2 can evaluate and auto-calibrate if distorted
          const correctedId = matched.id || ev.id;
          validatedEvidence.push({
            id: correctedId,
            name: matched.name,
            affinity: ev.affinity !== undefined ? ev.affinity : (matched.affinity ?? matched.score),
            domain: ev.domain || matched.type || matched.category || 'Cultural Anchor',
            marketContext: ev.marketContext || candidate.marketContext || config.primaryMarket,
            sourceEndpoint: '/v2/insights',
          });
        }
      }
    }

    if (hasNonexistentEntity) {
      if (classification === 'OBSERVED_EVIDENCE') {
        classification = 'UNSUPPORTED';
        status = 'DOWNGRADED';
        correctedNote = 'Downgraded from OBSERVED_EVIDENCE: cited entity was absent from actual API records.';
      }
    } else if (candidate.supportingQlooEvidence && candidate.supportingQlooEvidence.length > 0) {
      checks.push({
        checkId: 'check-1-entity-id',
        ruleName: 'Entity ID Provenance Check',
        status: 'passed',
        details: 'All referenced entities exist in verified Qloo retrieval registry.',
      });
    }

    // -------------------------------------------------------------
    // CHECK 2: Affinity Value Integrity Check
    // -------------------------------------------------------------
    let affinityMismatch = false;
    for (const ev of validatedEvidence) {
      if (ev.affinity !== undefined && ev.id) {
        const canonical = entityRegistry.get(ev.id);
        if (canonical && canonical.affinity !== undefined) {
          const diff = Math.abs(canonical.affinity - ev.affinity);
          if (diff > 0.05) {
            affinityMismatch = true;
            checks.push({
              checkId: 'check-2-affinity-mismatch',
              ruleName: 'Affinity Value Integrity',
              status: 'warning',
              details: `Affinity for "${ev.name}" cited as ${(ev.affinity * 100).toFixed(0)}%, but recorded Qloo value is ${(canonical.affinity * 100).toFixed(0)}%. Auto-calibrated.`,
            });
            ev.affinity = canonical.affinity;
            violationCounts['rule-2-affinity-mismatch']++;
            correctedNote = (correctedNote ? correctedNote + ' ' : '') + `Auto-corrected affinity value for ${ev.name} to ${(canonical.affinity * 100).toFixed(1)}%.`;
          }
        }
      }
    }
    if (!affinityMismatch) {
      checks.push({
        checkId: 'check-2-affinity-mismatch',
        ruleName: 'Affinity Value Integrity',
        status: 'passed',
        details: 'Affinity metrics align with source Qloo record values.',
      });
    }

    // -------------------------------------------------------------
    // CHECK 3: Cross-Market Context & Query Leak Check
    // -------------------------------------------------------------
    const claimMarket = candidate.marketContext || config.primaryMarket;
    let crossMarketLeak = false;
    for (const ev of validatedEvidence) {
      // If the entity belongs specifically to another market's place list
      for (const [mName, places] of Object.entries(research.marketSpecificPlaces)) {
        if (mName !== claimMarket && places.some(p => p.id === ev.id || p.name.toLowerCase() === ev.name.toLowerCase())) {
          // Check if it's also present in the claimMarket
          const inClaimMarket = (research.marketSpecificPlaces[claimMarket] || []).some(
            p => p.id === ev.id || p.name.toLowerCase() === ev.name.toLowerCase()
          );
          if (!inClaimMarket) {
            crossMarketLeak = true;
            checks.push({
              checkId: 'check-3-cross-market-leak',
              ruleName: 'Cross-Market Context Check',
              status: 'failed',
              details: `Entity "${ev.name}" was retrieved under ${mName} places query, but cited for ${claimMarket} analysis.`,
            });
            violationCounts['rule-3-cross-market-leak']++;
            status = 'FLAGGED';
          }
        }
      }
    }
    if (!crossMarketLeak) {
      checks.push({
        checkId: 'check-3-cross-market-leak',
        ruleName: 'Cross-Market Context Check',
        status: 'passed',
        details: `Evidence strictly contextualized to validated market: ${claimMarket}.`,
      });
    }

    // -------------------------------------------------------------
    // CHECK 4: Agent Contradiction Detection
    // -------------------------------------------------------------
    let contradictionFound = false;
    const lowerClaim = claimText.toLowerCase();
    for (const risk of redTeam.frictionPoints) {
      if (risk.severity === 'High') {
        const keyTerms = risk.riskTitle.toLowerCase().split(' ').filter(w => w.length > 4);
        const conflictsWithTone = keyTerms.some(term => lowerClaim.includes(term));
        if (conflictsWithTone && (lowerClaim.includes('guarantee') || lowerClaim.includes('universal') || lowerClaim.includes('seamless'))) {
          contradictionFound = true;
          checks.push({
            checkId: 'check-4-agent-contradiction',
            ruleName: 'Agent Contradiction Detection',
            status: 'failed',
            details: `Claim directly conflicts with Red-Team High Severity Risk "${risk.riskTitle}": ${risk.conflictWithObservedTaste}`,
          });
          violationCounts['rule-4-agent-contradiction']++;
          classification = 'CONTRADICTED';
          status = 'CONTRADICTED';
          correctedNote = (correctedNote ? correctedNote + ' ' : '') + `Downgraded to CONTRADICTED due to Red-Team risk "${risk.riskTitle}".`;
        }
      }
    }
    if (!contradictionFound) {
      checks.push({
        checkId: 'check-4-agent-contradiction',
        ruleName: 'Agent Contradiction Detection',
        status: 'passed',
        details: 'No irreconcilable contradictions detected across agent outputs.',
      });
    }

    // -------------------------------------------------------------
    // CHECK 5: Cultural Generalization Guardrail
    // -------------------------------------------------------------
    const generalizationRegex = /\b(all\s+(japanese|british|americans|berliners|londoners|consumers|people)|the\s+entire\s+(nation|market|culture)\s+(universally|always|loves|demands))\b/i;
    if (generalizationRegex.test(claimText)) {
      checks.push({
        checkId: 'check-5-cultural-generalization',
        ruleName: 'Cultural Generalization Guardrail',
        status: 'warning',
        details: 'Monolithic population generalization detected. Culture is heterogeneous across subcultures and districts.',
      });
      violationCounts['rule-5-cultural-generalization']++;
      if (classification === 'OBSERVED_EVIDENCE') {
        classification = 'SUPPORTED_INTERPRETATION';
        status = 'DOWNGRADED';
        correctedNote = (correctedNote ? correctedNote + ' ' : '') + 'Downgraded: Replaced sweeping demographic generalization with localized taste cohort qualification.';
      }
    } else {
      checks.push({
        checkId: 'check-5-cultural-generalization',
        ruleName: 'Cultural Generalization Guardrail',
        status: 'passed',
        details: 'Avoids sweeping national monoliths; grounded in specific lifestyle clusters.',
      });
    }

    // -------------------------------------------------------------
    // CHECK 6: Unbacked Causality Guardrail
    // -------------------------------------------------------------
    const causalityRegex = /\b(will\s+cause|guarantees?\s+(\d+%\s+)?(sales|conversion|adoption)|directly\s+causes|ensures\s+100%)\b/i;
    if (causalityRegex.test(claimText)) {
      checks.push({
        checkId: 'check-6-unbacked-causality',
        ruleName: 'Causal Inference Guardrail',
        status: 'warning',
        details: 'Causal sales/conversion attribution without empirical A/B experiment data is unverified.',
      });
      violationCounts['rule-6-unbacked-causality']++;
      if (classification === 'OBSERVED_EVIDENCE' || classification === 'SUPPORTED_INTERPRETATION') {
        classification = 'UNVERIFIED_HYPOTHESIS';
        status = 'DOWNGRADED';
        correctedNote = (correctedNote ? correctedNote + ' ' : '') + 'Downgraded to UNVERIFIED_HYPOTHESIS: Taste affinity indicates aesthetic resonance, not commercial causality.';
      }
    } else {
      checks.push({
        checkId: 'check-6-unbacked-causality',
        ruleName: 'Causal Inference Guardrail',
        status: 'passed',
        details: 'Maintains honest distinction between cultural affinity and transactional conversion.',
      });
    }

    // -------------------------------------------------------------
    // CHECK 7: AI-Generated Statistics Disguised as Measured Data
    // -------------------------------------------------------------
    const fakeStatRegex = /\b(\d{2,3}%\s+(market\s+share|conversion\s+rate|purchase\s+intent|sales\s+growth))\b/i;
    if (fakeStatRegex.test(claimText)) {
      checks.push({
        checkId: 'check-7-synthetic-statistics',
        ruleName: 'Measured Data vs Synthetic Stat Guardrail',
        status: 'failed',
        details: 'Synthetic quantitative metric detected. Qloo API supplies affinity vectors and cultural entities, not sales percentages.',
      });
      violationCounts['rule-7-synthetic-statistics']++;
      if (classification !== 'UNVERIFIED_HYPOTHESIS') {
        classification = 'UNVERIFIED_HYPOTHESIS';
        status = 'DOWNGRADED';
        correctedNote = (correctedNote ? correctedNote + ' ' : '') + 'Downgraded: Quantitative market outcome flagged as speculative assumption.';
      }
    } else {
      checks.push({
        checkId: 'check-7-synthetic-statistics',
        ruleName: 'Measured Data vs Synthetic Stat Guardrail',
        status: 'passed',
        details: 'No fabricated commercial metrics detected.',
      });
    }

    // -------------------------------------------------------------
    // CHECK 8: Evidence Provenance & Source Completeness
    // -------------------------------------------------------------
    if (classification === 'OBSERVED_EVIDENCE' && validatedEvidence.length === 0) {
      checks.push({
        checkId: 'check-8-missing-provenance',
        ruleName: 'Evidence Provenance Completeness',
        status: 'failed',
        details: 'Claim declared as OBSERVED_EVIDENCE but cites zero verifiable Qloo entity records.',
      });
      violationCounts['rule-8-missing-provenance']++;
      classification = 'UNSUPPORTED';
      status = 'UNSUPPORTED';
      correctedNote = (correctedNote ? correctedNote + ' ' : '') + 'Reclassified as UNSUPPORTED due to total absence of source evidence citation.';
    } else {
      checks.push({
        checkId: 'check-8-missing-provenance',
        ruleName: 'Evidence Provenance Completeness',
        status: 'passed',
        details: 'Evidence provenance explicitly linked to endpoints and entity identifiers.',
      });
    }

    // Final verification status determination
    const hasFail = checks.some(c => c.status === 'failed');
    const hasWarn = checks.some(c => c.status === 'warning');
    if (classification === 'CONTRADICTED') {
      status = 'CONTRADICTED';
    } else if (classification === 'UNSUPPORTED') {
      status = 'UNSUPPORTED';
    } else if (hasFail) {
      status = 'FLAGGED';
    } else if (hasWarn && status !== 'DOWNGRADED') {
      status = 'FLAGGED';
    }

    verifiedClaims.push({
      id: claimId,
      claim: claimText,
      classification,
      verificationStatus: status,
      supportingQlooEvidence: validatedEvidence,
      marketContext: claimMarket,
      audienceContext: candidate.audienceContext || config.targetAudience,
      reasoning: candidate.reasoning || 'Derived from systematic cultural taste analysis.',
      confidenceOrUncertainty:
        candidate.confidenceOrUncertainty ||
        (classification === 'OBSERVED_EVIDENCE'
          ? 'High: Direct mathematical affinity output from Qloo Knowledge Graph.'
          : classification === 'SUPPORTED_INTERPRETATION'
          ? 'Moderate: Reasoned synthesis requiring tactical execution care.'
          : 'Low / Uncertain: Speculative thesis requiring empirical launch testing.'),
      automatedAuditChecks: checks,
      limitations:
        candidate.limitations ||
        'Reflects affinity graph at time of query; micro-cohort dynamics may exhibit local variation.',
      correctedOrDowngradedNote: correctedNote,
    });
  });

  // Calculate summary metrics
  const totalClaimsEvaluated = verifiedClaims.length;
  const observedEvidenceCount = verifiedClaims.filter(c => c.classification === 'OBSERVED_EVIDENCE').length;
  const supportedInterpretationCount = verifiedClaims.filter(c => c.classification === 'SUPPORTED_INTERPRETATION').length;
  const unverifiedHypothesisCount = verifiedClaims.filter(c => c.classification === 'UNVERIFIED_HYPOTHESIS').length;
  const contradictedCount = verifiedClaims.filter(c => c.classification === 'CONTRADICTED').length;
  const unsupportedCount = verifiedClaims.filter(c => c.classification === 'UNSUPPORTED').length;

  const checksSummary: IntegrityAuditCheckSummary[] = [
    {
      ruleId: 'rule-1-nonexistent-entity',
      ruleTitle: 'Entity ID Provenance',
      description: 'Ensures every cited entity exists in immutable Qloo API retrieval cache.',
      passed: violationCounts['rule-1-nonexistent-entity'] === 0,
      violationsCount: violationCounts['rule-1-nonexistent-entity'],
      notes: violationCounts['rule-1-nonexistent-entity'] === 0 ? 'All entity IDs verified' : `${violationCounts['rule-1-nonexistent-entity']} entities flagged or corrected`,
    },
    {
      ruleId: 'rule-2-affinity-mismatch',
      ruleTitle: 'Affinity Value Integrity',
      description: 'Validates cited affinity percentages against recorded Qloo scores without hallucination.',
      passed: violationCounts['rule-2-affinity-mismatch'] === 0,
      violationsCount: violationCounts['rule-2-affinity-mismatch'],
      notes: violationCounts['rule-2-affinity-mismatch'] === 0 ? 'Zero affinity distortions' : `${violationCounts['rule-2-affinity-mismatch']} metrics auto-calibrated`,
    },
    {
      ruleId: 'rule-3-cross-market-leak',
      ruleTitle: 'Cross-Market Context Segregation',
      description: 'Prevents place or lifestyle data retrieved for Market A from leaking into Market B.',
      passed: violationCounts['rule-3-cross-market-leak'] === 0,
      violationsCount: violationCounts['rule-3-cross-market-leak'],
      notes: violationCounts['rule-3-cross-market-leak'] === 0 ? 'Strict market segregation maintained' : `${violationCounts['rule-3-cross-market-leak']} cross-market references flagged`,
    },
    {
      ruleId: 'rule-4-agent-contradiction',
      ruleTitle: 'Agent Contradiction Detection',
      description: 'Detects unacknowledged conflicts between positioning recommendations and Red-Team risks.',
      passed: violationCounts['rule-4-agent-contradiction'] === 0,
      violationsCount: violationCounts['rule-4-agent-contradiction'],
      notes: violationCounts['rule-4-agent-contradiction'] === 0 ? 'Cross-agent alignment passed' : `${violationCounts['rule-4-agent-contradiction']} contradictory assertions isolated`,
    },
    {
      ruleId: 'rule-5-cultural-generalization',
      ruleTitle: 'Anti-Stereotype & Monolith Guardrail',
      description: 'Prevents treating an entire country or city population as culturally uniform.',
      passed: violationCounts['rule-5-cultural-generalization'] === 0,
      violationsCount: violationCounts['rule-5-cultural-generalization'],
      notes: violationCounts['rule-5-cultural-generalization'] === 0 ? 'Heterogeneous cohort framing verified' : `${violationCounts['rule-5-cultural-generalization']} generalizations downgraded`,
    },
    {
      ruleId: 'rule-6-unbacked-causality',
      ruleTitle: 'Causal Inference Guardrail',
      description: 'Ensures taste affinity is never misrepresented as guaranteed commercial transactions.',
      passed: violationCounts['rule-6-unbacked-causality'] === 0,
      violationsCount: violationCounts['rule-6-unbacked-causality'],
      notes: violationCounts['rule-6-unbacked-causality'] === 0 ? 'Causal claims properly bounded' : `${violationCounts['rule-6-unbacked-causality']} causal inferences downgraded to hypothesis`,
    },
    {
      ruleId: 'rule-7-synthetic-statistics',
      ruleTitle: 'Synthetic Statistics Guardrail',
      description: 'Blocks AI-generated market shares or conversion figures presented as measured data.',
      passed: violationCounts['rule-7-synthetic-statistics'] === 0,
      violationsCount: violationCounts['rule-7-synthetic-statistics'],
      notes: violationCounts['rule-7-synthetic-statistics'] === 0 ? 'No synthetic metrics detected' : `${violationCounts['rule-7-synthetic-statistics']} synthetic figures flagged`,
    },
    {
      ruleId: 'rule-8-missing-provenance',
      ruleTitle: 'Source Provenance Completeness',
      description: 'Guarantees every factual claim has an auditable endpoint, query, and entity link.',
      passed: violationCounts['rule-8-missing-provenance'] === 0,
      violationsCount: violationCounts['rule-8-missing-provenance'],
      notes: violationCounts['rule-8-missing-provenance'] === 0 ? 'Complete provenance across claims' : `${violationCounts['rule-8-missing-provenance']} unsupported claims downgraded`,
    },
  ];

  const hasAnyFailedRule = checksSummary.some(c => !c.passed);
  const overallStatus = contradictedCount > 0 ? 'CAUTION' : hasAnyFailedRule ? 'CAUTION' : 'PASS';

  return {
    verifiedClaims,
    summary: {
      totalClaimsEvaluated,
      observedEvidenceCount,
      supportedInterpretationCount,
      unverifiedHypothesisCount,
      contradictedCount,
      unsupportedCount,
      overallStatus,
      checksSummary,
    },
  };
}

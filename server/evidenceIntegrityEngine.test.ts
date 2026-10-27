import { test } from 'node:test';
import assert from 'node:assert';
import {
  auditAndVerifyClaims,
  buildEntityRegistry,
  RawCandidateClaim,
} from './evidenceIntegrityEngine';
import {
  CulturalResearcherStage,
  RedTeamStage,
  StrategyArchitectStage,
  ValidatedLaunchConfig,
} from './types';

const mockResearch: CulturalResearcherStage = {
  agentName: 'Cultural Researcher',
  status: 'completed',
  summary: 'Research completed.',
  totalQueriesRun: 6,
  methodologyNote: 'Methodology test.',
  explicitDataGaps: [],
  resolvedSeeds: [
    { id: 'seed-aesop', name: 'Aesop', type: 'Brand', affinity: 0.92 },
  ],
  domains: {
    brands: {
      domain: 'brands',
      domainLabel: 'Brands',
      targetType: 'urn:entity:brand',
      status: 'success',
      entities: [
        { id: 'ent-snowpeak', name: 'Snow Peak', type: 'Brand', affinity: 0.88 },
        { id: 'ent-monocle', name: 'Monocle', type: 'Brand', affinity: 0.85 },
      ],
    },
    music: {
      domain: 'music',
      domainLabel: 'Music',
      targetType: 'urn:entity:artist',
      status: 'success',
      entities: [
        { id: 'art-bonobo', name: 'Bonobo', type: 'Artist', affinity: 0.78 },
      ],
    },
    media: {
      domain: 'media',
      domainLabel: 'Media',
      targetType: 'urn:entity:movie',
      status: 'success',
      entities: [],
    },
    places: {
      domain: 'places',
      domainLabel: 'Places',
      targetType: 'urn:entity:place',
      status: 'success',
      entities: [
        { id: 'plc-daikanyama', name: 'Daikanyama T-Site', type: 'Place', affinity: 0.82 },
      ],
    },
  },
  marketSpecificPlaces: {
    Tokyo: [
      { id: 'plc-daikanyama', name: 'Daikanyama T-Site', type: 'Place', affinity: 0.82 },
    ],
    London: [
      { id: 'plc-chiltern', name: 'Chiltern Firehouse', type: 'Place', affinity: 0.79 },
    ],
  },
};

const mockRedTeam: RedTeamStage = {
  agentName: 'Red-Team Adversary',
  status: 'completed',
  adversarialVerdict: 'Friction test',
  adversarialCritique: 'Critique test',
  frictionPoints: [
    {
      riskTitle: 'Subcultural Tone Mismatch',
      severity: 'High',
      conflictWithObservedTaste: 'Audience rejects aggressive marketing hype.',
      potentialBacklashOrApathy: 'Community mockery.',
      stressTestScenario: 'Mass campaign launch.',
      recommendedSafeguard: 'Understated physical seeding.',
      isEvidenceBased: true,
    },
  ],
  overlookedBlindspots: [],
  alternativeInterpretations: [],
};

const mockStrategy: StrategyArchitectStage = {
  agentName: 'Strategy Architect',
  status: 'completed',
  executiveSummary: 'Executive summary',
  strategicDirection: 'Direction',
  alternativeStrategies: [],
};

const mockConfig: ValidatedLaunchConfig = {
  productName: 'Kissa Modern',
  category: 'Craft Audio',
  description: 'Audiophile grade acoustic listening hardware.',
  targetAudience: 'Design-conscious audiophiles and architects',
  primaryMarket: 'Tokyo',
  secondaryMarkets: ['London'],
  launchObjective: 'cult_status',
  proposedPositioning: 'Understated acoustic perfection.',
  selectedCulturalAnchors: [{ name: 'Aesop', id: 'seed-aesop' }],
};

test('Evidence Integrity Engine: Rule 1 flags nonexistent entity ID', () => {
  const candidate: RawCandidateClaim = {
    claim: 'Audience shows high affinity for FakeBrandXYZ.',
    candidateClassification: 'OBSERVED_EVIDENCE',
    supportingQlooEvidence: [
      { id: 'ent-fake-123', name: 'FakeBrandXYZ', affinity: 0.95 },
    ],
  };

  const { verifiedClaims, summary } = auditAndVerifyClaims(
    [candidate],
    mockResearch,
    mockRedTeam,
    mockStrategy,
    mockConfig
  );

  assert.strictEqual(verifiedClaims[0].classification, 'UNSUPPORTED');
  assert.strictEqual(verifiedClaims[0].verificationStatus, 'UNSUPPORTED');
  assert.strictEqual(summary.checksSummary.find(c => c.ruleId === 'rule-1-nonexistent-entity')?.passed, false);
});

test('Evidence Integrity Engine: Rule 2 auto-calibrates affinity distortion', () => {
  const candidate: RawCandidateClaim = {
    claim: 'Audience shows strong affinity for Snow Peak.',
    candidateClassification: 'OBSERVED_EVIDENCE',
    supportingQlooEvidence: [
      // Snow Peak recorded affinity is 0.88, candidate cites 0.99
      { id: 'ent-snowpeak', name: 'Snow Peak', affinity: 0.99 },
    ],
  };

  const { verifiedClaims, summary } = auditAndVerifyClaims(
    [candidate],
    mockResearch,
    mockRedTeam,
    mockStrategy,
    mockConfig
  );

  assert.strictEqual(summary.checksSummary.find(c => c.ruleId === 'rule-2-affinity-mismatch')?.passed, false);
  // Checked that the affinity was auto-calibrated to recorded 0.88
  assert.strictEqual(verifiedClaims[0].supportingQlooEvidence[0].affinity, 0.88);
});

test('Evidence Integrity Engine: Rule 3 detects cross-market query context leak', () => {
  const candidate: RawCandidateClaim = {
    claim: 'Tokyo cohort frequents Chiltern Firehouse regularly.',
    candidateClassification: 'OBSERVED_EVIDENCE',
    marketContext: 'Tokyo',
    supportingQlooEvidence: [
      // Chiltern Firehouse was retrieved under London places query, not Tokyo!
      { id: 'plc-chiltern', name: 'Chiltern Firehouse', affinity: 0.79 },
    ],
  };

  const { verifiedClaims } = auditAndVerifyClaims(
    [candidate],
    mockResearch,
    mockRedTeam,
    mockStrategy,
    mockConfig
  );

  const check = verifiedClaims[0].automatedAuditChecks.find(c => c.checkId === 'check-3-cross-market-leak');
  assert.strictEqual(check?.status, 'failed');
  assert.strictEqual(verifiedClaims[0].verificationStatus, 'FLAGGED');
});

test('Evidence Integrity Engine: Rule 5 flags sweeping cultural generalizations', () => {
  const candidate: RawCandidateClaim = {
    claim: 'All Japanese consumers universally love minimalist audio products.',
    candidateClassification: 'OBSERVED_EVIDENCE',
    supportingQlooEvidence: [
      { id: 'ent-snowpeak', name: 'Snow Peak', affinity: 0.88 },
    ],
  };

  const { verifiedClaims } = auditAndVerifyClaims(
    [candidate],
    mockResearch,
    mockRedTeam,
    mockStrategy,
    mockConfig
  );

  const check = verifiedClaims[0].automatedAuditChecks.find(c => c.checkId === 'check-5-cultural-generalization');
  assert.strictEqual(check?.status, 'warning');
  assert.strictEqual(verifiedClaims[0].classification, 'SUPPORTED_INTERPRETATION');
});

test('Evidence Integrity Engine: Rule 6 downgrades unbacked causal conversion claims', () => {
  const candidate: RawCandidateClaim = {
    claim: 'Aesthetic alignment will cause 40% sales conversion within 30 days.',
    candidateClassification: 'OBSERVED_EVIDENCE',
    supportingQlooEvidence: [
      { id: 'ent-snowpeak', name: 'Snow Peak', affinity: 0.88 },
    ],
  };

  const { verifiedClaims } = auditAndVerifyClaims(
    [candidate],
    mockResearch,
    mockRedTeam,
    mockStrategy,
    mockConfig
  );

  assert.strictEqual(verifiedClaims[0].classification, 'UNVERIFIED_HYPOTHESIS');
  assert.strictEqual(verifiedClaims[0].verificationStatus, 'DOWNGRADED');
});

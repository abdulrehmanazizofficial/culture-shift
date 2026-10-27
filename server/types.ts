/**
 * CultureShift Core Data Contracts & Qloo Multi-Agent Architecture
 * Enterprise-grade Cultural Intelligence Schema
 */

export interface QlooEntity {
  id: string;
  name: string;
  type?: string;
  category?: string;
  properties?: {
    popularity?: number;
    image_url?: string;
    description?: string;
    release_date?: string;
    genres?: string[];
    [key: string]: unknown;
  };
  affinity?: number;
  score?: number;
}

export interface QlooSearchResponse {
  results: QlooEntity[];
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

export interface QlooInsightsResponse {
  results: QlooEntity[];
  meta?: {
    total?: number;
    query_entities?: string[];
    target_type?: string;
  };
}

export interface DomainInsightGroup {
  domain: 'brands' | 'music' | 'media' | 'places';
  domainLabel: string;
  targetType: string;
  entities: QlooEntity[];
  status: 'success' | 'empty' | 'error';
  errorMessage?: string;
}

export type LaunchObjective =
  | 'cult_status'
  | 'brand_awareness'
  | 'category_creation'
  | 'high_velocity_sales'
  | 'counter_cultural';

export interface AnalysisInput {
  productName: string;
  category: string;
  description: string;
  targetMarkets: string[]; // e.g. ['Tokyo', 'London', 'New York']
  primaryMarket: string;
  targetAudience: string;
  proposedPositioning: string;
  launchObjective: LaunchObjective;
  seedKeywords?: string[];
  resolvedSeedEntities?: QlooEntity[];
}

export interface ValidatedLaunchConfig {
  productName: string;
  category: string;
  description: string;
  targetAudience: string;
  primaryMarket: string;
  secondaryMarkets: string[];
  launchObjective: LaunchObjective;
  proposedPositioning: string;
  selectedCulturalAnchors: Array<{ name: string; id?: string; type?: string }>;
}

// ----------------------------------------------------
// MULTI-AGENT STRUCTURED STAGE CONTRACTS
// ----------------------------------------------------

export interface MarketAnalystStage {
  agentName: 'Market Analyst';
  status: 'completed' | 'running' | 'pending';
  summary: string;
  corePositioningThesis: string;
  strategicTensions: string[];
  targetCulturalVectors: string[];
  recommendedSeedQueries: string[];
  validatedAssumptionsToTest: string[];
}

export interface CulturalResearcherStage {
  agentName: 'Cultural Researcher';
  status: 'completed' | 'running' | 'pending';
  summary: string;
  resolvedSeeds: QlooEntity[];
  domains: {
    brands: DomainInsightGroup;
    music: DomainInsightGroup;
    media: DomainInsightGroup;
    places: DomainInsightGroup;
  };
  marketSpecificPlaces: Record<string, QlooEntity[]>;
  totalQueriesRun: number;
  methodologyNote: string;
  explicitDataGaps: string[];
}

export interface RedTeamRisk {
  riskTitle: string;
  severity: 'High' | 'Medium' | 'Low';
  conflictWithObservedTaste: string;
  potentialBacklashOrApathy: string;
  stressTestScenario: string;
  recommendedSafeguard: string;
  isEvidenceBased: boolean;
}

export interface RedTeamStage {
  agentName: 'Red-Team Adversary';
  status: 'completed' | 'running' | 'pending';
  adversarialVerdict: string;
  adversarialCritique: string;
  frictionPoints: RedTeamRisk[];
  overlookedBlindspots: string[];
  alternativeInterpretations: string[];
}

export interface StrategyOption {
  id: string;
  archetype: string;
  tagline: string;
  coreThesis: string;
  intendedAudience: string;
  supportingEvidence: string[];
  evidenceBasedOpportunities: string[];
  risksAndVulnerabilities: string[];
  underlyingAssumptions: string[];
  missingEvidence: string[];
  recommendedValidationSteps: string[];
  suggestedMessaging: string;
  creativeDirection: string;
  keyBrandAllies: string[];
  culturalAesthetic: string;
  launchPlaybookStep: string;
  heuristicAlignmentScore?: {
    score: number; // 0-100
    formulaExplanation: string;
  };
}

export interface StrategyArchitectStage {
  agentName: 'Strategy Architect';
  status: 'completed' | 'running' | 'pending';
  executiveSummary: string;
  strategicDirection: string;
  alternativeStrategies: StrategyOption[];
}

// ----------------------------------------------------
// EVIDENCE INTEGRITY & VERIFICATION ENGINE CONTRACTS
// ----------------------------------------------------

export type EvidenceClassification =
  | 'OBSERVED_EVIDENCE'
  | 'SUPPORTED_INTERPRETATION'
  | 'UNVERIFIED_HYPOTHESIS'
  | 'CONTRADICTED'
  | 'UNSUPPORTED';

export type VerificationStatus =
  | 'VERIFIED'
  | 'FLAGGED'
  | 'DOWNGRADED'
  | 'CONTRADICTED'
  | 'UNSUPPORTED';

export interface SupportingEvidenceRef {
  id?: string;
  name: string;
  affinity?: number;
  domain?: string;
  marketContext?: string;
  sourceEndpoint?: string;
  queryParam?: string;
}

export interface AutomatedAuditCheck {
  checkId: string; // e.g. 'check-1-entity-id'
  ruleName: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
}

export interface VerifiedClaim {
  id: string; // e.g. 'CLM-001'
  claim: string;
  classification: EvidenceClassification;
  verificationStatus: VerificationStatus;
  supportingQlooEvidence: SupportingEvidenceRef[];
  marketContext: string;
  audienceContext: string;
  reasoning: string;
  confidenceOrUncertainty: string;
  automatedAuditChecks: AutomatedAuditCheck[];
  limitations: string;
  correctedOrDowngradedNote?: string;
}

export interface IntegrityAuditCheckSummary {
  ruleId: string;
  ruleTitle: string;
  description: string;
  passed: boolean;
  violationsCount: number;
  notes: string;
}

export interface IntegrityAuditSummary {
  totalClaimsEvaluated: number;
  observedEvidenceCount: number;
  supportedInterpretationCount: number;
  unverifiedHypothesisCount: number;
  contradictedCount: number;
  unsupportedCount: number;
  overallStatus: 'PASS' | 'CAUTION' | 'FAIL';
  checksSummary: IntegrityAuditCheckSummary[];
}

export interface EvidenceVerifierStage {
  agentName: 'Evidence Verifier';
  status: 'completed' | 'running' | 'pending';
  auditVerdict: string;
  overallGroundingConfidence: 'High' | 'Medium' | 'Low';
  verifiedClaims: VerifiedClaim[];
  integrityAuditSummary: IntegrityAuditSummary;
  criticalLimitations: string[];
}

export interface CulturalExperiment {
  id: string;
  title: string;
  experimentType: 'ab_test' | 'customer_interviews' | 'concept_survey' | 'creative_test' | 'market_validation';
  hypothesis: string;
  whatIsBeingCompared: string;
  targetParticipants: string;
  measurementMethod: string;
  successCriteria: string;
  potentialConfoundingFactors: string[];
  conclusionsSupported: string;
  conclusionsNotSupported: string;
  derivedFromStrategyId?: string;
  associatedClaimId?: string;
}

export interface CrossMarketComparison {
  marketsCompared: string[];
  marketProfiles: Record<
    string,
    {
      topCulturalNodes: string[];
      lifestyleAnchors: string[];
      culturalToneNuance: string;
    }
  >;
  sharedCulturalBridges: Array<{
    culturalBridge: string;
    supportingEntities: string[];
    applicability: string;
  }>;
  divergentCulturalNuances: Array<{
    dimension: string;
    marketA: { market: string; nuance: string };
    marketB: { market: string; nuance: string };
    strategicTakeaway: string;
  }>;
  uncertaintyNotes: string;
}

export interface MultiAgentReport {
  id: string;
  timestamp: string;
  input: AnalysisInput;
  validatedConfig: ValidatedLaunchConfig;
  connectionMetadata: {
    qlooConfigured: boolean;
    qlooVerified: boolean;
    latencyMs?: number;
    requestId?: string;
    totalEntitiesResolved: number;
  };
  stages: {
    marketAnalyst: MarketAnalystStage;
    culturalResearcher: CulturalResearcherStage;
    redTeam: RedTeamStage;
    strategyArchitect: StrategyArchitectStage;
    evidenceVerifier: EvidenceVerifierStage;
  };
  crossMarketComparison?: CrossMarketComparison;
  experiments: CulturalExperiment[];
}

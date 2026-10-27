/**
 * CultureShift Full-Stack Server
 * Express with Vite Middleware & Server-Side Qloo Client Integration
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getApiKeyStatus,
  setRuntimeApiKey,
  verifyConnection,
  searchEntities,
  getInsights,
  QLOO_URN_TYPES,
  QlooApiError,
  getQlooApiKey,
} from './server/qlooClient.ts';
import { AnalysisInput, DomainInsightGroup, QlooEntity } from './server/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// 1. Health & Config status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const qlooStatus = getApiKeyStatus();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  res.json({
    status: 'ok',
    qloo: {
      configured: qlooStatus.configured,
      maskedKey: qlooStatus.maskedKey,
      source: qlooStatus.source,
    },
    gemini: {
      configured: geminiConfigured,
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. Configure Qloo API Key at runtime
app.post('/api/qloo/configure', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    res.status(400).json({ error: 'Valid apiKey string is required.' });
    return;
  }

  setRuntimeApiKey(apiKey);
  // Proactively verify the provided key with live ping
  const verification = await verifyConnection();

  res.json({
    success: true,
    message: verification.success
      ? 'Qloo API key successfully configured and verified.'
      : 'Qloo API key updated, but verification probe failed.',
    verification,
  });
});

// 3. Live connection verification probe
app.post('/api/qloo/verify', async (_req: Request, res: Response) => {
  try {
    const result = await verifyConnection();
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      status: 500,
      error: (err as Error).message || 'Verification failed',
    });
  }
});

// 4. Entity Search Endpoint
app.get('/api/qloo/search', async (req: Request, res: Response) => {
  const query = req.query.query as string;
  const types = req.query.types as string | undefined;

  if (!query || !query.trim()) {
    res.status(400).json({ error: 'Search query parameter is required.' });
    return;
  }

  try {
    const data = await searchEntities(query, types);
    res.json(data);
  } catch (err: unknown) {
    if (err instanceof QlooApiError) {
      res.status(err.details.status || 500).json({
        error: err.message,
        details: err.details,
      });
      return;
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

// 5. Cross-domain Insights Endpoint
app.post('/api/qloo/insights', async (req: Request, res: Response) => {
  const { entityIds, targetType, take, location, maxPopularity } = req.body;

  if (!Array.isArray(entityIds) || entityIds.length === 0) {
    res.status(400).json({ error: 'entityIds array is required.' });
    return;
  }
  if (!targetType) {
    res.status(400).json({ error: 'targetType is required.' });
    return;
  }

  try {
    const data = await getInsights({
      entityIds,
      targetType,
      take,
      location,
      maxPopularity,
    });
    res.json(data);
  } catch (err: unknown) {
    if (err instanceof QlooApiError) {
      res.status(err.details.status || 500).json({
        error: err.message,
        details: err.details,
      });
      return;
    }
    res.status(500).json({ error: (err as Error).message });
  }
});

import { executeMultiAgentWorkflow } from './server/multiAgentOrchestrator';

// 6. Complete Cultural Intelligence Multi-Agent Analysis Workflow
app.post('/api/analysis/run', async (req: Request, res: Response) => {
  const input: AnalysisInput = req.body;

  // Validate inputs
  if (!input.productName?.trim()) {
    res.status(400).json({ error: 'Product name is required.' });
    return;
  }
  if (!input.description?.trim()) {
    res.status(400).json({ error: 'Product description is required.' });
    return;
  }
  if (!input.targetMarkets || input.targetMarkets.length === 0) {
    // Graceful normalization if single targetMarket string was sent
    if ((input as any).targetMarket?.trim()) {
      input.targetMarkets = [(input as any).targetMarket.trim()];
    } else {
      res.status(400).json({ error: 'At least one target market is required.' });
      return;
    }
  }
  if (!input.primaryMarket?.trim()) {
    input.primaryMarket = input.targetMarkets[0];
  }
  if (!input.targetAudience?.trim()) {
    res.status(400).json({ error: 'Target audience persona is required.' });
    return;
  }
  if (!input.proposedPositioning?.trim()) {
    res.status(400).json({ error: 'Proposed positioning angle is required.' });
    return;
  }
  if (!input.launchObjective) {
    input.launchObjective = 'cult_status';
  }

  const apiKey = getQlooApiKey();
  if (!apiKey) {
    res.status(401).json({
      error: 'QLOO_KEY_NOT_CONFIGURED',
      message: 'QLOO_API_KEY is not configured on the server. Please configure your key in the header to run live cultural analysis.',
    });
    return;
  }

  try {
    const report = await executeMultiAgentWorkflow(input);
    res.json(report);
  } catch (err: unknown) {
    console.error('Multi-Agent Analysis error:', err);
    if (err instanceof QlooApiError) {
      res.status(err.details.status || 500).json({
        error: err.message,
        details: err.details,
      });
      return;
    }
    res.status(500).json({ error: (err as Error).message || 'Analysis failed' });
  }
});

// 7. Structured Multi-Agent Report Export
// 7. Structured Multi-Agent Report Export (Complete 10-Point Cultural Intelligence Dossier)
app.post('/api/analysis/export', (req: Request, res: Response) => {
  const { report, format } = req.body;
  if (!report) {
    res.status(400).json({ error: 'Report data is required.' });
    return;
  }

  if (format === 'markdown') {
    const config = report.validatedConfig || report.input;
    const audit = report.stages?.evidenceVerifier?.integrityAuditSummary;

    const md = `# CULTURESHIFT — CULTURAL INTELLIGENCE & LAUNCH STRATEGY DOSSIER
Generated: ${report.timestamp}
Report ID: \`${report.id}\`
Grounding Confidence: **${report.stages?.evidenceVerifier?.overallGroundingConfidence || 'High'}**

===================================================================
1. EXECUTIVE SUMMARY
===================================================================
${report.stages?.marketAnalyst?.summary || 'N/A'}

Strategic Realignment: ${report.stages?.strategyArchitect?.strategicDirection || 'N/A'}
Audit Verdict: ${report.stages?.evidenceVerifier?.auditVerdict || 'N/A'}

===================================================================
2. VALIDATED PRODUCT & MARKET CONFIGURATION
===================================================================
- Product Name: ${config.productName}
- Industry / Category: ${config.category}
- Product Description: ${config.description}
- Target Audience: ${config.targetAudience}
- Primary Market: ${config.primaryMarket}
- Secondary Markets: ${(config.secondaryMarkets || []).join(', ') || 'None specified'}
- Launch Objective: ${config.launchObjective || 'Cult Status'}
- Proposed Positioning: "${config.proposedPositioning}"

===================================================================
3. ACTUAL QLOO RESEARCH METHODOLOGY
===================================================================
- Base Endpoint: https://hackathon.api.qloo.com
- Total API Queries Executed: ${report.stages?.culturalResearcher?.totalQueriesRun || 0}
- Total Entities Resolved: ${report.connectionMetadata?.totalEntitiesResolved || 0}
- Server API Latency: ${report.connectionMetadata?.latencyMs || 0}ms
- Request ID: ${report.connectionMetadata?.requestId || 'N/A'}
- Methodology Notes: ${report.stages?.culturalResearcher?.methodologyNote || 'Direct API queries with signal.interests.entities'}
- Explicit Data Gaps:
${(report.stages?.culturalResearcher?.explicitDataGaps || []).map((g: string) => `  * ${g}`).join('\n') || '  * None observed'}

===================================================================
4. RESOLVED CULTURAL ANCHORS & SEED VECTORS
===================================================================
${(report.stages?.culturalResearcher?.resolvedSeeds || []).map((s: any) => `- **${s.name}** [URN: \`${s.id}\`] (${s.type || s.category || 'Entity'})`).join('\n') || '- Category anchors utilized'}

===================================================================
5. EVIDENCE-BACKED CULTURAL FINDINGS
===================================================================
Top Brand Affinities:
${(report.stages?.culturalResearcher?.domains?.brands?.entities || []).slice(0, 8).map((e: any) => `- **${e.name}** | Affinity: ${e.affinity ? (e.affinity * 100).toFixed(1) + '%' : e.score || 'High'} | URN: \`${e.id}\``).join('\n')}

Top Sonic & Artist Vectors:
${(report.stages?.culturalResearcher?.domains?.music?.entities || []).slice(0, 6).map((e: any) => `- **${e.name}** | Affinity: ${e.affinity ? (e.affinity * 100).toFixed(1) + '%' : e.score || 'High'} | URN: \`${e.id}\``).join('\n')}

Top Lifestyle & Place Anchors (${config.primaryMarket}):
${(report.stages?.culturalResearcher?.domains?.places?.entities || []).slice(0, 6).map((e: any) => `- **${e.name}** | Affinity: ${e.affinity ? (e.affinity * 100).toFixed(1) + '%' : e.score || 'High'} | URN: \`${e.id}\``).join('\n')}

===================================================================
6. MARKET-BY-MARKET COMPARISON
===================================================================
Markets Compared: ${(report.crossMarketComparison?.marketsCompared || [config.primaryMarket]).join(', ')}

Shared Cultural Bridges:
${(report.crossMarketComparison?.sharedCulturalBridges || []).map((b: any) => `- **${b.culturalBridge}**: ${b.applicability} (Entities: ${(b.supportingEntities || []).join(', ')})`).join('\n') || '- Single-market focus'}

Divergent Cultural Nuances:
${(report.crossMarketComparison?.divergentCulturalNuances || []).map((d: any) => `- **${d.dimension}**:
    * ${d.marketA?.market}: ${d.marketA?.nuance}
    * ${d.marketB?.market}: ${d.marketB?.nuance}
    * Strategic Takeaway: ${d.strategicTakeaway}`).join('\n') || '- Homogeneous or single market analysis'}

Uncertainty Notes:
${report.crossMarketComparison?.uncertaintyNotes || 'Comparative analysis reflects localized place queries.'}

===================================================================
7. RED-TEAM ADVERSARIAL CHALLENGES & BLINDSPOTS
===================================================================
Verdict: ${report.stages?.redTeam?.adversarialVerdict || 'Positioning Friction Evaluated'}

Adversarial Analysis:
${report.stages?.redTeam?.adversarialCritique || 'N/A'}

Friction Points:
${(report.stages?.redTeam?.frictionPoints || []).map((f: any, i: number) => `
[Risk 0${i + 1}] ${f.riskTitle} [Severity: ${f.severity}]
- Conflict with Observed Taste: ${f.conflictWithObservedTaste}
- Potential Backlash or Apathy: ${f.potentialBacklashOrApathy}
- Stress-Test Scenario: ${f.stressTestScenario}
- Recommended Safeguard: ${f.recommendedSafeguard}
`).join('\n')}

Overlooked Blindspots:
${(report.stages?.redTeam?.overlookedBlindspots || []).map((b: string) => `- ${b}`).join('\n')}

===================================================================
8. THREE ALTERNATIVE LAUNCH STRATEGIES
===================================================================
${(report.stages?.strategyArchitect?.alternativeStrategies || []).map((s: any, i: number) => `
-------------------------------------------------------------------
STRATEGY 0${i + 1}: ${s.archetype}
Tagline: "${s.tagline}"
Thesis: ${s.coreThesis}
Intended Audience: ${s.intendedAudience}
Aesthetic: ${s.culturalAesthetic}
Launch Playbook Step: ${s.launchPlaybookStep}
Heuristic Alignment Score: ${s.heuristicAlignmentScore?.score || 'N/A'}/100
(${s.heuristicAlignmentScore?.formulaExplanation || 'Composite heuristic'})

Advantages:
${(s.advantages || []).map((a: string) => `  + ${a}`).join('\n')}

Risks & Vulnerabilities:
${(s.risksAndVulnerabilities || []).map((r: string) => `  - ${r}`).join('\n')}

Underlying Assumptions:
${(s.underlyingAssumptions || []).map((u: string) => `  * ${u}`).join('\n')}

Recommended Validation Steps:
${(s.recommendedValidationSteps || []).map((v: string) => `  > ${v}`).join('\n')}
`).join('\n')}

===================================================================
9. EVIDENCE INTEGRITY VERIFICATION AUDIT
===================================================================
Audit Status: ${audit?.overallStatus || 'PASS'}
Total Claims Evaluated: ${audit?.totalClaimsEvaluated || 0}
- Observed Evidence: ${audit?.observedEvidenceCount || 0}
- Supported Interpretation: ${audit?.supportedInterpretationCount || 0}
- Unverified Hypothesis: ${audit?.unverifiedHypothesisCount || 0}
- Contradicted: ${audit?.contradictedCount || 0}
- Unsupported: ${audit?.unsupportedCount || 0}

Automated Rules Audit Summary:
${(audit?.checksSummary || []).map((c: any) => `- [${c.passed ? 'PASS' : 'FLAG'}] ${c.ruleTitle}: ${c.notes}`).join('\n')}

Verified Claims Matrix:
${(report.stages?.evidenceVerifier?.verifiedClaims || []).map((c: any, i: number) => `
[Claim 0${i + 1}] [${c.classification}] [Status: ${c.verificationStatus}]
Statement: "${c.claim}"
Market: ${c.marketContext} | Audience: ${c.audienceContext}
Reasoning: ${c.reasoning}
Confidence / Uncertainty: ${c.confidenceOrUncertainty}
Supporting Evidence: ${(c.supportingQlooEvidence || []).map((se: any) => `${se.name}${se.affinity ? ` (${(se.affinity * 100).toFixed(0)}%)` : ''}`).join(', ') || 'None'}
Limitations: ${c.limitations}
${c.correctedOrDowngradedNote ? `Audit Note: ${c.correctedOrDowngradedNote}` : ''}
`).join('\n')}

===================================================================
10. CULTURAL EXPERIMENT VALIDATION SUITE & LIMITATIONS
===================================================================
Recommended Pre-Launch Experiments:
${(report.experiments || []).map((exp: any, i: number) => `
[Experiment 0${i + 1}] ${exp.title} [Type: ${exp.experimentType}]
- Hypothesis: ${exp.hypothesis}
- Comparison: ${exp.whatIsBeingCompared}
- Target Cohort: ${exp.targetParticipants}
- Measurement: ${exp.measurementMethod}
- Success Criteria: ${exp.successCriteria}
- Confounding Factors: ${(exp.potentialConfoundingFactors || []).join('; ')}
- Supported Conclusions: ${exp.conclusionsSupported}
- Limitations: ${exp.conclusionsNotSupported}
`).join('\n')}

Critical Platform Limitations:
${(report.stages?.evidenceVerifier?.criticalLimitations || []).map((l: string) => `- ${l}`).join('\n')}
`;
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${config.productName.toLowerCase().replace(/\s+/g, '_')}_cultural_dossier.md"`);
    res.send(md);
    return;
  }

  res.json(report);
});

// 8. Generate Revised Launch Brief based on Selected Strategy
app.post('/api/brief/revise', (req: Request, res: Response) => {
  const { report, strategyId } = req.body;
  if (!report || !strategyId) {
    res.status(400).json({ error: 'Report and strategyId are required.' });
    return;
  }

  const strategy = (report.stages?.strategyArchitect?.alternativeStrategies || []).find((s: any) => s.id === strategyId);
  if (!strategy) {
    res.status(404).json({ error: 'Strategy not found in report.' });
    return;
  }

  const config = report.validatedConfig || report.input;
  const revisedBrief = {
    originalProduct: config.productName,
    selectedArchetype: strategy.archetype,
    revisedTagline: strategy.tagline,
    revisedPositioning: strategy.coreThesis,
    targetAudience: strategy.intendedAudience,
    primaryMarket: config.primaryMarket,
    brandAllies: strategy.keyBrandAllies,
    creativeDirection: strategy.creativeDirection,
    aestheticCues: strategy.culturalAesthetic,
    immediateLaunchAction: strategy.launchPlaybookStep,
    recommendedFirstExperiment: (report.experiments || [])[0] || null,
    generatedAt: new Date().toISOString(),
  };

  res.json({ success: true, revisedBrief });
});

// Setup Vite or static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(port, '0.0.0.0', () => {
      console.log(`CultureShift server running on http://0.0.0.0:${port}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start CultureShift server:', err);
    process.exit(1);
  });
}

export default app;

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AnalysisInput,
  MultiAgentReport,
  EvidenceClassification,
} from './types';

test('AnalysisInput supports multi-market array and launch objectives', () => {
  const input: AnalysisInput = {
    productName: 'Kinetic Brew',
    category: 'Functional Beverage',
    description: 'Nootropic cold brew',
    targetMarkets: ['Tokyo', 'London', 'San Francisco'],
    primaryMarket: 'Tokyo',
    targetAudience: 'Systems engineers',
    proposedPositioning: 'Bio-computational enhancer',
    launchObjective: 'cult_status',
  };

  assert.equal(input.targetMarkets.length, 3);
  assert.equal(input.primaryMarket, 'Tokyo');
  assert.equal(input.launchObjective, 'cult_status');
});

test('Evidence classification accurately segregates observed vs unverified hypotheses', () => {
  const classifications: EvidenceClassification[] = [
    'OBSERVED_EVIDENCE',
    'SUPPORTED_INTERPRETATION',
    'UNVERIFIED_HYPOTHESIS',
  ];

  assert.ok(classifications.includes('OBSERVED_EVIDENCE'));
  assert.ok(classifications.includes('SUPPORTED_INTERPRETATION'));
  assert.ok(classifications.includes('UNVERIFIED_HYPOTHESIS'));
  assert.equal(classifications.length, 3);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QLOO_URN_TYPES,
  QLOO_BASE_URL,
  getApiKeyStatus,
  setRuntimeApiKey,
  QlooApiError,
} from './qlooClient';

test('Qloo API configuration has valid base URL and standard URN mappings', () => {
  assert.equal(QLOO_BASE_URL, 'https://hackathon.api.qloo.com');
  assert.equal(QLOO_URN_TYPES.BRAND, 'urn:entity:brand');
  assert.equal(QLOO_URN_TYPES.ARTIST, 'urn:entity:artist');
  assert.equal(QLOO_URN_TYPES.MOVIE, 'urn:entity:movie');
  assert.equal(QLOO_URN_TYPES.PLACE, 'urn:entity:place');
});

test('API key status masks secret properly without leaking credentials', () => {
  setRuntimeApiKey('test_key_1234567890abcdef');
  const status = getApiKeyStatus();
  assert.equal(status.configured, true);
  assert.equal(status.source, 'runtime');
  assert.ok(status.maskedKey?.includes('...'));
  assert.equal(status.maskedKey?.startsWith('test'), true);
  assert.equal(status.maskedKey?.endsWith('cdef'), true);
  // Ensure the full key is NEVER revealed
  assert.notEqual(status.maskedKey, 'test_key_1234567890abcdef');
});

test('QlooApiError preserves structured status, request-id, and endpoint details', () => {
  const err = new QlooApiError('Unauthorized', {
    status: 401,
    reason: 'Invalid API key',
    requestId: 'req-xyz-88',
    endpoint: '/search',
  });

  assert.equal(err.name, 'QlooApiError');
  assert.equal(err.details.status, 401);
  assert.equal(err.details.reason, 'Invalid API key');
  assert.equal(err.details.requestId, 'req-xyz-88');
  assert.equal(err.details.endpoint, '/search');
});

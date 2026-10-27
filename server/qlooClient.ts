/**
 * Server-Side Qloo Taste AI API Client
 * Official Hackathon Endpoint Integration
 * Base URL: https://hackathon.api.qloo.com
 * Auth Header: X-Api-Key
 */

import { QlooEntity, QlooSearchResponse, QlooInsightsResponse } from './types';

export const QLOO_BASE_URL = 'https://hackathon.api.qloo.com';

// Supported Entity URNs documented by Qloo
export const QLOO_URN_TYPES = {
  BRAND: 'urn:entity:brand',
  ARTIST: 'urn:entity:artist',
  MOVIE: 'urn:entity:movie',
  PLACE: 'urn:entity:place',
  BOOK: 'urn:entity:book',
  PODCAST: 'urn:entity:podcast',
} as const;

let inMemoryApiKey: string | null = null;

export function getQlooApiKey(): string | null {
  return inMemoryApiKey || process.env.QLOO_API_KEY || null;
}

export function setRuntimeApiKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) {
    inMemoryApiKey = trimmed;
    process.env.QLOO_API_KEY = trimmed;
  }
}

export function getApiKeyStatus(): {
  configured: boolean;
  maskedKey: string | null;
  source: 'env' | 'runtime' | 'none';
} {
  const key = getQlooApiKey();
  if (!key) {
    return { configured: false, maskedKey: null, source: 'none' };
  }
  const masked = key.length > 8 
    ? `${key.slice(0, 4)}...${key.slice(-4)}` 
    : '****';
  return {
    configured: true,
    maskedKey: masked,
    source: inMemoryApiKey ? 'runtime' : 'env',
  };
}

export interface QlooErrorDetails {
  status?: number;
  message?: string;
  reason?: string;
  requestId?: string;
  endpoint?: string;
}

export class QlooApiError extends Error {
  public details: QlooErrorDetails;

  constructor(message: string, details: QlooErrorDetails) {
    super(message);
    this.name = 'QlooApiError';
    this.details = details;
  }
}

/**
 * Executes a verified GET request to the Qloo API with headers and timeout
 */
async function fetchQloo<T>(endpoint: string, params: Record<string, string | number | undefined>): Promise<{
  data: T;
  latencyMs: number;
  requestId?: string;
}> {
  const apiKey = getQlooApiKey();
  if (!apiKey) {
    throw new QlooApiError('QLOO_API_KEY is not configured on the server.', {
      status: 401,
      reason: 'No API key configured',
      endpoint,
    });
  }

  const url = new URL(`${QLOO_BASE_URL}${endpoint}`);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.append(key, String(val));
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  const startTime = Date.now();

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startTime;
    clearTimeout(timeoutId);

    const requestId = res.headers.get('x-qloo-request-id') || undefined;

    if (!res.ok) {
      let errorBody: { error?: { reason?: string; message?: string; code?: number } } | string | null = null;
      try {
        const text = await res.text();
        try {
          errorBody = JSON.parse(text);
        } catch {
          errorBody = text;
        }
      } catch {
        errorBody = null;
      }

      const msg = typeof errorBody === 'object' && errorBody?.error?.message
        ? errorBody.error.message
        : `Qloo API request failed with status ${res.status} (${res.statusText})`;

      const reason = typeof errorBody === 'object' && errorBody?.error?.reason
        ? errorBody.error.reason
        : (typeof errorBody === 'string' ? errorBody : undefined);

      throw new QlooApiError(msg, {
        status: res.status,
        message: msg,
        reason,
        requestId,
        endpoint: url.pathname,
      });
    }

    const data = await res.json() as T;
    return { data, latencyMs, requestId };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof QlooApiError) {
      throw err;
    }
    const isTimeout = (err as { name?: string })?.name === 'AbortError';
    throw new QlooApiError(
      isTimeout ? 'Qloo API request timed out after 12s.' : (err as Error).message || 'Network error communicating with Qloo API.',
      {
        message: (err as Error).message,
        reason: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        endpoint,
      }
    );
  }
}

/**
 * Resolves a natural-language query to canonical Qloo entities
 * Endpoint: GET /search
 */
export async function searchEntities(
  query: string,
  types?: string
): Promise<{
  results: QlooEntity[];
  latencyMs: number;
  requestId?: string;
}> {
  if (!query || !query.trim()) {
    return { results: [], latencyMs: 0 };
  }

  const { data, latencyMs, requestId } = await fetchQloo<any>('/search', {
    query: query.trim(),
    types: types || undefined,
  });

  const rawList = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data?.results?.entities)
    ? data.results.entities
    : [];

  const results: QlooEntity[] = rawList.map((item: any) => ({
    id: item.entity_id || item.id || item.urn || `entity-${Math.random()}`,
    name: item.name || 'Unnamed Entity',
    type: item.subtype || item.type,
    category: item.tags?.find((t: any) => t.type?.includes('segment') || t.type?.includes('category'))?.name || item.subtype || item.type,
    properties: {
      popularity: item.properties?.popularity,
      image_url: item.properties?.image_url,
      description: item.properties?.description,
      tags: item.tags,
    },
    affinity: item.query?.affinity ?? item.affinity ?? item.score,
    score: item.score ?? (item.query?.affinity ? Math.round(item.query.affinity * 100) : undefined),
  }));

  return { results, latencyMs, requestId };
}

/**
 * Fetches cross-domain cultural insights given seed entity IDs
 * Endpoint: GET /v2/insights
 */
export async function getInsights(params: {
  entityIds: string[];
  targetType: string;
  take?: number;
  location?: string;
  maxPopularity?: number;
}): Promise<{
  results: QlooEntity[];
  latencyMs: number;
  requestId?: string;
}> {
  if (!params.entityIds || params.entityIds.length === 0) {
    return { results: [], latencyMs: 0 };
  }

  const entitiesParam = params.entityIds.join(',');

  const { data, latencyMs, requestId } = await fetchQloo<any>('/v2/insights', {
    'signal.interests.entities': entitiesParam,
    'filter.type': params.targetType,
    'take': params.take ?? 10,
    'filter.location.query': params.location || undefined,
    'filter.popularity.max': params.maxPopularity !== undefined ? params.maxPopularity : undefined,
  });

  const rawList = Array.isArray(data?.results?.entities)
    ? data.results.entities
    : Array.isArray(data?.results)
    ? data.results
    : [];

  const results: QlooEntity[] = rawList.map((item: any) => ({
    id: item.entity_id || item.id || item.urn || `ins-${Math.random()}`,
    name: item.name || 'Unnamed Entity',
    type: item.subtype || item.type,
    category:
      item.tags?.find((t: any) => t.type?.includes('segment') || t.type?.includes('industry'))?.name ||
      item.subtype ||
      item.type,
    properties: {
      popularity: item.properties?.popularity,
      image_url: item.properties?.image_url,
      description: item.properties?.description,
      tags: item.tags,
    },
    affinity: item.query?.affinity ?? item.affinity,
    score: item.query?.affinity ? Math.round(item.query.affinity * 100) : item.score,
  }));

  return { results, latencyMs, requestId };
}

/**
 * Health check that executes an actual request against /search
 * NEVER fakes a success if the request fails
 */
export async function verifyConnection(): Promise<{
  success: boolean;
  status: number;
  latencyMs: number;
  requestId?: string;
  sampleEntity?: string;
  error?: string;
  details?: QlooErrorDetails;
}> {
  const apiKey = getQlooApiKey();
  if (!apiKey) {
    return {
      success: false,
      status: 401,
      latencyMs: 0,
      error: 'QLOO_API_KEY is not configured on the server.',
    };
  }

  try {
    const { results, latencyMs, requestId } = await searchEntities('Nike', QLOO_URN_TYPES.BRAND);
    const sample = results[0]?.name || 'Connected (0 results for probe)';
    return {
      success: true,
      status: 200,
      latencyMs,
      requestId,
      sampleEntity: sample,
    };
  } catch (err: unknown) {
    if (err instanceof QlooApiError) {
      return {
        success: false,
        status: err.details.status || 500,
        latencyMs: 0,
        requestId: err.details.requestId,
        error: err.message,
        details: err.details,
      };
    }
    return {
      success: false,
      status: 500,
      latencyMs: 0,
      error: (err as Error).message || 'Failed to verify Qloo connection',
    };
  }
}

import { log } from './utils.js';

export interface ApiRequestOptions {
  // Abort the request if no response is received within this many milliseconds. Without this, a
  // registry or file host that accepts the connection but never responds hangs sync()/install()/
  // clone() forever - there is no other timeout anywhere in the request path.
  timeoutMs?: number;
  // Number of additional attempts after the first, for retryable failures only (see isRetryable).
  retries?: number;
  // Base delay before the first retry; doubles on each subsequent attempt.
  retryDelayMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY_MS = 300;

// Thrown for a non-2xx HTTP response, as opposed to a network-level failure (DNS, connection
// reset, our own timeout abort) which surfaces as whatever error fetch()/AbortController itself
// throws. Kept as a distinct type (`status` field) so isRetryable() below - and callers that want
// to - can tell "the server answered but refused/failed the request" apart from "we couldn't
// reach a server at all".
export class ApiHttpError extends Error {
  status: number;
  constructor(status: number, statusText: string, url: string) {
    super(`Request failed: ${status} ${statusText} (${url})`);
    this.status = status;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retries only cover failures that are plausibly transient: network-level errors (including our
// own timeout abort) and 5xx server responses. A 4xx fails identically on every attempt - e.g.
// clone()'s "template not found" or a malformed registry url - so retrying it would only delay
// surfacing a real, permanent error to the caller.
function isRetryable(error: unknown): boolean {
  if (error instanceof ApiHttpError) return error.status >= 500;
  return true;
}

async function apiFetch(url: string, options: ApiRequestOptions = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, retryDelayMs = DEFAULT_RETRY_DELAY_MS } = options;
  log('⤓', url);

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new ApiHttpError(res.status, res.statusText, url);
      return res;
    } catch (err) {
      const isAbort = Boolean(err) && typeof err === 'object' && (err as { name?: string }).name === 'AbortError';
      const error = isAbort ? new Error(`Request timed out after ${timeoutMs}ms (${url})`) : err;
      if (attempt >= retries || !isRetryable(error)) throw error;
      await delay(retryDelayMs * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
}

export async function apiBuffer(url: string, options?: ApiRequestOptions): Promise<ArrayBuffer> {
  return (await apiFetch(url, options)).arrayBuffer();
}

export async function apiJson(url: string, options?: ApiRequestOptions): Promise<any> {
  return (await apiFetch(url, options)).json();
}

export async function apiText(url: string, options?: ApiRequestOptions): Promise<string> {
  return (await apiFetch(url, options)).text();
}

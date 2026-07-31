import { afterEach, expect, test, vi } from 'vitest';
import { apiBuffer, apiJson, apiText } from '../../src/helpers/api';

const API_URL: string = 'https://jsonplaceholder.typicode.com/todos/1';
const API_TEXT: string = `{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}`;
const API_JSON: object = {
  userId: 1,
  id: 1,
  title: 'delectus aut autem',
  completed: false,
};
const API_BUFFER: ArrayBuffer = new Uint16Array([
  123, 10, 32, 32, 34, 117, 115, 101, 114, 73, 100, 34, 58, 32, 49, 44, 10, 32, 32, 34, 105, 100, 34, 58, 32, 49, 44,
  10, 32, 32, 34, 116, 105, 116, 108, 101, 34, 58, 32, 34, 100, 101, 108, 101, 99, 116, 117, 115, 32, 97, 117, 116, 32,
  97, 117, 116, 101, 109, 34, 44, 10, 32, 32, 34, 99, 111, 109, 112, 108, 101, 116, 101, 100, 34, 58, 32, 102, 97, 108,
  115, 101, 10, 125,
]).buffer;

test('Get plain text', async () => {
  expect(await apiText(API_URL)).toEqual(API_TEXT);
});

test('Get json', async () => {
  expect(await apiJson(API_URL)).toEqual(API_JSON);
});

test('Get raw buffer', async () => {
  expect(await apiBuffer(API_URL)).toEqual(API_BUFFER);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('Retries once on a transient network failure then succeeds', async () => {
  const fetchMock = vi
    .fn()
    .mockRejectedValueOnce(new Error('socket hang up'))
    .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);

  const result = await apiJson('https://example.invalid/retry', { retryDelayMs: 1 });
  expect(result).toEqual({ ok: true });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('Does not retry a 4xx response', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('Not Found', { status: 404, statusText: 'Not Found' }));
  vi.stubGlobal('fetch', fetchMock);

  await expect(apiJson('https://example.invalid/missing', { retryDelayMs: 1 })).rejects.toThrow(
    'Request failed: 404 Not Found',
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('Retries a 5xx response and gives up after exhausting retries', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('Boom', { status: 503, statusText: 'Service Unavailable' }));
  vi.stubGlobal('fetch', fetchMock);

  await expect(apiJson('https://example.invalid/flaky', { retries: 2, retryDelayMs: 1 })).rejects.toThrow(
    'Request failed: 503',
  );
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

test('Aborts and reports a timeout if the response never arrives', async () => {
  const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
    return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        const err = new Error('The operation was aborted');
        err.name = 'AbortError';
        reject(err);
      });
    });
  });
  vi.stubGlobal('fetch', fetchMock);

  await expect(apiText('https://example.invalid/slow', { timeoutMs: 10, retries: 0 })).rejects.toThrow(
    'Request timed out after 10ms',
  );
});

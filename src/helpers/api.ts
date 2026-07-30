import { log } from './utils.js';

async function apiFetch(url: string): Promise<Response> {
  log('⤓', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText} (${url})`);
  return res;
}

export async function apiBuffer(url: string): Promise<ArrayBuffer> {
  return (await apiFetch(url)).arrayBuffer();
}

export async function apiJson(url: string): Promise<any> {
  return (await apiFetch(url)).json();
}

export async function apiText(url: string): Promise<string> {
  return (await apiFetch(url)).text();
}

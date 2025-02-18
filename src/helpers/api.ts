import { log } from './utils.js';

export async function apiBuffer(url: string): Promise<ArrayBuffer> {
  log('⤓', url);
  return fetch(url).then((res: Response) => res.arrayBuffer());
}

export async function apiJson(url: string): Promise<any> {
  log('⤓', url);
  return fetch(url).then((res: Response) => res.json());
}

export async function apiText(url: string): Promise<string> {
  log('⤓', url);
  return fetch(url).then((res: Response) => res.text());
}

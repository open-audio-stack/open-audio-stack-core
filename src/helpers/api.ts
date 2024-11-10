export async function apiBuffer(url: string): Promise<ArrayBuffer> {
  console.log('⤓', url);
  return fetch(url).then((res: Response) => res.arrayBuffer());
}

export async function apiJson(url: string): Promise<any> {
  console.log('⤓', url);
  return fetch(url).then((res: Response) => res.json());
}

export async function apiText(url: string): Promise<string> {
  console.log('⤓', url);
  return fetch(url).then((res: Response) => res.text());
}

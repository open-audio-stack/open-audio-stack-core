export interface PlatformType {
  description: string;
  id: PlatformId;
  name: string;
}

export enum PlatformId {
  Macintosh = 'mac',
  Linux = 'linux',
  Windows = 'win',
}

export const platforms: PlatformType[] = [
  {
    description: 'Operating system designed and sold by Apple, and is known for its ease of use.',
    id: PlatformId.Macintosh,
    name: 'Macintosh',
  },
  {
    description: 'Open-source operating system. One of the most widely used for IT computers and servers.',
    id: PlatformId.Linux,
    name: 'Linux',
  },
  {
    description: 'Most popular home operating system, preloaded on most new personal computers.',
    id: PlatformId.Windows,
    name: 'Windows',
  },
];

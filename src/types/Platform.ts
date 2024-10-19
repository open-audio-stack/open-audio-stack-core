export enum Platform {
  Macintosh = 'mac',
  Linux = 'linux',
  Windows = 'win',
}

export interface PlatformOption {
  description: string;
  value: Platform;
  name: string;
}

export const platforms: PlatformOption[] = [
  {
    description: 'Operating system designed and sold by Apple, and is known for its ease of use.',
    value: Platform.Macintosh,
    name: 'Macintosh',
  },
  {
    description: 'Open-source operating system. One of the most widely used for IT computers and servers.',
    value: Platform.Linux,
    name: 'Linux',
  },
  {
    description: 'Most popular home operating system, preloaded on most new personal computers.',
    value: Platform.Windows,
    name: 'Windows',
  },
];

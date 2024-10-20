export enum SystemType {
  Macintosh = 'mac',
  Linux = 'linux',
  Windows = 'win',
}

export interface SystemTypeOption {
  description: string;
  value: SystemType;
  name: string;
}

export const systemTypes: SystemTypeOption[] = [
  {
    description: 'Open-source operating system. One of the most widely used for IT computers and servers.',
    value: SystemType.Linux,
    name: 'Linux',
  },
  {
    description: 'Operating system designed and sold by Apple, and is known for its ease of use.',
    value: SystemType.Macintosh,
    name: 'Macintosh',
  },
  {
    description: 'Most popular home operating system, preloaded on most new personal computers.',
    value: SystemType.Windows,
    name: 'Windows',
  },
];

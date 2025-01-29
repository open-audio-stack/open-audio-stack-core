export enum SystemType {
  Mac = 'mac',
  Linux = 'linux',
  Win = 'win',
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
    value: SystemType.Mac,
    name: 'Mac',
  },
  {
    description: 'Most popular home operating system, preloaded on most new personal computers.',
    value: SystemType.Win,
    name: 'Windows',
  },
];

export enum PresetType {
  Sound = 'sound',
}

export interface PresetTypeOption {
  description: string;
  value: PresetType;
  name: string;
}

// TODO define preset types.

export const presetTypes: PresetTypeOption[] = [
  {
    description: 'Preset for sounds',
    value: PresetType.Sound,
    name: 'Sound',
  },
];

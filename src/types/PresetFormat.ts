export enum PresetFormat {
  AU = 'aupreset',
  NativeInstruments = 'nksf',
  VST = 'fxp',
  VSTLegacy = 'fxb',
  VST3 = 'vstpreset',
}

export interface PresetFormatOption {
  description: string;
  value: PresetFormat;
  name: string;
}

export const presetFormats: PresetFormatOption[] = [
  {
    description: "Apple's proprietary plugin format for macOS and iOS.",
    value: PresetFormat.AU,
    name: 'Audio Unit preset',
  },
  {
    description: 'Used by Native Instruments for their software instruments and effects.',
    value: PresetFormat.NativeInstruments,
    name: 'Native Instruments preset',
  },
  {
    description: 'Standard preset format for VST plugins, allowing users to save and load settings.',
    value: PresetFormat.VST,
    name: 'VST preset',
  },
  {
    description: 'Legacy preset format for older versions of VSTs.',
    value: PresetFormat.VSTLegacy,
    name: 'VST Legacy preset',
  },
  {
    description: 'Preset format for VST3 plugins including new features.',
    value: PresetFormat.VST3,
    name: 'VST3 preset',
  },
];

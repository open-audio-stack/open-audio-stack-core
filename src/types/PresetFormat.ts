export enum PresetFormat {
  AudioUnits = 'aupreset',
  AvidAudioExtension = 'tfx',
  CleverAudioPlugin = 'clap',
  LADSPAVersion2 = 'lv2',
  NativeInstruments = 'nksf',
  RealTimeAudioSuite = 'rtas',
  SoundFont2 = 'preset.sf2',
  SFZ = 'preset.sfz',
  TimeDivisionMultiplexing = 'tdm',
  VSTBank = 'fxb',
  VSTPreset = 'fxp',
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
    value: PresetFormat.AudioUnits,
    name: 'Audio Unit preset',
  },
  {
    description: "Avid's plugin format for Pro Tools, offering deep integration.",
    value: PresetFormat.AvidAudioExtension,
    name: 'Avid Audio preset',
  },
  {
    description: 'Modern open-source plugin format designed for performance and flexibility.',
    value: PresetFormat.CleverAudioPlugin,
    name: 'Clever Audio preset',
  },
  {
    description: 'Linux-friendly plugin format primarily used in open-source environments.',
    value: PresetFormat.LADSPAVersion2,
    name: 'LADSPA Version 2 preset',
  },
  {
    description: 'Used by Native Instruments for their software instruments and effects.',
    value: PresetFormat.NativeInstruments,
    name: 'Native Instruments preset',
  },
  {
    description: "Real-time plugin format used in Avid's Pro Tools.",
    value: PresetFormat.RealTimeAudioSuite,
    name: 'Real-Time AudioSuite preset',
  },
  {
    description: 'Widely used format for sound samples in musical instruments.',
    value: PresetFormat.SoundFont2,
    name: 'SoundFont 2 preset',
  },
  {
    description: 'An open standard for defining instrument patches and sound samples.',
    value: PresetFormat.SFZ,
    name: 'SFZ preset',
  },
  {
    description: 'Legacy plugin format used in early Pro Tools systems.',
    value: PresetFormat.TimeDivisionMultiplexing,
    name: 'Time-Division-Multiplexing preset',
  },
  {
    description: 'Standard bank preset format for VST plugins.',
    value: PresetFormat.VSTBank,
    name: 'Virtual Studio Technology bank preset',
  },
  {
    description: 'Standard preset format for VST plugins, allowing users to save and load settings.',
    value: PresetFormat.VSTPreset,
    name: 'Virtual Studio Technology preset',
  },
  {
    description: 'Preset format for VST3 plugins including new features.',
    value: PresetFormat.VST3,
    name: 'Virtual Studio Technology 3 preset',
  },
];

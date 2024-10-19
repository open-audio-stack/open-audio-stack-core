export enum PluginFormat {
  AudioUnits = 'component',
  AvidAudioExtension = 'aax',
  CleverAudioPlugin = 'clap',
  RealTimeAudioSuite = 'rta',
  LADSPAVersion2 = 'lv2',
  SoundFont2 = 'sf2',
  SFZ = 'sfz',
  TimeDivisionMultiplexing = 'tdm',
  VSTLinux = 'so',
  VSTMac = 'vst',
  VSTWin = 'dll',
  VST3 = 'vst3',
}

export interface PluginFormatOption {
  description: string;
  value: PluginFormat;
  name: string;
}

export const pluginFormats: PluginFormatOption[] = [
  {
    description: "Apple's proprietary plugin format for macOS and iOS.",
    value: PluginFormat.AudioUnits,
    name: 'Audio Units',
  },
  {
    description: "Avid's plugin format for Pro Tools, offering deep integration.",
    value: PluginFormat.AvidAudioExtension,
    name: 'Avid Audio Extension',
  },
  {
    description: 'Modern open-source plugin format designed for performance and flexibility.',
    value: PluginFormat.CleverAudioPlugin,
    name: 'Clever Audio Plugin',
  },
  {
    description: "Real-time plugin format used in Avid's Pro Tools.",
    value: PluginFormat.RealTimeAudioSuite,
    name: 'Real-Time AudioSuite',
  },
  {
    description: 'Linux-friendly plugin format primarily used in open-source environments.',
    value: PluginFormat.LADSPAVersion2,
    name: 'LADSPA Version 2',
  },
  {
    description: 'Widely used format for sound samples in musical instruments.',
    value: PluginFormat.SoundFont2,
    name: 'SoundFont 2',
  },
  {
    description: 'An open standard for defining instrument patches and sound samples.',
    value: PluginFormat.SFZ,
    name: 'SFZ',
  },
  {
    description: 'Legacy plugin format used in early Pro Tools systems.',
    value: PluginFormat.TimeDivisionMultiplexing,
    name: 'Time-Division-Multiplexing',
  },
  {
    description: 'Linux version of the VST plugin format for audio effects and instruments.',
    value: PluginFormat.VSTLinux,
    name: 'Virtual Studio Technology (Linux)',
  },
  {
    description: 'Mac version of the VST plugin format used in DAWs like Logic and Ableton.',
    value: PluginFormat.VSTMac,
    name: 'Virtual Studio Technology (Mac)',
  },
  {
    description: 'Windows version of the VST plugin format for digital audio workstations.',
    value: PluginFormat.VSTWin,
    name: 'Virtual Studio Technology (Win)',
  },
  {
    description: 'Third-generation VST format, offering better performance and features.',
    value: PluginFormat.VST3,
    name: 'Virtual Studio Technology 3',
  },
];

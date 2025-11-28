export enum PluginFormat {
  AudioUnits = 'component',
  AvidAudioExtension = 'aax',
  CleverAudioPlugin = 'clap',
  JesuSonicPlugin = 'jsfx',
  LADSPAVersion2 = 'lv2',
  LinuxStandalone = 'elf',
  MacStandalone = 'app',
  RealTimeAudioSuite = 'rta',
  SFZ = 'sfz',
  SoundFont2 = 'sf2',
  TimeDivisionMultiplexing = 'tdm',
  VSTLinux = 'so',
  VSTMac = 'vst',
  VSTWin = 'dll',
  VST3 = 'vst3',
  WinStandalone = 'exe',
}

export type PluginFormatDir = {
  [format in PluginFormat]: string;
};

export const pluginFormatDir: PluginFormatDir & { '': string } = {
  [PluginFormat.AudioUnits]: 'Components',
  [PluginFormat.AvidAudioExtension]: 'Avid',
  [PluginFormat.CleverAudioPlugin]: 'Clap',
  [PluginFormat.JesuSonicPlugin]: 'Jsfx',
  [PluginFormat.LADSPAVersion2]: 'Lv2',
  [PluginFormat.LinuxStandalone]: 'Elf',
  [PluginFormat.MacStandalone]: 'App',
  [PluginFormat.RealTimeAudioSuite]: 'Rta',
  [PluginFormat.SFZ]: 'Sfz',
  [PluginFormat.SoundFont2]: 'Sf2',
  [PluginFormat.TimeDivisionMultiplexing]: 'Tdm',
  [PluginFormat.VST3]: 'VST3',
  [PluginFormat.VSTLinux]: 'VST',
  [PluginFormat.VSTMac]: 'VST',
  [PluginFormat.VSTWin]: 'VST',
  [PluginFormat.WinStandalone]: 'Exe',
  '': 'App',
};

export interface PluginFormatOption {
  description: string;
  value: PluginFormat;
  name: string;
  players?: string[];
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
    description: 'Simple text files which become full featured plug-ins when loaded.',
    value: PluginFormat.JesuSonicPlugin,
    name: 'Jesusonic Plugin',
    players: ['joepvanlier/ysfx'],
  },
  {
    description: 'Linux-friendly plugin format primarily used in open-source environments.',
    value: PluginFormat.LADSPAVersion2,
    name: 'LADSPA Version 2',
  },
  {
    description: 'Linux standalone application.',
    value: PluginFormat.LinuxStandalone,
    name: 'Linux Standalone',
  },
  {
    description: 'MacOS standalone application.',
    value: PluginFormat.MacStandalone,
    name: 'MacOS Standalone',
  },
  {
    description: "Real-time plugin format used in Avid's Pro Tools.",
    value: PluginFormat.RealTimeAudioSuite,
    name: 'Real-Time AudioSuite',
  },
  {
    description: 'An open standard for defining instrument patches and sound samples.',
    value: PluginFormat.SFZ,
    name: 'SFZ',
    players: ['sfztools/sfizz'],
  },
  {
    description: 'Widely used format for sound samples in musical instruments.',
    value: PluginFormat.SoundFont2,
    name: 'SoundFont 2',
    players: ['birch-san/juicysfplugin'],
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
  {
    description: 'Windows standalone application.',
    value: PluginFormat.WinStandalone,
    name: 'Windows Standalone',
  },
];

import { File } from './File.js';
import { PackageVersion } from './Package.js';

export interface Plugin extends PackageVersion {
  files: Array<PluginFile>;
  type: PluginType;
}

export interface PluginFile extends File {
  formats: Array<PluginFormat>;
}

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

export enum PluginType {
  Effect = 'effect',
  Instrument = 'instrument',
  Preset = 'preset',
}

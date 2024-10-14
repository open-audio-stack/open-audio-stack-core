import { File } from './File.js';
import { PackageVersion } from './Package.js';

export interface Preset extends PackageVersion {
  files: Array<PresetFile>;
  plugins: PresetPlugins;
  type: PresetType;
}

export interface PresetFile extends File {
  formats: Array<PresetFormat>;
}

export enum PresetFormat {
  AU = 'aupreset',
  NativeInstruments = 'nksf',
  VST = 'fxp',
  VSTLegacy = 'fxb',
  VST3 = 'vstpreset',
}

export interface PresetPlugins {
  [slug: string]: string;
}

export enum PresetType {
  Sound = 'sound',
}

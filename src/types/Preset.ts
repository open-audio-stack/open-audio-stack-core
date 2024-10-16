import { FileType } from './File.js';
import { PackageVersion } from './Package.js';

export interface PresetType extends PackageVersion {
  files: Array<PresetFile>;
  plugins: PresetPlugins;
  type: PresetId;
}

export interface PresetFile extends FileType {
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

export enum PresetId {
  Sound = 'sound',
}

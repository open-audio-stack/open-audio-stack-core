import { FileInterface } from './File.js';
import { PackageVersion } from './Package.js';
import { PresetFormat } from './PresetFormat.js';
import { PresetType } from './PresetType.js';

export interface PresetInterface extends PackageVersion {
  files: PresetFile[];
  plugins: PresetPlugins;
  type: PresetType;
}

export interface PresetFile extends FileInterface {
  formats: PresetFormat[];
}

export interface PresetPlugins {
  [slug: string]: string;
}

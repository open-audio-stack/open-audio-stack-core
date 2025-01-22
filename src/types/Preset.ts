import { FileInterface } from './File.js';
import { PackageBase } from './Package.js';
import { PresetFormat } from './PresetFormat.js';
import { PresetType } from './PresetType.js';

export interface PresetInterface extends PackageBase {
  files: PresetFile[];
  plugins: PresetPlugins;
  type: PresetType;
}

export interface PresetFile extends FileInterface {
  contains: PresetFormat[];
}

export interface PresetPlugins {
  [slug: string]: string;
}

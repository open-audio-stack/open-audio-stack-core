import { FileInterface } from './File.js';
import { PackageBase } from './Package.js';
import { PresetFormat } from './PresetFormat.js';
import { PresetType } from './PresetType.js';
import { RegistryType } from './Registry.js';

export interface PresetInterface extends PackageBase {
  files: PresetFile[];
  [RegistryType.Plugins]: PresetPlugins;
  type: PresetType;
}

export interface PresetFile extends FileInterface {
  contains: PresetFormat[];
}

export interface PresetFileMap {
  [key: string]: PresetFile[];
}

export interface PresetPlugins {
  [slug: string]: string;
}

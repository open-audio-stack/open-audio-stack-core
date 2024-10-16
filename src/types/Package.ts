import { PluginType } from './Plugin.js';
import { PresetType } from './Preset.js';
import { ProjectType } from './Project.js';
import { LicenseId } from './License.js';

export interface PackageType {
  slug: string;
  version: string;
  versions: PackageVersions;
}

export interface PackageVersions {
  [version: string]: PackageVersionType;
}

export interface PackageVersion {
  author: string;
  changes: string;
  date: string;
  description: string;
  license: LicenseId;
  name: string;
  tags: Array<string>;
  url: string;
}

export type PackageVersionType = PluginType | PresetType | ProjectType;

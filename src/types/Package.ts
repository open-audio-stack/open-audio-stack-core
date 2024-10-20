import { PluginInterface } from './Plugin.js';
import { PresetInterface } from './Preset.js';
import { ProjectInterface } from './Project.js';
import { License } from './License.js';

export interface PackageInterface {
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
  license: License;
  name: string;
  tags: string[];
  url: string;
}

export type PackageVersionType = PluginInterface | PresetInterface | ProjectInterface;

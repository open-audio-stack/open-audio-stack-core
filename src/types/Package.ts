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
  [version: string]: PackageVersion;
}

export interface PackageBase {
  audio: string;
  author: string;
  changes: string;
  date: string;
  description: string;
  image: string;
  installed?: boolean;
  license: License;
  name: string;
  tags: string[];
  url: string;
}

export type PackageVersion = PluginInterface | PresetInterface | ProjectInterface;

export interface PackageValidationField {
  name: string;
  type: string;
}

export interface PackageValidationRec {
  field: string;
  rec: string;
}

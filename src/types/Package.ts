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

export type PackageVersionType = PluginInterface | PresetInterface | ProjectInterface;

export enum PackageValidation {
  MISSING_FIELD = 'missing-field',
  INVALID_TYPE = 'invalid-type',
  INVALID_VALUE = 'invalid-value',
}

export interface PackageValidationField {
  name: string;
  type: string;
}

export interface PackageValidationRec {
  field: string;
  rec: string;
}

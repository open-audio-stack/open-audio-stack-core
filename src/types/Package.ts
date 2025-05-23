import { PluginFile, PluginFileMap, PluginInterface } from './Plugin.js';
import { PresetFile, PresetFileMap, PresetInterface } from './Preset.js';
import { ProjectFile, ProjectFileMap, ProjectInterface } from './Project.js';
import { License } from './License.js';
import { ZodIssue } from 'zod';

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
  donate?: string;
  image: string;
  installed?: boolean;
  license: License;
  name: string;
  tags: string[];
  url: string;
}

export interface PackageVersionReport {
  errors?: ZodIssue[];
  recs?: PackageValidationRec[];
}

export interface PackageReport {
  [version: string]: PackageVersionReport;
}

export interface ManagerReport {
  [slug: string]: PackageReport;
}

export type PackageVersion = PluginInterface | PresetInterface | ProjectInterface;
export type PackageFile = PluginFile | PresetFile | ProjectFile;
export type PackageFileMap = PluginFileMap | PresetFileMap | ProjectFileMap;

export interface PackageValidationField {
  name: string;
  type: string;
}

export interface PackageValidationRec {
  field: string;
  rec: string;
}

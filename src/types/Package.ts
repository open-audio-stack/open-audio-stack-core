import { PluginFile, PluginFileMap, PluginInterface } from './Plugin.js';
import { PresetFile, PresetFileMap, PresetInterface } from './Preset.js';
import { ProjectFile, ProjectFileMap, ProjectInterface } from './Project.js';
import { License } from './License.js';
import { ZodIssue } from 'zod';

export interface PackageInterface {
  slug: string;
  version: string;
  versions: PackageVersions;
  // Rollup of every version's `downloads` (itself a rollup of that version's files) - i.e.
  // total downloads across all published versions of this package, all-time. Computed by
  // Package.getTotalDownloads(), not authored/committed data.
  downloads?: number;
}

export interface PackageVersions {
  [version: string]: PackageVersion;
}

export interface PackageBase {
  audio?: string;
  author: string;
  changes: string;
  date: string;
  description: string;
  donate?: string;
  // Rollup of this version's files[].downloads (sum across all files for this release).
  // Computed at registry build time - see packageDownloadsTotal() and downloads.ts.
  downloads?: number;
  image: string;
  installed?: boolean;
  license: License;
  name: string;
  tags: string[];
  url: string;
  verified?: boolean;
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

import { Plugin } from './Plugin.js';
import { Preset } from './Preset.js';
import { Project } from './Project.js';
import { License } from './Config.js';

export interface Package {
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
  tags: Array<string>;
  url: string;
}

export type PackageVersionType = Plugin | Preset | Project;

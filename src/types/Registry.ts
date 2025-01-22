import { PackageInterface } from './Package.js';

export interface RegistryInterface {
  name: string;
  url: string;
  version: string;
  [RegistryType.Plugins]?: RegistryPackages;
  [RegistryType.Presets]?: RegistryPackages;
  [RegistryType.Projects]?: RegistryPackages;
}

export enum RegistryType {
  Plugins = 'plugins',
  Presets = 'presets',
  Projects = 'projects',
}

export interface RegistryPackages {
  [slug: string]: PackageInterface;
}

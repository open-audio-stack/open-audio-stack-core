import { PackageInterface } from './Package.js';

export interface RegistryInterface {
  name: string;
  [RegistryType.Plugins]: RegistryPackages;
  [RegistryType.Presets]: RegistryPackages;
  [RegistryType.Projects]: RegistryPackages;
  url: string;
  version: string;
}

export enum RegistryType {
  Plugins = 'plugins',
  Presets = 'presets',
  Projects = 'projects',
}

export interface RegistryPackages {
  [slug: string]: PackageInterface;
}

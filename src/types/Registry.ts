import { PackageType } from './Package.js';

export interface RegistryType {
  name: string;
  packages: RegistryPackages;
  url: string;
  version: string;
}

export interface RegistryPackages {
  [slug: string]: PackageType;
}

import { PackageInterface } from './Package.js';

export interface RegistryInterface {
  name: string;
  packages: RegistryPackages;
  url: string;
  version: string;
}

export interface RegistryPackages {
  [slug: string]: PackageInterface;
}

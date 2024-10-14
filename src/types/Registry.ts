import { Package } from './Package.js';

export interface Registry {
  name: string;
  packages: RegistryPackages;
  url: string;
  version: string;
}

export interface RegistryPackages {
  [slug: string]: Package;
}

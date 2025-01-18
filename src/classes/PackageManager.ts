import { RegistryPackages } from '../types/Registry.js';
import { Package } from './Package.js';

export abstract class PackageManager {
  protected packages: Map<string, Package>;

  constructor() {
    this.packages = new Map();
  }

  addPackage(pkg: Package) {
    this.packages.set(pkg.slug, pkg);
  }

  getPackage(slug: string) {
    return this.packages.get(slug);
  }

  listPackages() {
    return Array.from(this.packages.values());
  }

  removePackage(slug: string) {
    this.packages.delete(slug);
  }

  reset() {
    this.packages.clear();
  }

  toJSON() {
    const data: RegistryPackages = {};
    for (const [slug, pkg] of this.packages.entries()) {
      data[slug] = pkg.toJSON();
    }
    return data;
  }
}

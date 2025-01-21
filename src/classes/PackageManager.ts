import { Package } from './Package.js';
import { PackageVersion } from '../types/Package.js';
import { RegistryPackages } from '../types/Registry.js';

export abstract class PackageManager {
  protected packages: Map<string, Package>;

  constructor() {
    this.packages = new Map();
  }

  addPackage(pkg: Package) {
    this.packages.set(pkg.slug, pkg);
  }

  filter(query: string | number | object, field: keyof PackageVersion): Package[] {
    const results: Package[] = [];
    for (const [, pkg] of this.packages) {
      const pkgVersion: PackageVersion | undefined = pkg.getVersionLatest();
      if (!pkgVersion) continue;
      if (pkgVersion[field] === query) {
        results.push(pkg);
      }
    }
    return results;
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

  search(query: string): Package[] {
    const queryLower = query.trim().toLowerCase();
    const results: Package[] = [];
    for (const [slug, pkg] of this.packages) {
      const pkgVersion: PackageVersion | undefined = pkg.getVersionLatest();
      if (!pkgVersion) continue;
      const pkgTags: string[] = pkgVersion.tags.map((str: string) => str.trim().toLowerCase());
      if (
        slug.indexOf(queryLower) !== -1 ||
        pkgVersion.name.trim().toLowerCase().indexOf(queryLower) !== -1 ||
        pkgVersion.description.trim().toLowerCase().indexOf(queryLower) !== -1 ||
        pkgTags.includes(queryLower)
      ) {
        results.push(pkg);
      }
    }
    return results;
  }

  toJSON() {
    const data: RegistryPackages = {};
    for (const [slug, pkg] of this.packages.entries()) {
      data[slug] = pkg.toJSON();
    }
    return data;
  }
}

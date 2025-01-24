import { apiJson } from '../helpers/api.js';
import { Config } from './Config.js';
import { ConfigInterface, ConfigRegistry } from '../types/Config.js';
import { Package } from './Package.js';
import { PackageVersion } from '../types/Package.js';
import { RegistryInterface, RegistryPackages, RegistryType } from '../types/Registry.js';

export class Manager {
  protected config: Config;
  protected packages: Map<string, Package>;
  type: RegistryType;

  constructor(type: RegistryType, config?: ConfigInterface) {
    this.config = new Config(config);
    this.packages = new Map();
    this.type = type;
  }

  addPackage(pkg: Package) {
    const pkgExisting = this.packages.get(pkg.slug);
    if (pkgExisting) {
      for (const [version, pkgVersion] of pkg.versions) {
        pkgExisting.addVersion(version, pkgVersion);
      }
    } else {
      this.packages.set(pkg.slug, pkg);
    }
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
    if (!this.packages.has(slug)) return;
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

  async sync() {
    const registries: ConfigRegistry[] = this.config.get('registries') as ConfigRegistry[];
    for (const index in registries) {
      const json: RegistryInterface = await apiJson(registries[index].url);
      const type: RegistryType = this.type;
      for (const slug in json[type]) {
        const pkg = new Package(slug, json[type][slug].versions);
        this.addPackage(pkg);
      }
    }
  }

  toJSON() {
    const data: RegistryPackages = {};
    for (const [slug, pkg] of this.packages.entries()) {
      data[slug] = pkg.toJSON();
    }
    return data;
  }
}

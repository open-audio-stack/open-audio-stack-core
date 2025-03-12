import { apiJson } from '../helpers/api.js';
import { Config } from './Config.js';
import { ConfigInterface, ConfigRegistry } from '../types/Config.js';
import { Package } from './Package.js';
import { PackageVersion } from '../types/Package.js';
import { RegistryInterface, RegistryPackages, RegistryType } from '../types/Registry.js';
import { Base } from './Base.js';

export class Manager extends Base {
  protected config: Config;
  protected packages: Map<string, Package>;
  type: RegistryType;

  constructor(type: RegistryType, config?: ConfigInterface) {
    super();
    this.config = new Config(config);
    this.packages = new Map();
    this.type = type;
  }

  addPackage(pkg: Package) {
    let pkgExisting = this.packages.get(pkg.slug);
    if (!pkgExisting) {
      pkgExisting = new Package(pkg.slug);
      this.packages.set(pkg.slug, pkgExisting);
    }
    for (const [version, pkgVersion] of pkg.versions) {
      pkgExisting.addVersion(version, pkgVersion);
    }
  }

  filter(method: (pkgVersion: PackageVersion, pkg: Package) => boolean): Package[] {
    const results: Package[] = [];
    for (const [, pkg] of this.packages) {
      const pkgVersion: PackageVersion | undefined = pkg.getVersionLatest();
      if (pkgVersion && method(pkgVersion, pkg)) {
        results.push(pkg);
      }
    }
    return results;
  }

  getPackage(slug: string) {
    return this.packages.get(slug);
  }

  getReport() {
    const reports: any = {};
    for (const [slug, pkg] of this.packages) {
      const report = pkg.getReport();
      if (Object.keys(report).length) reports[slug] = report;
    }
    return reports;
  }

  listPackages(installed?: boolean) {
    if (installed !== undefined) {
      const packagesFiltered: Package[] = [];
      Array.from(this.packages.values()).forEach(pkg => {
        Array.from(pkg.versions.values()).forEach(pkgVersion => {
          if ((installed === true && pkgVersion.installed) || (installed === false && !pkgVersion.installed)) {
            packagesFiltered.push(pkg);
          }
        });
      });
      return packagesFiltered;
    }
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

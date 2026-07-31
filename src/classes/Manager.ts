import { apiJson } from '../helpers/api.js';
import { Config } from './Config.js';
import { ConfigInterface, ConfigRegistry } from '../types/Config.js';
import { Package } from './Package.js';
import { ManagerReport, PackageVersion } from '../types/Package.js';
import { RegistryInterface, RegistryPackages, RegistryType } from '../types/Registry.js';
import { Base } from './Base.js';
import { packageCompatibleFiles } from '../helpers/package.js';
import { registryUrl } from '../helpers/registry.js';
import { Architecture, SystemType } from '../index-browser.js';

export class Manager extends Base {
  protected config: Config;
  protected packages: Map<string, Package>;
  protected syncErrors: string[];
  type: RegistryType;

  constructor(type: RegistryType, config?: ConfigInterface) {
    super();
    this.config = new Config(config);
    this.packages = new Map();
    this.syncErrors = [];
    this.type = type;
  }

  addPackage(pkg: Package) {
    let pkgExisting = this.packages.get(pkg.slug);
    const isNewPackage: boolean = !pkgExisting;
    if (!pkgExisting) {
      pkgExisting = new Package(pkg.slug);
    }
    for (const [version, pkgVersion] of pkg.versions) {
      // addVersion() throws on an invalid version - only register a brand-new package once its
      // versions have been added successfully, so a caller that catches this (e.g. sync()
      // isolating one bad version) doesn't end up with an orphaned, empty Package left behind
      // in the index for a package that was never actually added.
      pkgExisting.addVersion(version, pkgVersion);
    }
    if (isNewPackage) this.packages.set(pkg.slug, pkgExisting);
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

  getSyncErrors(): string[] {
    return this.syncErrors;
  }

  getReport() {
    const reports: ManagerReport = {};
    for (const [slug, pkg] of this.packages) {
      const report = pkg.getReport();
      if (Object.keys(report).length) reports[slug] = report;
    }
    return reports;
  }

  outputReport() {
    const reports = this.getReport();
    for (const [slug, report] of Object.entries(reports)) {
      for (const [ver, reportVersion] of Object.entries(report)) {
        this.logReport(`${slug}/${ver}`, reportVersion.errors, reportVersion.recs);
      }
    }
  }

  listPackages(installed?: boolean, architecture?: Architecture, system?: SystemType) {
    let packages = Array.from(this.packages.values());

    if (installed !== undefined) {
      packages = packages.filter(pkg =>
        Array.from(pkg.versions.values()).some(
          pkgVersion => (installed === true && pkgVersion.installed) || (installed === false && !pkgVersion.installed),
        ),
      );
    }

    if (architecture || system) {
      packages = packages.filter(pkg => {
        const pkgVersion = pkg.getVersionLatest();
        if (!pkgVersion) return false;
        const archArr = architecture ? [architecture] : [];
        const sysArr = system ? [system] : [];
        const files = packageCompatibleFiles(pkgVersion, archArr, sysArr, []);
        return files.length > 0;
      });
    }

    return packages.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  removePackage(slug: string) {
    if (!this.packages.has(slug)) return;
    this.packages.delete(slug);
  }

  reset() {
    this.packages.clear();
    this.syncErrors = [];
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
    // Reset on each call - stale errors from a previous sync() shouldn't linger.
    this.syncErrors = [];
    const registries: ConfigRegistry[] = this.config.get('registries') as ConfigRegistry[];
    const type: RegistryType = this.type;
    for (const index in registries) {
      let json: RegistryInterface;
      try {
        json = await apiJson(registryUrl(registries[index]));
      } catch (err) {
        // One unreachable/misconfigured registry shouldn't stop the others from being synced -
        // record the failure and move on, matching the spec's goal of combining packages from
        // multiple registries into a single index.
        this.syncErrors.push(`${registries[index].name}: ${(err as Error).message}`);
        continue;
      }
      for (const slug in json[type]) {
        for (const version in json[type][slug].versions) {
          try {
            // Add one version at a time (rather than the whole package via addPackage() in one
            // call) so a single malformed version - from a registry this manager doesn't
            // control - can't abort every other version/package still left to sync.
            this.addPackage(new Package(slug, { [version]: json[type][slug].versions[version] }));
          } catch (err) {
            this.syncErrors.push(`${slug}@${version}: ${(err as Error).message}`);
          }
        }
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

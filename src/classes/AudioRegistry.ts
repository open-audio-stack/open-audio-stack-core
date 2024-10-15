import * as semver from 'semver';
import { Package, PackageVersions, PackageVersionType } from '../types/Package.js';
import { Registry } from '../types/Registry.js';

export default class AudioRegistry {
  registry: Registry;

  constructor(registry: Registry) {
    this.registry = registry;
  }

  addPackage(slug: string) {
    return (this.registry.packages[slug] = {
      slug,
      version: '',
      versions: {},
    });
  }

  addPackageVersion(slug: string, version: string, pkgVersion: PackageVersionType) {
    let pkg: Package = this.getPackage(slug);
    if (!pkg) {
      pkg = this.addPackage(slug);
    }
    pkg.versions[version] = pkgVersion;
    pkg.version = this.getPackageVersionLatest(pkg.versions);
  }

  getPackage(slug: string) {
    return this.registry.packages[slug];
  }

  getPackageVersionLatest(versions: PackageVersions) {
    let latest: string = '0.0.0';
    Object.keys(versions).forEach((version: string) => {
      if (semver.gt(version, latest)) {
        latest = version;
      }
    });
    return latest;
  }

  getRegistry() {
    return this.registry;
  }

  removePackage(slug: string) {
    delete this.registry.packages[slug];
  }

  removePackageVersion(slug: string, version: string) {
    const pkg: Package = this.getPackage(slug);
    if (pkg && pkg.versions[version]) {
      delete pkg.versions[version];
      pkg.version = this.getPackageVersionLatest(pkg.versions);
    }
    if (!Object.keys(pkg.versions).length) {
      this.removePackage(slug);
    }
  }
}

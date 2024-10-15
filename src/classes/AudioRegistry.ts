import * as semver from 'semver';
import { Package, PackageVersions, PackageVersionType } from '../types/Package.js';
import { Registry } from '../types/Registry.js';

export default class AudioRegistry {
  data: Registry;

  constructor(name: string, url: string, version: string) {
    this.data = {
      name,
      packages: {},
      url,
      version,
    };
  }

  addPackage(slug: string) {
    return (this.data.packages[slug] = {
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
    return this.data.packages[slug];
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
    return this.data;
  }

  removePackage(slug: string) {
    delete this.data.packages[slug];
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

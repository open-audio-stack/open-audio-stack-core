import { Package, PackageVersionType } from '../types/Package.js';
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
    if (version > pkg.version) {
      pkg.version = version;
    }
  }

  getPackage(slug: string) {
    return this.data.packages[slug];
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
    }
    if (!pkg.versions.length) {
      this.removePackage(slug);
    }
  }
}

import * as semver from 'semver';
import { PackageInterface, PackageVersion, PackageVersions, PackageVersionType } from './types/Package.js';
import { RegistryInterface, RegistryPackages, RegistryType } from './types/Registry.js';

export class Registry {
  registry: RegistryInterface;

  constructor() {
    this.registry = {
      name: 'Open Audio Registry',
      plugins: {},
      presets: {},
      projects: {},
      url: 'https://open-audio-stack.github.io/open-audio-stack-registry',
      version: '1.0.0',
    };
  }

  packageAdd(slug: string, type: RegistryType) {
    return (this.registry[type][slug] = {
      slug,
      version: '',
      versions: {},
    });
  }

  packageVersionAdd(slug: string, type: RegistryType, version: string, pkgVersion: PackageVersionType) {
    if (!semver.valid(version)) throw Error(`${version} is not a valid Semantic version`);
    let pkg: PackageInterface = this.package(slug, type);
    if (!pkg) {
      pkg = this.packageAdd(slug, type);
    }
    pkg.versions[version] = pkgVersion;
    pkg.version = this.packageVersionLatest(pkg.versions);
  }

  package(slug: string, type: RegistryType) {
    return this.registry[type][slug];
  }

  packages(type: RegistryType) {
    return this.registry[type];
  }

  packagesFilter(type: RegistryType, field: keyof PackageVersion, value: string | number | object) {
    const registryFiltered: RegistryPackages = {};
    Object.keys(this.registry[type]).forEach((slug: string) => {
      if (this.packageLatest(slug, type)[field] === value) {
        registryFiltered[slug] = this.registry[type][slug];
      }
    });
    return registryFiltered;
  }

  packageLatest(slug: string, type: RegistryType, version?: string) {
    if (version && !semver.valid(version)) throw Error(`${version} is not a valid Semantic version`);
    const pkg: PackageInterface = this.package(slug, type);
    const pkgVersion: string = this.packageVersionLatest(pkg.versions);
    return pkg.versions[version || pkgVersion];
  }

  packageVersionLatest(versions: PackageVersions) {
    let latest: string = '0.0.0';
    Object.keys(versions).forEach((version: string) => {
      if (semver.gt(version, latest)) {
        latest = version;
      }
    });
    return latest;
  }

  get() {
    return this.registry;
  }

  name() {
    return this.registry.name;
  }

  url() {
    return this.registry.url;
  }

  version() {
    return this.registry.version;
  }

  packageRemove(slug: string, type: RegistryType) {
    delete this.registry[type][slug];
  }

  packageVersionRemove(slug: string, type: RegistryType, version: string) {
    if (!semver.valid(version)) throw Error(`${version} is not a valid Semantic version`);
    const pkg: PackageInterface = this.package(slug, type);
    if (pkg && pkg.versions[version]) {
      delete pkg.versions[version];
      pkg.version = this.packageVersionLatest(pkg.versions);
    }
    if (!Object.keys(pkg.versions).length) {
      this.packageRemove(slug, type);
    }
  }
}

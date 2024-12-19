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

  packageAdd(type: RegistryType, slug: string, pkg?: PackageInterface) {
    return (this.registry[type][slug] = pkg || {
      slug,
      version: '',
      versions: {},
    });
  }

  packageVersionAdd(type: RegistryType, slug: string, version: string, pkgVersion: PackageVersionType) {
    if (!semver.valid(version)) throw Error(`${version} is not a valid Semantic version`);
    let pkg: PackageInterface = this.package(type, slug);
    if (!pkg) {
      pkg = this.packageAdd(type, slug);
    }
    pkg.versions[version] = pkgVersion;
    pkg.version = this.packageVersionLatest(pkg.versions);
  }

  package(type: RegistryType, slug: string) {
    return this.registry[type][slug];
  }

  packages(type: RegistryType) {
    return this.registry[type];
  }

  packagesSearch(type: RegistryType, field: keyof PackageVersion, value: string | number | object) {
    const results: RegistryPackages = {};
    Object.keys(this.registry[type]).forEach((slug: string) => {
      if (this.packageLatest(type, slug)[field] === value) {
        results[slug] = this.registry[type][slug];
      }
    });
    return results;
  }

  packagesOrg(type: RegistryType, match: string) {
    const results: RegistryPackages = {};
    for (const slug in this.registry[type]) {
      if (slug.startsWith(match)) results[slug] = this.registry[type][slug];
    }
    return results;
  }

  packageLatest(type: RegistryType, slug: string, version?: string) {
    if (version && !semver.valid(version)) throw Error(`${version} is not a valid Semantic version`);
    const pkg: PackageInterface = this.package(type, slug);
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

  reset() {
    this.registry.plugins = {};
    this.registry.presets = {};
    this.registry.projects = {};
  }

  url() {
    return this.registry.url;
  }

  version() {
    return this.registry.version;
  }

  packageRemove(type: RegistryType, slug: string) {
    delete this.registry[type][slug];
  }

  packageVersionRemove(type: RegistryType, slug: string, version: string) {
    if (!semver.valid(version)) throw Error(`${version} is not a valid Semantic version`);
    const pkg: PackageInterface = this.package(type, slug);
    if (pkg && pkg.versions[version]) {
      delete pkg.versions[version];
      pkg.version = this.packageVersionLatest(pkg.versions);
    }
    if (!Object.keys(pkg.versions).length) {
      this.packageRemove(type, slug);
    }
  }
}

import * as semver from 'semver';
import {
  PackageInterface,
  PackageValidation,
  PackageValidationError,
  PackageValidationField,
  PackageValidationRec,
  PackageVersions,
  PackageVersionType,
} from './types/Package.js';
import { RegistryInterface, RegistryPackages } from './types/Registry.js';
import { PluginType } from './types/PluginType.js';
import { PresetType } from './types/PresetType.js';
import { ProjectType } from './types/ProjectType.js';
import { License } from './index-browser.js';

export class Registry {
  registry: RegistryInterface;

  constructor(registry?: RegistryInterface) {
    this.registry = Object.assign({}, registry);
  }

  packageAdd(slug: string) {
    return (this.registry.packages[slug] = {
      slug,
      version: '',
      versions: {},
    });
  }

  packageVersionAdd(slug: string, version: string, pkgVersion: PackageVersionType) {
    let pkg: PackageInterface = this.package(slug);
    if (!pkg) {
      pkg = this.packageAdd(slug);
    }
    pkg.versions[version] = pkgVersion;
    pkg.version = this.packageVersionLatest(pkg.versions);
  }

  package(slug: string) {
    return this.registry.packages[slug];
  }

  packages() {
    return this.registry.packages;
  }

  packagesFilter(type: typeof PluginType | typeof PresetType | typeof ProjectType) {
    const registryFiltered: RegistryPackages = {};
    Object.keys(this.registry.packages).forEach((slug: string) => {
      if (Object.values(type).includes(this.packageLatest(slug).type))
        registryFiltered[slug] = this.registry.packages[slug];
    });
    return registryFiltered;
  }

  packageLatest(slug: string, version?: string) {
    const pkg: PackageInterface = this.package(slug);
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

  packageRemove(slug: string) {
    delete this.registry.packages[slug];
  }

  packageVersionRemove(slug: string, version: string) {
    const pkg: PackageInterface = this.package(slug);
    if (pkg && pkg.versions[version]) {
      delete pkg.versions[version];
      pkg.version = this.packageVersionLatest(pkg.versions);
    }
    if (!Object.keys(pkg.versions).length) {
      this.packageRemove(slug);
    }
  }

  packageVersionValidate(pkgVersion: PackageVersionType) {
    const fields: PackageValidationField[] = [
      { name: 'audio', type: 'string' },
      { name: 'author', type: 'string' },
      { name: 'changes', type: 'string' },
      { name: 'date', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'files', type: 'object' },
      { name: 'image', type: 'string' },
      { name: 'license', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'tags', type: 'object' },
      { name: 'type', type: 'string' },
      { name: 'url', type: 'string' },
    ];
    const errors: PackageValidationError[] = [];
    fields.forEach((field: PackageValidationField) => {
      const versionField = pkgVersion[field.name as keyof PackageVersionType];
      if (versionField === undefined) {
        errors.push({
          field: field.name,
          error: PackageValidation.MISSING_FIELD,
          valueExpected: field.type,
          valueReceived: 'undefined',
        });
      } else if (typeof versionField !== field.type) {
        errors.push({
          field: field.name,
          error: PackageValidation.INVALID_TYPE,
          valueExpected: field.type,
          valueReceived: typeof versionField,
        });
      }
    });
    return errors;
  }

  // TODO refactor all this using a proper validation library.
  packageVersionRecommendations(pkgVersion: PackageVersionType) {
    const recs: PackageValidationRec[] = [];

    // Urls
    if (!pkgVersion.url.startsWith('https://')) {
      recs.push({
        field: 'url',
        rec: 'should use https url',
      });
    }
    if (!pkgVersion.url.includes('github.com') && !pkgVersion.url.includes('github.io')) {
      recs.push({
        field: 'url',
        rec: 'should point to GitHub',
      });
    }

    // Image/audio previews
    if (pkgVersion.image && pkgVersion.image.includes('png')) {
      recs.push({
        field: 'image',
        rec: 'should use the jpg format',
      });
    }
    if (pkgVersion.audio && pkgVersion.audio.includes('wav')) {
      recs.push({
        field: 'audio',
        rec: 'should use the flac format',
      });
    }

    // Architectures/systems
    const supportedArchitectures: any = {};
    const supportedSystems: any = {};
    pkgVersion.files.forEach(file => {
      file.architectures.forEach(architecture => {
        supportedArchitectures[architecture] = true;
      });
      file.systems.forEach(system => {
        supportedSystems[system.type] = true;
      });
    });
    if (!supportedArchitectures.arm64) recs.push({ field: 'architectures', rec: 'should support Arm64' });
    if (!supportedArchitectures.bit64) recs.push({ field: 'architectures', rec: 'should support Bit64' });
    if (!supportedSystems.linux) recs.push({ field: 'systems', rec: 'should support Linux' });
    if (!supportedSystems.mac) recs.push({ field: 'systems', rec: 'should support Mac' });
    if (!supportedSystems.win) recs.push({ field: 'systems', rec: 'should support Windows' });

    // Tags
    const pluginTags: string[] = pkgVersion.tags.map(tag => tag.toLowerCase());
    if (pluginTags.length < 2) recs.push({ field: 'tags', rec: 'should have more items' });

    // Licence
    if (!Object.values(License).includes(pkgVersion.license)) {
      recs.push({ field: 'license', rec: 'should be from the supported list' });
    } else if (pkgVersion.license === License.Other) {
      recs.push({ field: 'license', rec: 'should be more specific' });
    }
    return recs;
  }
}

import * as semver from 'semver';
import {
  PackageInterface,
  PackageValidation,
  PackageValidationError,
  PackageValidationField,
  PackageVersions,
  PackageVersionType,
} from './types/Package.js';
import { RegistryInterface } from './types/Registry.js';

export class Registry {
  registry: RegistryInterface;

  constructor(registry: RegistryInterface) {
    this.registry = registry;
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
      { name: 'author', type: 'string' },
      { name: 'changes', type: 'string' },
      { name: 'date', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'files', type: 'object' },
      { name: 'license', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'tags', type: 'object' },
      { name: 'type', type: 'string' },
      { name: 'url', type: 'string' },
    ];
    const errors: PackageValidationError[] = [];
    fields.forEach((field: PackageValidationField) => {
      const versionField = pkgVersion[field.name as keyof PackageVersionType];
      if (!versionField) {
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
}

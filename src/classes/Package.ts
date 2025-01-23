import * as semver from 'semver';
import { PackageInterface, PackageVersion, PackageVersions } from '../types/Package.js';
import { PackageVersionValidator } from '../helpers/package.js';
import { isValidSlug } from '../helpers/utils.js';

export class Package {
  slug: string;
  version: string;
  versions: Map<string, PackageVersion>;

  constructor(slug: string, versions?: PackageVersions) {
    if (!isValidSlug(slug)) console.error('Invalid package slug', slug);
    this.slug = slug;
    this.versions = versions ? new Map(Object.entries(versions)) : new Map();
    this.version = this.latestVersion();
  }

  addVersion(version: string, details: PackageVersion) {
    if (this.versions.has(version)) return;
    const validationError = PackageVersionValidator.safeParse(details).error;
    if (validationError) return console.error('Invalid package version', validationError.issues);
    this.versions.set(version, details);
    this.version = this.latestVersion();
  }

  removeVersion(version: string) {
    if (!this.versions.has(version)) return;
    this.versions.delete(version);
    this.version = this.latestVersion();
  }

  getVersion(version: string) {
    return this.versions.get(version);
  }

  getVersionLatest() {
    return this.versions.get(this.latestVersion());
  }

  latestVersion() {
    return Array.from(this.versions.keys()).sort(semver.rcompare)[0] || '0.0.0';
  }

  toJSON() {
    const data: PackageInterface = {
      slug: this.slug,
      version: this.version,
      versions: {},
    };
    this.versions.forEach((details, version) => {
      data.versions[version] = details;
    });
    return data;
  }
}

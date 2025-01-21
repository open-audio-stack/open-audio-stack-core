import * as semver from 'semver';
import { PackageInterface, PackageVersion } from '../types/Package.js';

export class Package {
  slug: string;
  version: string;
  versions: Map<string, PackageVersion>;

  constructor(slug: string) {
    this.slug = slug;
    this.versions = new Map();
    this.version = this.latestVersion();
  }

  addVersion(version: string, details: PackageVersion) {
    this.versions.set(version, details);
    this.version = this.latestVersion();
  }

  removeVersion(version: string) {
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

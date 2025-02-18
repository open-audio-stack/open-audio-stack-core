import * as semver from 'semver';
import { PackageReport, PackageVersion, PackageVersions } from '../types/Package.js';
import { packageErrors, packageRecommendations } from '../helpers/package.js';
import { isValidSlug } from '../helpers/utils.js';
import { Base } from './Base.js';

export class Package extends Base {
  reports: Map<string, PackageReport>;
  slug: string;
  version: string;
  versions: Map<string, PackageVersion>;

  constructor(slug: string, versions?: PackageVersions) {
    super();
    if (!isValidSlug(slug)) this.log('Invalid package slug', slug);
    this.reports = new Map();
    this.slug = slug;
    this.versions = versions ? new Map(Object.entries(versions)) : new Map();
    this.version = this.latestVersion();
  }

  addVersion(num: string, version: PackageVersion) {
    if (this.versions.has(num)) return;
    const errors = packageErrors(version);
    const recs = packageRecommendations(version);
    const report: PackageReport = {
      ...(errors.length > 0 && { errors }),
      ...(recs.length > 0 && { recs }),
    };
    if (Object.keys(report).length > 0) this.reports.set(num, report);
    if (errors.length > 0) {
      this.log(errors);
      return;
    }
    this.versions.set(num, version);
    this.version = this.latestVersion();
  }

  removeVersion(num: string) {
    if (!this.versions.has(num)) return;
    this.versions.delete(num);
    this.version = this.latestVersion();
  }

  getReport() {
    return Object.fromEntries(this.reports);
  }

  getVersion(num: string) {
    return this.versions.get(num);
  }

  getVersionLatest() {
    return this.versions.get(this.latestVersion());
  }

  getVersionOrLatest(num?: string) {
    if (num) {
      const pkgVersion = this.getVersion(num);
      if (pkgVersion) return pkgVersion;
    }
    return this.getVersionLatest();
  }

  latestVersion() {
    return Array.from(this.versions.keys()).sort(semver.rcompare)[0] || '0.0.0';
  }

  toJSON() {
    return {
      slug: this.slug,
      version: this.version,
      versions: Object.fromEntries(this.versions),
    };
  }
}

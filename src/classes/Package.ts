import * as semver from 'semver';
import { PackageReport, PackageVersion, PackageVersions } from '../types/Package.js';
import { packageErrors, packageRecommendations } from '../helpers/package.js';
import { isValidSlug } from '../helpers/utils.js';

export class Package {
  reports: Map<string, PackageReport>;
  slug: string;
  version: string;
  versions: Map<string, PackageVersion>;

  constructor(slug: string, versions?: PackageVersions) {
    if (!isValidSlug(slug)) console.error('Invalid package slug', slug);
    this.reports = new Map();
    this.slug = slug;
    this.versions = versions ? new Map(Object.entries(versions)) : new Map();
    this.version = this.latestVersion();
  }

  addVersion(version: string, details: PackageVersion) {
    if (this.versions.has(version)) return;
    const errors = packageErrors(details);
    const recs = packageRecommendations(details);
    const report: PackageReport = {
      ...(errors.length > 0 && { errors }),
      ...(recs.length > 0 && { recs }),
    };
    if (Object.keys(report).length > 0) this.reports.set(version, report);
    if (errors.length > 0) return;
    this.versions.set(version, details);
    this.version = this.latestVersion();
  }

  removeVersion(version: string) {
    if (!this.versions.has(version)) return;
    this.versions.delete(version);
    this.version = this.latestVersion();
  }

  getReport() {
    return Object.fromEntries(this.reports);
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
    return {
      slug: this.slug,
      version: this.version,
      versions: Object.fromEntries(this.versions),
    };
  }
}

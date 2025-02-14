import chalk from 'chalk';
import { PackageValidationRec } from '../types/Package.js';
import { ZodIssue } from 'zod';
import * as semver from 'semver';
import slugify from 'slugify';

let LOGGING_ENABLED: boolean = false;
const URLSAFE_REGEX: RegExp = /[^\w\s$*_+~.()'"!\-:@/]+/g;

export function inputGetParts(input: string): string[] {
  return input.split('@');
}

export function log(...args: any) {
  if (LOGGING_ENABLED) {
    console.log(...args);
    return true;
  }
  return false;
}

export function logEnable() {
  return (LOGGING_ENABLED = true);
}

export function logDisable() {
  return (LOGGING_ENABLED = false);
}

export function logReport(info: string, errors?: ZodIssue[], recs?: PackageValidationRec[]) {
  if (errors && errors.length > 0) {
    console.log(chalk.red(`X ${info}`));
    logErrors(errors);
  } else {
    console.log(chalk.green(`✓ ${info}`));
  }
  if (recs) logRecommendations(recs);
}

export function logErrors(errors: ZodIssue[]) {
  errors.forEach(error => {
    // @ts-expect-error need to filter by code.
    if (error.received) {
      console.log(
        chalk.red(
          // @ts-expect-error need to filter by code.
          `- ${error.path} (${error.message}) received '${error.received}' expected '${error.expected}'`,
        ),
      );
    } else {
      console.log(chalk.red(`- ${error.path} (${error.message})`));
    }
  });
}

export function logRecommendations(recs: PackageValidationRec[]) {
  recs.forEach(rec => {
    console.log(chalk.yellow(`- ${rec.field} ${rec.rec}`));
  });
}

export function pathGetDirectory(path: string, sep: string = '/') {
  return path.substring(0, path.lastIndexOf(sep));
}

export function pathGetExt(path: string, sep: string = '.') {
  return path.substring(path.lastIndexOf(sep) + 1);
}

export function pathGetFilename(path: string, sep: string = '/') {
  return path.substring(path.lastIndexOf(sep) + 1);
}

export function pathGetSlug(path: string, sep: string = '/') {
  const parts: string[] = path.split(sep);
  return parts[0] + '/' + parts[1];
}

export function pathGetVersion(path: string, sep: string = '/') {
  const parts: string[] = path.split(sep);
  return parts[parts.length - 2];
}

export function toSlug(val: string): string {
  // @ts-expect-error slugify library issue with ESM modules
  return slugify(val, { lower: true, remove: URLSAFE_REGEX });
}

export function isValidSlug(slug: string): boolean {
  let valid = true;
  // Must have exactly one slash.
  if (slug.split('/').length !== 2) valid = false;
  // Must be lowercase.
  if (slug !== slug.toLowerCase()) valid = false;
  // Must pass slugify conversion
  if (slug !== toSlug(slug)) valid = false;
  return valid;
}

export function isValidVersion(version: string): boolean {
  return semver.valid(version) !== null;
}

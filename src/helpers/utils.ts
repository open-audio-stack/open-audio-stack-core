import * as semver from 'semver';
import slugify from 'slugify';

let DEBUG = false;
const URLSAFE_REGEX: RegExp = /[^\w\s$*_+~.()'"!\-:@/]+/g;

export function inputGetParts(input: string): string[] {
  return input.split('@');
}

export function log(...args: any) {
  if (DEBUG) console.log(...args);
}

export function logEnable() {
  return (DEBUG = true);
}

export function logDisable() {
  return (DEBUG = false);
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

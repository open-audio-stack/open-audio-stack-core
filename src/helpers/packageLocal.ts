import path from 'path';
import { fileCreateJson, fileReadJson } from './file.js';
import { Package } from '../classes/Package.js';
import { log, pathGetSlug, pathGetVersion } from './utils.js';
import { PackageVersion } from '../index-browser.js';

export function packageLoadFile(filePath?: string) {
  // Read the file path and parse as json.
  if (!filePath) filePath = path.join('.', 'index.json');
  const pkgFile: PackageVersion = fileReadJson(filePath);
  if (!pkgFile) log(filePath, `not a valid json file`);

  // Validate package json file structure, fields and values.
  const pkg = new Package(pathGetSlug(filePath));
  pkg.addVersion(pathGetVersion(filePath), pkgFile);
  log(JSON.stringify(pkg.getReport()));

  return pkgFile;
}

export function packageSaveFile(pkgFile: PackageVersion, filePath?: string) {
  // Read the file path and parse as json.
  if (!filePath) filePath = path.join('.', 'index.json');
  fileCreateJson(filePath, pkgFile);
  return pkgFile;
}

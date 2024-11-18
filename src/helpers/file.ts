import AdmZip from 'adm-zip';
import { execSync } from 'child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { createHash } from 'crypto';
import { globSync } from 'glob';
import { moveSync } from 'fs-extra/esm';
import os from 'os';
import path from 'path';
import yaml from 'js-yaml';
import { PackageInterface, PackageValidation, PackageValidationError } from '../types/Package.js';
import { PluginFile } from '../types/Plugin.js';
import { PresetFile } from '../types/Preset.js';
import { ProjectFile } from '../types/Project.js';

export function dirApp() {
  if (process.platform === 'win32') return process.env.APPDATA || os.homedir();
  else if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Preferences');
  return path.join(os.homedir(), '.local', 'share');
}

export function dirCreate(dir: string) {
  if (!dirExists(dir)) {
    console.log('+', dir);
    mkdirSync(dir, { recursive: true });
    return dir;
  }
  return false;
}

export function dirDelete(dir: string) {
  if (dirExists(dir)) {
    console.log('-', dir);
    return rmSync(dir, { recursive: true });
  }
  return false;
}

export function dirEmpty(dir: string) {
  const files: string[] = readdirSync(dir);
  return files.length === 0 || (files.length === 1 && files[0] === '.DS_Store');
}

export function dirExists(dir: string) {
  return existsSync(dir);
}

export function dirIs(dir: string) {
  return statSync(dir).isDirectory();
}

export function dirMove(dir: string, dirNew: string): void | boolean {
  if (dirExists(dir)) {
    console.log('-', dir);
    console.log('+', dirNew);
    return moveSync(dir, dirNew, { overwrite: true });
  }
  return false;
}

export function dirOpen(dir: string) {
  let command: string = '';
  if (process.env.CI) return new Buffer('');
  if (process.platform === 'win32') command = 'start ""';
  else if (process.platform === 'darwin') command = 'open';
  else command = 'xdg-open';
  console.log('⎋', `${command} "${dir}"`);
  return execSync(`${command} "${dir}"`);
}

export function dirPackage(pkg: PackageInterface) {
  const parts: string[] = pkg.slug.split('/');
  parts.push(pkg.version);
  return path.join(...parts);
}

export function dirPlugins() {
  if (process.platform === 'win32') return path.join('Program Files', 'Common Files');
  else if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Audio', 'Plug-ins');
  return path.join('usr', 'local', 'lib');
}

export function dirPresets() {
  if (process.platform === 'win32') return path.join(os.homedir(), 'Documents', 'VST3 Presets');
  else if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Audio', 'Presets');
  return path.join(os.homedir(), '.vst3', 'presets');
}

export function dirProjects() {
  // Windows throws permissions errors if you scan hidden folders
  // Therefore set to a more specific path than Documents
  if (process.platform === 'win32') return path.join(os.homedir(), 'Documents', 'Audio');
  else if (process.platform === 'darwin') return path.join(os.homedir(), 'Documents', 'Audio');
  return path.join(os.homedir(), 'Documents', 'Audio');
}

export function dirRead(dir: string, options?: any): string[] {
  console.log('⌕', dir);
  // Glob now expects forward slashes on Windows
  // Convert backslashes from path.join() to forwardslashes
  if (process.platform === 'win32') {
    dir = dir.replace(/\\/g, '/');
  }
  return globSync(dir, options);
}

export function dirRename(dir: string, dirNew: string): void | boolean {
  if (dirExists(dir)) {
    return moveSync(dir, dirNew, { overwrite: true });
  }
  return false;
}

export function fileCreate(filePath: string, data: string | Buffer): void {
  console.log('+', filePath);
  return writeFileSync(filePath, data);
}

export function fileDate(filePath: string): Date {
  return statSync(filePath).mtime;
}

export function fileDelete(filePath: string): boolean | void {
  if (fileExists(filePath)) {
    console.log('-', filePath);
    return unlinkSync(filePath);
  }
  return false;
}

export function fileExec(filePath: string): void {
  return chmodSync(filePath, '755');
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

export function fileJsonCreate(filePath: string, data: object): void {
  return fileCreate(filePath, JSON.stringify(data, null, 2));
}

export function fileHash(filePath: string, algorithm = 'sha256'): string {
  const fileData: string = fileReadString(filePath);
  const fileNormalized: string = fileData.replace(/\r\n/g, '\n');
  return createHash(algorithm).update(fileNormalized, 'utf8').digest('hex');
}

export function fileMove(filePath: string, newPath: string): void | boolean {
  if (fileExists(filePath)) {
    console.log('-', filePath);
    console.log('+', newPath);
    return moveSync(filePath, newPath, { overwrite: true });
  }
  return false;
}

export function fileOpen(filePath: string) {
  let command: string = '';
  if (process.env.CI) return new Buffer('');
  if (process.platform === 'win32') command = 'open';
  else if (process.platform === 'darwin') command = 'start ""';
  else command = 'xdg-open';
  console.log('⎋', `${command} "${filePath}"`);
  return execSync(`${command} "${filePath}"`);
}

export function fileRead(filePath: string) {
  console.log('⎋', filePath);
  return readFileSync(filePath, 'utf8');
}

export function fileReadJson(filePath: string) {
  if (fileExists(filePath)) {
    console.log('⎋', filePath);
    return JSON.parse(readFileSync(filePath, 'utf8').toString());
  }
  return false;
}

export function fileReadString(filePath: string) {
  console.log('⎋', filePath);
  return readFileSync(filePath, 'utf8').toString();
}

export function fileReadYaml(filePath: string) {
  const file: string = fileReadString(filePath);
  return yaml.load(file);
}

export function fileSize(filePath: string) {
  return statSync(filePath).size;
}

export function fileValidateMetadata(filePath: string, fileMetadata: PluginFile | PresetFile | ProjectFile) {
  const errors: PackageValidationError[] = [];
  if (fileMetadata.sha256 !== fileHash(filePath)) {
    errors.push({
      field: 'sha256',
      error: PackageValidation.INVALID_VALUE,
      valueExpected: fileHash(filePath),
      valueReceived: fileMetadata.sha256,
    });
  }
  if (fileMetadata.size !== fileSize(filePath)) {
    errors.push({
      field: 'size',
      error: PackageValidation.INVALID_VALUE,
      valueExpected: String(fileSize(filePath)),
      valueReceived: String(fileMetadata.size),
    });
  }
  return errors;
}

export function zipCreate(filesPath: string, zipPath: string): void {
  if (fileExists(zipPath)) {
    unlinkSync(zipPath);
  }
  const zip: AdmZip = new AdmZip();
  const pathList: string[] = dirRead(filesPath);
  pathList.forEach(pathItem => {
    console.log('⎋', pathItem);
    try {
      if (dirIs(pathItem)) {
        zip.addLocalFolder(pathItem, path.basename(pathItem));
      } else {
        zip.addLocalFile(pathItem);
      }
    } catch (error) {
      console.log(error);
    }
  });
  console.log('+', zipPath);
  return zip.writeZip(zipPath);
}

export function zipExtract(content: any, dirPath: string): void {
  console.log('⎋', dirPath);
  const zip: AdmZip = new AdmZip(content);
  return zip.extractAllTo(dirPath);
}

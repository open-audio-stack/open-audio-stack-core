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
import { globSync } from 'glob';
import { moveSync } from 'fs-extra/esm';
import os from 'os';
import path from 'path';
import { PackageInterface } from '../src/types/Package.js';

export default class FileSystem {
  constructor() {}

  dirApp() {
    if (process.platform === 'win32') return process.env.APPDATA || os.homedir();
    else if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Preferences');
    return path.join(os.homedir(), '.local', 'share');
  }

  dirCreate(dir: string) {
    if (!this.dirExists(dir)) {
      console.log('+', dir);
      mkdirSync(dir, { recursive: true });
      return dir;
    }
    return false;
  }

  dirDelete(dir: string) {
    if (this.dirExists(dir)) {
      console.log('-', dir);
      return rmSync(dir, { recursive: true });
    }
    return false;
  }

  dirEmpty(dir: string) {
    const files: string[] = readdirSync(dir);
    return files.length === 0 || (files.length === 1 && files[0] === '.DS_Store');
  }

  dirExists(dir: string) {
    return existsSync(dir);
  }

  dirIs(dir: string) {
    return statSync(dir).isDirectory();
  }

  dirMove(dir: string, dirNew: string): void | boolean {
    if (this.dirExists(dir)) {
      console.log('-', dir);
      console.log('+', dirNew);
      return moveSync(dir, dirNew, { overwrite: true });
    }
    return false;
  }

  dirOpen(dir: string) {
    let command: string = '';
    if (process.env.CI) return new Buffer('');
    if (process.platform === 'win32') command = 'open';
    else if (process.platform === 'darwin') command = 'start ""';
    else command = 'xdg-open';
    console.log('⎋', `${command} "${dir}"`);
    return execSync(`${command} "${dir}"`);
  }

  dirPackage(pkg: PackageInterface) {
    const parts: string[] = pkg.slug.split('/');
    parts.push(pkg.version);
    return path.join(...parts);
  }

  dirPlugins() {
    if (process.platform === 'win32') return path.join('Program Files', 'Common Files');
    else if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Audio', 'Plug-ins');
    return path.join('usr', 'local', 'lib');
  }

  dirPresets() {
    if (process.platform === 'win32') return path.join(os.homedir(), 'Documents', 'VST3 Presets');
    else if (process.platform === 'darwin') return path.join(os.homedir(), 'Library', 'Audio', 'Presets');
    return path.join(os.homedir(), '.vst3', 'presets');
  }

  dirProjects() {
    // Windows throws permissions errors if you scan hidden folders
    // Therefore set to a more specific path than Documents
    if (process.platform === 'win32') return path.join(os.homedir(), 'Documents', 'Audio');
    else if (process.platform === 'darwin') return path.join(os.homedir(), 'Documents', 'Audio');
    return path.join(os.homedir(), 'Documents', 'Audio');
  }

  dirRead(dir: string, options?: any): string[] {
    console.log('⌕', dir);
    // Glob now expects forward slashes on Windows
    // Convert backslashes from path.join() to forwardslashes
    if (process.platform === 'win32') {
      dir = dir.replace(/\\/g, '/');
    }
    return globSync(dir, options);
  }

  dirRename(dir: string, dirNew: string): void | boolean {
    if (this.dirExists(dir)) {
      return moveSync(dir, dirNew, { overwrite: true });
    }
    return false;
  }

  fileCreate(filePath: string, data: string | Buffer): void {
    console.log('+', filePath);
    return writeFileSync(filePath, data);
  }

  fileDate(filePath: string): Date {
    return statSync(filePath).mtime;
  }

  fileDelete(filePath: string): boolean | void {
    if (this.fileExists(filePath)) {
      console.log('-', filePath);
      return unlinkSync(filePath);
    }
    return false;
  }

  fileExec(filePath: string): void {
    return chmodSync(filePath, '755');
  }

  fileExists(filePath: string): boolean {
    return existsSync(filePath);
  }

  fileJsonCreate(filePath: string, data: object): void {
    return this.fileCreate(filePath, JSON.stringify(data, null, 2));
  }

  fileMove(filePath: string, newPath: string): void | boolean {
    if (this.fileExists(filePath)) {
      console.log('-', filePath);
      console.log('+', newPath);
      return moveSync(filePath, newPath, { overwrite: true });
    }
    return false;
  }

  fileOpen(filePath: string) {
    let command: string = '';
    if (process.env.CI) return new Buffer('');
    if (process.platform === 'win32') command = 'open';
    else if (process.platform === 'darwin') command = 'start ""';
    else command = 'xdg-open';
    console.log('⎋', `${command} "${filePath}"`);
    return execSync(`${command} "${filePath}"`);
  }

  fileRead(filePath: string) {
    console.log('⎋', filePath);
    return readFileSync(filePath);
  }

  fileReadJson(filePath: string) {
    if (this.fileExists(filePath)) {
      console.log('⎋', filePath);
      return JSON.parse(readFileSync(filePath).toString());
    }
    return false;
  }

  fileReadString(filePath: string) {
    console.log('⎋', filePath);
    return readFileSync(filePath).toString();
  }

  fileSize(filePath: string) {
    return statSync(filePath).size;
  }

  zipCreate(filesPath: string, zipPath: string): void {
    if (this.fileExists(zipPath)) {
      unlinkSync(zipPath);
    }
    const zip: AdmZip = new AdmZip();
    const pathList: string[] = this.dirRead(filesPath);
    pathList.forEach(pathItem => {
      console.log('⎋', pathItem);
      try {
        if (this.dirIs(pathItem)) {
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

  zipExtract(content: any, dirPath: string): void {
    console.log('⎋', dirPath);
    const zip: AdmZip = new AdmZip(content);
    return zip.extractAllTo(dirPath);
  }
}

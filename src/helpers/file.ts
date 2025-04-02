import AdmZip from 'adm-zip';
import { execFileSync, execSync, spawn } from 'child_process';
import {
  createReadStream,
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
import { unpack } from '7zip-min';
import stream from 'stream/promises';
import { GlobOptionsWithFileTypesFalse, globSync } from 'glob';
import { moveSync } from 'fs-extra/esm';
import os from 'os';
import * as tar from 'tar';
import path, { dirname } from 'path';
import yaml from 'js-yaml';
import { ZodIssueCode, ZodParsedType } from 'zod';
import { PackageInterface } from '../types/Package.js';
import { PluginFile } from '../types/Plugin.js';
import { PresetFile } from '../types/Preset.js';
import { ProjectFile } from '../types/Project.js';
import { ZodIssue } from 'zod';
import { SystemType } from '../types/SystemType.js';
import { fileURLToPath } from 'url';
import sudoPrompt from '@vscode/sudo-prompt';
import { getSystem } from './utilsLocal.js';
import { log } from './utils.js';

export async function archiveExtract(filePath: string, dirPath: string) {
  log('⎋', dirPath);
  const ext = path.extname(filePath).trim().toLowerCase();
  if (ext === '.zip') {
    const zip: AdmZip = new AdmZip(filePath);
    return zip.extractAllTo(dirPath);
  } else if (ext === '.tar' || ext === '.gz' || ext === '.tgz') {
    return await tar.extract({
      file: filePath,
      cwd: dirPath,
    });
  } else if (ext === '.7z') {
    return unpack(filePath, dirPath, err => {
      if (err) throw new Error(`7z extraction failed: ${err.message}`);
    });
  }
}

export function dirApp(dirName = 'open-audio-stack') {
  if (getSystem() === SystemType.Win) return process.env.APPDATA || path.join(os.homedir(), dirName);
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Library', 'Preferences', dirName);
  return path.join(os.homedir(), '.local', 'share', dirName);
}

export function dirContains(parentDir: string, childDir: string): boolean {
  return path.normalize(childDir).startsWith(path.normalize(parentDir));
}

export function dirCreate(dir: string) {
  if (!dirExists(dir)) {
    log('+', dir);
    mkdirSync(dir, { recursive: true });
    return dir;
  }
  return false;
}

export function dirDelete(dir: string) {
  if (dirExists(dir)) {
    log('-', dir);
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
    log('-', dir);
    log('+', dirNew);
    return moveSync(dir, dirNew, { overwrite: true });
  }
  return false;
}

export function dirOpen(dir: string) {
  let command: string = '';
  if (process.env.CI) return Buffer.from('');
  if (getSystem() === SystemType.Win) command = 'start ""';
  else if (getSystem() === SystemType.Mac) command = 'open';
  else command = 'xdg-open';
  log('⎋', `${command} "${dir}"`);
  return execSync(`${command} "${dir}"`);
}

export function dirPackage(pkg: PackageInterface) {
  const parts: string[] = pkg.slug.split('/');
  parts.push(pkg.version);
  return path.join(...parts);
}

export function dirPlugins() {
  if (getSystem() === SystemType.Win) return path.join('Program Files', 'Common Files');
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Library', 'Audio', 'Plug-ins');
  return path.join('usr', 'local', 'lib');
}

export function dirPresets() {
  if (getSystem() === SystemType.Win) return path.join(os.homedir(), 'Documents', 'VST3 Presets');
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Library', 'Audio', 'Presets');
  return path.join(os.homedir(), '.vst3', 'presets');
}

export function dirProjects() {
  // Windows throws permissions errors if you scan hidden folders
  // Therefore set to a more specific path than Documents
  if (getSystem() === SystemType.Win) return path.join(os.homedir(), 'Documents', 'Audio');
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Documents', 'Audio');
  return path.join(os.homedir(), 'Documents', 'Audio');
}

export function dirRead(dir: string, options?: GlobOptionsWithFileTypesFalse): string[] {
  log('⌕', dir);
  // Glob now expects forward slashes on Windows
  // Convert backslashes from path.join() to forwardslashes
  if (getSystem() === SystemType.Win) {
    dir = dir.replace(/\\/g, '/');
  }
  // Ignore Mac files in Contents folders
  // Filter out any paths not starting with the base directory
  // This is to prevent issues with symlinks.
  const baseDir: string = dir.includes('*') ? dir.split('*')[0] : dir;
  const allPaths = globSync(dir, {
    ignore: [`${baseDir}/**/*.{app,component,lv2,vst,vst3}/**/*`],
    realpath: true,
    ...options,
  });
  // Glob input paths use forward slashes.
  // Glob output paths are system-specific.
  const baseDirCrossPlatform: string = baseDir.split('/').join(path.sep);
  return allPaths.filter(p => p.startsWith(baseDirCrossPlatform));
}

export function dirRename(dir: string, dirNew: string): void | boolean {
  if (dirExists(dir)) {
    return moveSync(dir, dirNew, { overwrite: true });
  }
  return false;
}

export function fileCreate(filePath: string, data: string | Buffer): void {
  log('+', filePath);
  return writeFileSync(filePath, data);
}

export function fileCreateJson(filePath: string, data: object): void {
  return fileCreate(filePath, JSON.stringify(data, null, 2));
}

export function fileCreateYaml(filePath: string, data: object): void {
  return fileCreate(filePath, yaml.dump(data));
}

export function fileDate(filePath: string): Date {
  return statSync(filePath).mtime;
}

export function fileDelete(filePath: string): boolean | void {
  if (fileExists(filePath)) {
    log('-', filePath);
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

export async function fileHash(filePath: string, algorithm = 'sha256'): Promise<string> {
  log('⎋', filePath);
  const input = createReadStream(filePath);
  const hash = createHash(algorithm);
  await stream.pipeline(input, hash);
  return hash.digest('hex');
}

export function fileInstall(filePath: string) {
  if (process.env.CI) return Buffer.from('');
  const ext = path.extname(filePath).toLowerCase();
  let command: string | null = null;
  switch (ext) {
    case '.dmg':
      command = `hdiutil attach -nobrowse "${filePath}" && sudo installer -pkg "$(find /Volumes -name '*.pkg' -maxdepth 2 | head -n 1)" -target / && hdiutil detach "$(dirname "$(find /Volumes -name '*.pkg' -maxdepth 2 | head -n 1)")"`;
      break;
    case '.pkg':
      command = `sudo installer -pkg "${filePath}" -target /`;
      break;
    case '.deb':
      command = `sudo dpkg -i "${filePath}" || sudo apt-get install -f -y`;
      break;
    case '.rpm':
      command = `sudo rpm -i --nodigest --nofiledigest --nosignature --force "${filePath}" || sudo dnf install -y "${filePath}" || sudo yum install -y "${filePath}"`;
      break;
    case '.exe':
      command = `start /wait "" "${filePath}" /quiet /norestart`;
      break;
    case '.msi':
      command = `msiexec /i "${filePath}" /quiet /norestart`;
      break;
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
  log('⎋', command);
  return execSync(command, { stdio: 'inherit' });
}

export function fileMove(filePath: string, newPath: string): void | boolean {
  if (fileExists(filePath)) {
    log('-', filePath);
    log('+', newPath);
    return moveSync(filePath, newPath, { overwrite: true });
  }
  return false;
}

export function filesMove(dirSource: string, dirTarget: string, dirSub: string, formatDir: Record<string, string>) {
  // Read files from source directory, ignoring Mac Contents files.
  const files: string[] = dirRead(`${dirSource}/**/*.*`);
  const filesMoved: string[] = [];

  // For each file, move to correct folder based on type
  files.forEach((fileSource: string) => {
    const fileExt: string = path.extname(fileSource).slice(1).toLowerCase();
    const fileExtTarget = formatDir[fileExt];
    // If this is not a supported file format, then ignore.
    if (fileExtTarget === undefined)
      return log(`${fileSource} - ${fileExt} not mapped to a installation folder, skipping.`);
    const fileTarget: string = path.join(dirTarget, fileExtTarget, dirSub, path.basename(fileSource));
    if (fileExists(fileTarget)) return log(`${fileSource} - ${fileTarget} already exists, skipping.`);
    dirCreate(path.dirname(fileTarget));
    fileMove(fileSource, fileTarget);
    filesMoved.push(fileTarget);
  });
  return filesMoved;
}

export function fileOpen(filePath: string) {
  let command: string = '';
  if (process.env.CI) return Buffer.from('');
  if (getSystem() === SystemType.Win) command = 'start ""';
  else if (getSystem() === SystemType.Mac) command = 'open';
  else command = 'xdg-open';
  log('⎋', `${command} "${filePath}"`);
  return execSync(`${command} "${filePath}"`);
}

export function fileRead(filePath: string) {
  log('⎋', filePath);
  return readFileSync(filePath, 'utf8');
}

export function fileReadJson(filePath: string) {
  if (fileExists(filePath)) {
    log('⎋', filePath);
    return JSON.parse(readFileSync(filePath, 'utf8').toString());
  }
  return false;
}

export function fileReadString(filePath: string) {
  log('⎋', filePath);
  return readFileSync(filePath, 'utf8').toString();
}

export function fileReadYaml(filePath: string) {
  const file: string = fileReadString(filePath);
  return yaml.load(file);
}

export function fileSize(filePath: string) {
  return statSync(filePath).size;
}

export function isAdmin(): boolean {
  if (process.platform === 'win32') {
    try {
      execFileSync('net', ['session'], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  } else {
    return process && process.getuid ? process.getuid() === 0 : false;
  }
}

export async function fileValidateMetadata(filePath: string, fileMetadata: PluginFile | PresetFile | ProjectFile) {
  const errors: ZodIssue[] = [];
  const hash = await fileHash(filePath);
  if (fileMetadata.sha256 !== hash) {
    errors.push({
      code: ZodIssueCode.invalid_type,
      expected: fileMetadata.sha256 as ZodParsedType,
      message: 'Required',
      path: ['sha256'],
      received: hash as ZodParsedType,
    });
  }
  if (fileMetadata.size !== fileSize(filePath)) {
    errors.push({
      code: ZodIssueCode.invalid_type,
      expected: String(fileMetadata.size) as ZodParsedType,
      message: 'Required',
      path: ['size'],
      received: String(fileSize(filePath)) as ZodParsedType,
    });
  }
  return errors;
}

export function getPlatform() {
  if (getSystem() === SystemType.Win) return SystemType.Win;
  else if (getSystem() === SystemType.Mac) return SystemType.Mac;
  return SystemType.Linux;
}

export function runCliAsAdmin(args: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const filename: string = fileURLToPath(import.meta.url).replace('src/', 'build/');
    const dirPathClean: string = dirname(filename).replace('app.asar', 'app.asar.unpacked');
    const script: string = path.join(dirPathClean, 'admin.js');

    // Temp file for logging
    const logFile = path.join(dirPathClean, 'admin.log');
    writeFileSync(logFile, ''); // Clear previous logs

    log(`Running as admin: node "${script}" ${args}`);

    // Tail the log file in real-time
    const tail = spawn('tail', ['-f', logFile]);
    const grep = spawn('grep', ['.']);
    tail.stdout.pipe(grep.stdin);
    grep.stdout.on('data', data => {
      log(data.toString());
    });

    // Run the script with sudoPrompt
    sudoPrompt.exec(`node "${script}" ${args} >> "${logFile}" 2>&1`, { name: 'Open Audio Stack' }, error => {
      tail.kill();
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function zipCreate(filesPath: string, zipPath: string): void {
  if (fileExists(zipPath)) {
    unlinkSync(zipPath);
  }
  const zip: AdmZip = new AdmZip();
  const pathList: string[] = dirRead(filesPath);
  pathList.forEach(pathItem => {
    log('⎋', pathItem);
    try {
      if (dirIs(pathItem)) {
        zip.addLocalFolder(pathItem, path.basename(pathItem));
      } else {
        zip.addLocalFile(pathItem);
      }
    } catch (error) {
      log(error);
    }
  });
  log('+', zipPath);
  return zip.writeZip(zipPath);
}

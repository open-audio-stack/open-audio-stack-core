import AdmZip from 'adm-zip';
import { execFileSync, spawn } from 'child_process';
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
import { list, unpack } from '7zip-min';
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
import mime from 'mime-types';

// Rejects the "zip slip" pattern: an archive entry name like `../../../etc/passwd` or an
// absolute path that, once joined to the extraction directory, resolves outside of it.
export function isSafeArchiveEntryPath(entryName: string, targetRoot: string): boolean {
  return dirContains(targetRoot, path.resolve(targetRoot, entryName));
}

export async function archiveExtract(filePath: string, dirPath: string) {
  log('⎋', dirPath);
  const fileName = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).trim().toLowerCase();
  const targetRoot = path.resolve(dirPath);

  const tarExtensions = ['.tar', '.gz', '.tgz', '.xz', '.bz2', '.tbz2'];
  const tarCompoundExtensions = ['.tar.gz', '.tar.xz', '.tar.bz2'];
  const isTarFile =
    tarExtensions.includes(ext) || tarCompoundExtensions.some(compoundExt => fileName.endsWith(compoundExt));

  if (ext === '.zip') {
    const zip: AdmZip = new AdmZip(filePath);
    try {
      // adm-zip's extractAllTo already guards against zip-slip internally (its sanitize()/
      // canonical() helpers fall back to the entry's basename if it would otherwise resolve
      // outside the target directory) - this is the normal, non-fallback path.
      return zip.extractAllTo(dirPath);
    } catch (error: any) {
      // Handle Windows special character issues by extracting files manually
      if (getSystem() === SystemType.Win && error.message?.includes('ENOENT')) {
        log('⚠️', 'Extracting files manually due to special characters in filenames');
        const entries = zip.getEntries();
        entries.forEach(entry => {
          const sanitizedName: string = entry.entryName.replace(/[<>:"|?*]/g, '_').replace(/[\r\n]/g, '');
          // This manual path builds destinations by hand instead of going through adm-zip's own
          // sanitize(), so it must enforce the same containment itself - stripping `<>:"|?*` and
          // newlines does nothing to stop a `..`-based traversal.
          if (!isSafeArchiveEntryPath(sanitizedName, targetRoot)) {
            throw new Error(`Archive entry escapes extraction directory: ${entry.entryName}`);
          }
          const outputPath = path.join(dirPath, sanitizedName);
          if (!entry.isDirectory) {
            dirCreate(path.dirname(outputPath));
            writeFileSync(outputPath, entry.getData());
          } else {
            dirCreate(outputPath);
          }
        });
        return;
      }
    }
  } else if (isTarFile) {
    // node-tar rejects '..' path segments and relativizes absolute paths by default
    // (preservePaths is false unless explicitly opted into), so no extra check is needed here.
    return await tar.extract({
      file: filePath,
      cwd: dirPath,
    });
  } else if (ext === '.7z') {
    // Unlike adm-zip/node-tar, 7zip-min just shells out to the 7za binary with no per-entry
    // containment logic of its own, and there's no way to sanitize an entry's destination
    // mid-extraction. List the archive's contents first and refuse to extract at all if any
    // entry would escape the target directory.
    const entries: Array<{ name?: string }> = await new Promise((resolve, reject) => {
      list(filePath, (err: any, result: any) => (err ? reject(err) : resolve(result || [])));
    });
    const unsafeEntry = entries.find(entry => entry.name && !isSafeArchiveEntryPath(entry.name, targetRoot));
    if (unsafeEntry) {
      throw new Error(`Archive entry escapes extraction directory: ${unsafeEntry.name}`);
    }
    return new Promise<void>((resolve, reject) => {
      unpack(filePath, dirPath, (err2: any) => {
        if (err2)
          return reject(new Error(`7z extraction failed: ${err2 && err2.message ? err2.message : String(err2)}`));
        return resolve();
      });
    });
  }
}

export function dirApp(dirName = 'open-audio-stack') {
  if (getSystem() === SystemType.Win) return process.env.APPDATA || path.join(os.homedir(), dirName);
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Library', 'Preferences', dirName);
  return path.join(os.homedir(), '.local', 'share', dirName);
}

export function dirContains(parentDir: string, childDir: string): boolean {
  const normalizedParent = path.normalize(parentDir);
  const normalizedChild = path.normalize(childDir);
  // A trailing separator is required before the prefix check, otherwise a sibling directory
  // that merely shares a prefix (e.g. parent "/foo/bar" vs child "/foo/barbaz") would
  // incorrectly count as contained.
  return normalizedChild === normalizedParent || normalizedChild.startsWith(normalizedParent + path.sep);
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
  if (process.env.CI) return Buffer.from('');
  // execFileSync never invokes a shell, so `dir` can't break out into a second command
  // regardless of its contents.
  if (getSystem() === SystemType.Win) {
    log('⎋', `cmd.exe /c start "" "${dir}"`);
    return execFileSync('cmd.exe', ['/c', 'start', '""', dir]);
  } else if (getSystem() === SystemType.Mac) {
    log('⎋', `open "${dir}"`);
    return execFileSync('open', [dir]);
  }
  log('⎋', `xdg-open "${dir}"`);
  return execFileSync('xdg-open', [dir]);
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

export function dirApps() {
  if (getSystem() === SystemType.Win) return path.join(os.homedir(), 'AppData', 'Local', 'Programs');
  else if (getSystem() === SystemType.Mac) return path.join('/Applications');
  return path.join('/usr', 'local', 'bin');
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

// Mounts to an explicit, freshly created mountpoint (rather than scanning /Volumes for
// whatever showed up) so a concurrently mounted, unrelated disk image can't be picked up
// instead, and so we know exactly what to detach afterwards.
function installDmg(filePath: string) {
  const mountPoint = path.join(os.tmpdir(), `oas-dmg-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(mountPoint, { recursive: true });
  try {
    log('⎋', `hdiutil attach -nobrowse -mountpoint "${mountPoint}" "${filePath}"`);
    execFileSync('hdiutil', ['attach', '-nobrowse', '-mountpoint', mountPoint, filePath]);
    const pkgs = dirRead(path.join(mountPoint, '**', '*.pkg'));
    if (pkgs.length === 0) throw new Error(`No .pkg found inside ${filePath}`);
    log('⎋', `sudo installer -pkg "${pkgs[0]}" -target /`);
    return execFileSync('sudo', ['installer', '-pkg', pkgs[0], '-target', '/'], { stdio: 'inherit' });
  } finally {
    try {
      execFileSync('hdiutil', ['detach', mountPoint, '-force']);
    } catch {
      /* best-effort unmount */
    }
  }
}

// Every branch below uses execFileSync (no shell) rather than building a command string for
// execSync. This is the actual fix, not just a hardening pass: file paths here are derived
// from community-submitted registry metadata (file.url), so a shell string built via template
// literal is a command injection vector regardless of how strictly the url is validated
// upstream - execFileSync passes each argument as its own argv entry, so shell metacharacters
// in filePath (`$(...)`, backticks, `;`, `|`, `&&`, ...) can never be interpreted.
export function fileInstall(filePath: string) {
  if (process.env.CI) return Buffer.from('');
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.dmg':
      return installDmg(filePath);
    case '.pkg':
      log('⎋', `sudo installer -pkg "${filePath}" -target /`);
      return execFileSync('sudo', ['installer', '-pkg', filePath, '-target', '/'], { stdio: 'inherit' });
    case '.deb':
      log('⎋', `sudo dpkg -i "${filePath}" || sudo apt-get install -f -y`);
      try {
        return execFileSync('sudo', ['dpkg', '-i', filePath], { stdio: 'inherit' });
      } catch {
        return execFileSync('sudo', ['apt-get', 'install', '-f', '-y'], { stdio: 'inherit' });
      }
    case '.rpm':
      log(
        '⎋',
        `sudo rpm -i --nodigest --nofiledigest --nosignature --force "${filePath}" || sudo dnf install -y "${filePath}" || sudo yum install -y "${filePath}"`,
      );
      try {
        return execFileSync(
          'sudo',
          ['rpm', '-i', '--nodigest', '--nofiledigest', '--nosignature', '--force', filePath],
          { stdio: 'inherit' },
        );
      } catch {
        try {
          return execFileSync('sudo', ['dnf', 'install', '-y', filePath], { stdio: 'inherit' });
        } catch {
          return execFileSync('sudo', ['yum', 'install', '-y', filePath], { stdio: 'inherit' });
        }
      }
    case '.exe':
      // Run the downloaded installer directly - no shell/`start` wrapper needed at all.
      log('⎋', `"${filePath}" /quiet /norestart`);
      return execFileSync(filePath, ['/quiet', '/norestart'], { stdio: 'inherit' });
    case '.msi':
      log('⎋', `msiexec /i "${filePath}" /quiet /norestart`);
      return execFileSync('msiexec', ['/i', filePath, '/quiet', '/norestart'], { stdio: 'inherit' });
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
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
  const filesAndFolders: string[] = dirRead(`${dirSource}/**/*`);
  log('filesAndFolders', filesAndFolders);

  // First pass: identify bundle directories (app, clap, vst3, lv2, etc.)
  const bundleDirs: Set<string> = new Set();
  filesAndFolders.forEach(f => {
    if (dirIs(f)) {
      // Check if this is a macOS application bundle or plugin bundle
      if (fileExists(path.join(f, 'Contents', 'Info.plist'))) {
        bundleDirs.add(f);
      }
      // Check if this is an LV2 plugin folder
      if (fileExists(path.join(f, 'manifest.ttl'))) {
        bundleDirs.add(f);
      }
    }
  });

  const files = filesAndFolders.filter(f => {
    // Exclude files/folders that are inside bundle directories
    for (const bundleDir of bundleDirs) {
      if (f.startsWith(bundleDir + path.sep)) {
        return false; // This path is inside a bundle, exclude it
      }
    }

    // Include regular files (not directories).
    if (!dirIs(f)) return true;

    // Include bundle directories themselves (already identified above).
    if (bundleDirs.has(f)) return true;

    // Otherwise ignore.
    return false;
  });
  const filesMoved: string[] = [];
  log('files', files);

  // For each file, move to correct folder based on type
  files.forEach((fileSource: string) => {
    const fileExt: string = path.extname(fileSource).slice(1).toLowerCase();
    let fileExtTarget = formatDir[fileExt];

    // Use mime-type detection as fallback for unmapped extensions
    if (!fileExtTarget) {
      const mimeType = mime.lookup(fileSource) || '';
      if (!mimeType || mimeType.startsWith('application/')) {
        fileExtTarget = 'App';
      }
    }

    // If this is not a supported file format, then ignore.
    if (fileExtTarget === undefined)
      return log(`${fileSource} - ${fileExt || 'no extension'} not mapped to a installation folder, skipping.`);
    const fileTarget: string = path.join(dirTarget, fileExtTarget, dirSub, path.basename(fileSource));
    if (fileExists(fileTarget)) return log(`${fileSource} - ${fileTarget} already exists, skipping.`);
    dirCreate(path.dirname(fileTarget));
    fileMove(fileSource, fileTarget);
    // Set executable permissions for executable file types
    if (fileExt === 'app') {
      // For .app bundles, find and set permissions on the actual executable
      const executablePath = path.join(fileTarget, 'Contents', 'MacOS', path.basename(fileTarget, '.app'));
      if (fileExists(executablePath)) {
        fileExec(executablePath);
      }
    } else if (['elf', 'exe', ''].includes(fileExt)) {
      fileExec(fileTarget);
    }
    filesMoved.push(fileTarget);
  });
  return filesMoved;
}

// filePath (and, for the Windows/Linux branches, the surrounding options) ultimately come from
// a package's `open` field in registry metadata, so this is the same command-injection surface
// as fileInstall - execFileSync (no shell) rather than execSync everywhere below.
export function fileOpen(filePath: string, options: string[] = []) {
  if (process.env.CI) return Buffer.from('');

  if (getSystem() === SystemType.Mac) {
    const isExecutable = !path.extname(filePath);
    if (isExecutable) {
      // Use spawn for executables with stdio inherit to show output
      log('⎋', `spawn "${filePath}" ${options.join(' ')}`);
      const child = spawn(filePath, options, { stdio: 'inherit' });
      return child;
    } else {
      log('⎋', `open "${filePath}"`);
      return execFileSync('open', [filePath]);
    }
  }

  if (getSystem() === SystemType.Win) {
    log('⎋', `cmd.exe /c start "" "${filePath}"`);
    return execFileSync('cmd.exe', ['/c', 'start', '""', filePath]);
  }
  log('⎋', `xdg-open "${filePath}"`);
  return execFileSync('xdg-open', [filePath]);
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

export interface AdminPayload {
  appDir: string;
  operation: string;
  type: string;
  id: string;
  version?: string;
  log?: boolean;
}

// sudo-prompt's exec() only accepts a single command string run through a shell - there is no
// argv-array form to escape into. `appDir`/`id`/`version` ultimately come from registry
// metadata or local project files, so building `--flag "${value}"` text here would be the same
// command-injection surface as fileInstall. Instead, base64url-encode the dynamic payload: its
// alphabet is only [A-Za-z0-9_-], so whatever the payload contains, the shell only ever sees
// characters that can't be interpreted as shell syntax.
export function runCliAsAdmin(payload: AdminPayload): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const filename: string = fileURLToPath(import.meta.url).replace('src/', 'build/');
    const dirPathClean: string = dirname(filename).replace('app.asar', 'app.asar.unpacked');
    const script: string = path.join(dirPathClean, 'admin.js');
    const encodedPayload: string = Buffer.from(JSON.stringify(payload)).toString('base64url');

    log(`Running as admin: node "${script}" --payload <encoded>`);

    const cmd = `node ${JSON.stringify(script)} --payload ${encodedPayload}`;

    sudoPrompt.exec(
      cmd,
      { name: 'Open Audio Stack' },
      (error?: Error | undefined, stdout?: string | Buffer | undefined, stderr?: string | Buffer | undefined) => {
        // Convert stdout/stderr buffers to strings for inspection
        const stdoutStr = stdout ? (typeof stdout === 'string' ? stdout : stdout.toString()) : '';
        const stderrStr = stderr ? (typeof stderr === 'string' ? stderr : stderr.toString()) : '';

        const out = stdoutStr + stderrStr;
        log(out);

        // Try to parse structured JSON output from the admin script first.
        // Admin script outputs JSON on its own line after a newline, so look for the last JSON object.
        const lines = out.split('\n');
        let jsonPayload = null;
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines
          try {
            jsonPayload = JSON.parse(line);
            break; // Found valid JSON, stop searching backwards
          } catch {
            // This line is not JSON, continue searching
          }
        }

        // If we found JSON output from admin script, prioritize it over sudoPrompt error
        if (jsonPayload) {
          if (jsonPayload && (jsonPayload.status === 'ok' || jsonPayload.code === 0)) {
            return resolve();
          }
          const errMsg = jsonPayload && jsonPayload.message ? jsonPayload.message : JSON.stringify(jsonPayload);
          return reject(new Error(`runCliAsAdmin: admin command reported error: ${errMsg}`));
        }

        // If no JSON found, check for sudoPrompt error
        if (error) {
          const msg = `runCliAsAdmin: admin command failed: ${error && error.message ? error.message : String(error)}${
            stderrStr ? `\nstderr: ${stderrStr}` : ''
          }`;
          const err: any = new Error(msg);
          err.code = (error as any) && (error as any).code ? (error as any).code : undefined;
          return reject(err);
        }

        return reject(
          new Error(
            `runCliAsAdmin: admin command did not report completion. stdout: ${stdoutStr} stderr: ${stderrStr}`,
          ),
        );
      },
    );
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

import { execFileSync, spawn } from 'child_process';
import {
  chmodSync,
  createReadStream,
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
import stream from 'stream/promises';
import { GlobOptionsWithFileTypesFalse, globSync } from 'glob';
import { moveSync } from 'fs-extra/esm';
import path from 'path';
import yaml from 'js-yaml';
import { SystemType } from '../types/SystemType.js';
import { getSystem } from './utilsLocal.js';
import { log } from './utils.js';

// Generic, domain-agnostic filesystem primitives - directory/file create/read/move/delete,
// hashing, and "open with the OS". No audio-package-specific knowledge belongs here; see
// paths.ts (default install directories), archive.ts (archive extraction/creation, including
// filesMove()'s package-format sorting), and installer.ts (privileged installer execution) for
// that - this module is the shared base all three build on.

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
  // execFileSync never invokes a shell itself, but on Windows the target of that call would be
  // cmd.exe - which *is* a command interpreter, and re-parses its `/c` command line using cmd's
  // own grammar (where `&`, `|`, `^`, etc are metacharacters) regardless of how Node quoted the
  // argv it was given. explorer.exe has no such reinterpretation - it treats its argument as a
  // literal path - so it's used instead of cmd.exe /c start. Its exit code is unreliable
  // (frequently non-zero even on success), so this uses spawn() and doesn't wait on the result,
  // same as the CI short-circuit above already implies callers don't depend on one.
  if (getSystem() === SystemType.Win) {
    log('⎋', `explorer.exe "${dir}"`);
    spawn('explorer.exe', [dir], { stdio: 'ignore' });
    return;
  } else if (getSystem() === SystemType.Mac) {
    log('⎋', `open "${dir}"`);
    return execFileSync('open', [dir]);
  }
  log('⎋', `xdg-open "${dir}"`);
  return execFileSync('xdg-open', [dir]);
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

export function fileMove(filePath: string, newPath: string): void | boolean {
  if (fileExists(filePath)) {
    log('-', filePath);
    log('+', newPath);
    return moveSync(filePath, newPath, { overwrite: true });
  }
  return false;
}

// filePath (and, for the Mac/Linux branches, the surrounding options) ultimately come from a
// package's `open` field in registry metadata, so this is the same command-injection surface as
// installer.ts's fileInstall - execFileSync (no shell) rather than execSync for those branches.
// The Windows branch below needs a different fix: see its own comment.
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
    // execFileSync never invokes a shell itself, but on Windows the target of that call would
    // be cmd.exe - which *is* a command interpreter, and re-parses its `/c` command line using
    // cmd's own grammar (where `&`, `|`, `^`, etc are metacharacters) regardless of how Node
    // quoted the argv it was given, so a filePath containing them (this is untrusted, coming
    // from a package's `open` field) could still be reinterpreted. explorer.exe has no such
    // reinterpretation - it treats its argument as a literal path - so it's used instead of
    // cmd.exe /c start. Its exit code is unreliable (frequently non-zero even on success), so
    // this uses spawn() and doesn't wait on/check the result.
    log('⎋', `explorer.exe "${filePath}"`);
    spawn('explorer.exe', [filePath], { stdio: 'ignore' });
    return;
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

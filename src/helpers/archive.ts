import AdmZip from 'adm-zip';
import { unlinkSync, writeFileSync } from 'fs';
import { list, unpack } from '7zip-min';
import * as tar from 'tar';
import path from 'path';
import mime from 'mime-types';
import { SystemType } from '../types/SystemType.js';
import { getSystem } from './utilsLocal.js';
import { log } from './utils.js';
import { dirContains, dirCreate, dirIs, dirRead, fileExec, fileExists, fileMove } from './fs.js';

// Archive extraction/creation, and filesMove()'s package-format sorting of an extracted
// archive's contents - the two are grouped together since filesMove() only ever runs
// immediately after archiveExtract() (see ManagerLocal.install()/helpers/installTargets.ts), on
// content this module itself just produced.

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
        // This manual path builds destinations by hand instead of going through adm-zip's own
        // sanitize(), so it must enforce the same containment itself - stripping `<>:"|?*` and
        // newlines does nothing to stop a `..`-based traversal. Validate every entry up front
        // (mirroring the .7z branch below) and refuse to extract anything at all if any entry is
        // unsafe, rather than validating and writing one entry at a time in the same loop.
        const sanitizedEntries = entries.map(entry => ({
          entry,
          sanitizedName: entry.entryName.replace(/[<>:"|?*]/g, '_').replace(/[\r\n]/g, ''),
        }));
        const unsafeEntry = sanitizedEntries.find(
          ({ sanitizedName }) => !isSafeArchiveEntryPath(sanitizedName, targetRoot),
        );
        if (unsafeEntry) {
          throw new Error(`Archive entry escapes extraction directory: ${unsafeEntry.entry.entryName}`);
        }
        sanitizedEntries.forEach(({ entry, sanitizedName }) => {
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
    // node-tar requires cwd to already exist, unlike AdmZip/7zip-min which create their
    // own target directory.
    dirCreate(dirPath);
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
      // VST3 bundles on Linux (and some Windows builds) are directories without a macOS
      // Info.plist, so they must be recognized by extension alone.
      if (path.extname(f).slice(1).toLowerCase() === 'vst3') {
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

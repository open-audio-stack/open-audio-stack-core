import path from 'path';
import {
  archiveExtract,
  dirCreate,
  dirIs,
  dirMove,
  dirRead,
  fileCreateJson,
  fileExec,
  fileInstall,
  fileOpen,
} from './file.js';
import { filesMove } from './file.js';
import { PackageVersion } from '../types/Package.js';
import { pluginFormatDir } from '../types/PluginFormat.js';
import { PluginType } from '../types/PluginType.js';
import { RegistryType } from '../types/Registry.js';

// Each install target function below handles exactly one of install()'s per-file-type
// destinations, and returns every directory it populated under `typeDir` (the live, user-facing
// install location) so the caller can track them for rollback on a later failure - see
// ManagerLocal.install(). Each is a small, self-contained unit: given a real (or temp-directory)
// filesystem and a package version, it can be called and its result asserted directly, without
// going through install()'s download/hash-check/elevation orchestration at all.

export interface InstallerFileParams {
  typeDir: string;
  slug: string;
  versionNum: string;
  pkgVersion: PackageVersion;
  filePath: string;
  isTestsFn: () => boolean;
}

// FileType.Installer: run the installer headless (or open it, under tests) and record a marker
// directory - installers install themselves outside typeDir, so there's nothing to move here;
// the directory only lets scan()/isPackageInstalled() know this version is present.
export function installInstallerFile(params: InstallerFileParams): string[] {
  const { typeDir, slug, versionNum, pkgVersion, filePath, isTestsFn } = params;
  // Test time out if installing during tests.
  if (isTestsFn()) fileOpen(filePath);
  else fileInstall(filePath);
  // Currently we don't get a list of paths from the installer.
  // Create empty directory and save package version information.
  // Installers have to be manually uninstalled for now.
  const dirTarget: string = path.join(typeDir, 'Installers', slug, versionNum);
  dirCreate(dirTarget);
  fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
  return [dirTarget];
}

export interface ArchiveFileParams {
  typeDir: string;
  type: RegistryType;
  slug: string;
  versionNum: string;
  pkgVersion: PackageVersion;
  filePath: string;
  // Scratch directory to extract into - the caller computes this since it needs appDir/file.type,
  // neither of which this module otherwise needs to know about.
  dirSource: string;
  isTestsFn: () => boolean;
  log: (...args: any) => void;
}

// FileType.Archive: extract to the given scratch directory, then dispatch to whichever final
// destination applies to this package/archive - a Sampler moves as one opaque unit, an archive
// containing its own installer (.pkg/.dmg) runs it and just marks presence (like
// installInstallerFile above), a Plugins-type package's files get sorted into format-specific
// subdirectories, and everything else (apps/presets/projects) moves as a flat directory.
export async function installArchiveFile(params: ArchiveFileParams): Promise<string[]> {
  const { typeDir, type, slug, versionNum, pkgVersion, filePath, dirSource, isTestsFn, log } = params;
  const dirSub: string = path.join(slug, versionNum);
  await archiveExtract(filePath, dirSource);

  if (pkgVersion.type === PluginType.Sampler) {
    return installSamplerArchive(typeDir, dirSource, dirSub, pkgVersion);
  }

  const embeddedInstallers = findEmbeddedInstallers(dirSource);
  if (embeddedInstallers.length > 0) {
    return installEmbeddedInstallers(typeDir, dirSub, embeddedInstallers, pkgVersion, isTestsFn);
  }

  if (type === RegistryType.Plugins) {
    return installPluginFormats(typeDir, dirSource, dirSub, slug, pkgVersion);
  }

  return installFlatDirectory(typeDir, dirSource, dirSub, pkgVersion, log);
}

// Move entire directory, maintaining the same folder structure.
function installSamplerArchive(
  typeDir: string,
  dirSource: string,
  dirSub: string,
  pkgVersion: PackageVersion,
): string[] {
  const dirTarget: string = path.join(typeDir, 'Samplers', dirSub);
  dirCreate(dirTarget);
  dirMove(dirSource, dirTarget);
  fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
  return [dirTarget];
}

// A .pkg/.dmg found inside an otherwise-archive-typed download (e.g. a zip wrapping a macOS
// installer) - these still need to run as an installer rather than moving into typeDir directly.
function findEmbeddedInstallers(dirSource: string): string[] {
  return dirRead(`${dirSource}/**/*`)
    .filter(f => !dirIs(f))
    .filter(f => ['.pkg', '.dmg'].includes(path.extname(f).toLowerCase()));
}

function installEmbeddedInstallers(
  typeDir: string,
  dirSub: string,
  installerFiles: string[],
  pkgVersion: PackageVersion,
  isTestsFn: () => boolean,
): string[] {
  // Run installer files found in archive
  for (const installerFile of installerFiles) {
    if (isTestsFn()) fileOpen(installerFile);
    else fileInstall(installerFile);
  }
  // Create directory and save package info for installer
  const dirTarget: string = path.join(typeDir, 'Installers', dirSub);
  dirCreate(dirTarget);
  fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
  return [dirTarget];
}

// For plugins, move files into type-specific subdirectories. Only ever called for
// RegistryType.Plugins (see installArchiveFile above) - pluginFormatDir is the only formatDir
// that can apply here, so unlike the pre-refactor code this doesn't branch on `type` to pick a
// formatDir: that branch could never actually select presetFormatDir/projectFormatDir in
// practice, since this function itself is only reached when type === Plugins.
function installPluginFormats(
  typeDir: string,
  dirSource: string,
  dirSub: string,
  slug: string,
  pkgVersion: PackageVersion,
): string[] {
  const filesMoved: string[] = filesMove(dirSource, typeDir, dirSub, pluginFormatDir);
  if (filesMoved.length === 0) {
    throw new Error(`No compatible files found to install for ${slug}`);
  }
  const dirsPopulated = new Set<string>();
  filesMoved.forEach((fileMoved: string) => {
    const fileJson: string = path.join(path.dirname(fileMoved), 'index.json');
    fileCreateJson(fileJson, pkgVersion);
    // A single archive can contain multiple formats (e.g. VST3 and CLAP), moved into different
    // formatDir subdirectories - track each one, not just the first.
    dirsPopulated.add(path.dirname(fileMoved));
  });
  return Array.from(dirsPopulated);
}

// For apps/projects/presets, move entire directory without type subdirectories.
function installFlatDirectory(
  typeDir: string,
  dirSource: string,
  dirSub: string,
  pkgVersion: PackageVersion,
  log: (...args: any) => void,
): string[] {
  const dirTarget: string = path.join(typeDir, dirSub);
  dirCreate(dirTarget);
  dirMove(dirSource, dirTarget);
  fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
  // Ensure executable permissions for likely executables inside moved app/project/preset
  try {
    const movedFiles = dirRead(path.join(dirTarget, '**', '*')).filter(f => !dirIs(f));
    movedFiles.forEach((movedFile: string) => {
      const ext = path.extname(movedFile).slice(1).toLowerCase();
      if (['', 'elf', 'exe'].includes(ext)) {
        try {
          fileExec(movedFile);
        } catch (err) {
          log(`Failed to set exec on ${movedFile}:`, err);
        }
      }
    });
  } catch (err) {
    log('Error while setting executable permissions:', err);
  }
  // Also handle macOS .app bundles: set exec on binaries in Contents/MacOS
  try {
    const appDirs = dirRead(path.join(dirTarget, '**', '*.app')).filter(d => dirIs(d));
    appDirs.forEach((appDir: string) => {
      try {
        const macosBinPattern = path.join(appDir, 'Contents', 'MacOS', '**', '*');
        const macosFiles = dirRead(macosBinPattern).filter(f => !dirIs(f));
        macosFiles.forEach((binFile: string) => {
          try {
            fileExec(binFile);
          } catch (err) {
            log(`Failed to set exec on app binary ${binFile}:`, err);
          }
        });
      } catch (err) {
        log(`Error scanning .app contents for ${appDir}:`, err);
      }
    });
  } catch (err) {
    log(err);
  }
  return [dirTarget];
}

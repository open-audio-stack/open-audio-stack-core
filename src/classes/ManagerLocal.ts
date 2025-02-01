import path from 'path';
import { Package } from './Package.js';
import { PackageVersion } from '../types/Package.js';
import { Manager } from './Manager.js';
import {
  archiveExtract,
  dirCreate,
  dirDelete,
  dirEmpty,
  dirRead,
  fileCreate,
  fileCreateJson,
  fileExists,
  fileHash,
  fileOpen,
  fileReadJson,
  fileReadYaml,
  filesMove,
  isAdmin,
  runCliAsAdmin,
} from '../helpers/file.js';
import { pathGetSlug, pathGetVersion } from '../helpers/utils.js';
import { commandExists, getArchitecture, getSystem, isTests } from '../helpers/utilsLocal.js';
import { apiBuffer } from '../helpers/api.js';
import { FileInterface } from '../types/File.js';
import { FileType } from '../types/FileType.js';
import { RegistryType } from '../types/Registry.js';
import { pluginFormatDir } from '../types/PluginFormat.js';
import { ConfigInterface } from '../types/Config.js';
import { ConfigLocal } from './ConfigLocal.js';
import { packageCompatibleFiles } from '../helpers/package.js';
import { presetFormatDir } from '../types/PresetFormat.js';
import { projectFormatDir } from '../types/ProjectFormat.js';
import { FileFormat, SystemType } from '../index-browser.js';

export class ManagerLocal extends Manager {
  protected typeDir: string;

  constructor(type: RegistryType, config: ConfigInterface) {
    super(type, config);
    const configPath: string = path.join(config.appDir || '', 'config.json');
    this.config = new ConfigLocal(configPath, config);
    this.typeDir = this.config.get(`${type}Dir`) as string;
  }

  scan(ext = 'json') {
    const filePaths: string[] = dirRead(`${this.typeDir}/**/index.${ext}`);
    filePaths.forEach((filePath: string) => {
      const subPath: string = filePath.replace(`${this.typeDir}/`, '');
      const pkgJson =
        ext === 'yaml' ? (fileReadYaml(filePath) as PackageVersion) : (fileReadJson(filePath) as PackageVersion);
      pkgJson.installed = true;
      const pkg = new Package(pathGetSlug(subPath));
      pkg.addVersion(pathGetVersion(subPath), pkgJson);
      this.addPackage(pkg);
    });
  }

  async install(slug: string, version?: string) {
    // Get package information from registry.
    const pkg: Package | undefined = this.getPackage(slug);
    if (!pkg) return console.error(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) return console.error(`Package ${slug} version ${versionNum} not found in registry`);
    if (pkgVersion.installed) return pkgVersion;

    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      let command: string = `--operation install --type ${this.type} --slug ${slug}`;
      if (version) command += ` --ver ${version}`;
      await runCliAsAdmin(command);
      return this.getPackage(slug)?.getVersion(versionNum);
    }

    // Create temporary directory to store downloaded files.
    const dirDownloads: string = path.join(
      this.config.get('appDir') as string,
      'downloads',
      this.type,
      slug,
      versionNum,
    );
    dirCreate(dirDownloads);

    // Not all Linux distributions support all file formats.
    const excludedFormats: FileFormat[] = [];
    const system = getSystem();
    if (system === SystemType.Linux) {
      if (!(await commandExists('dpkg'))) excludedFormats.push(FileFormat.DebianPackage);
      if (!(await commandExists('rpm'))) excludedFormats.push(FileFormat.RedHatPackage);
    }
    // Filter for compatible files and download.
    const files: FileInterface[] = packageCompatibleFiles(
      pkgVersion,
      [getArchitecture()],
      [getSystem()],
      excludedFormats,
    );
    if (!files.length) return console.error(`Error: No compatible files found for ${slug}`);
    for (const key in files) {
      // Download file to temporary directory if not already downloaded.
      const file: FileInterface = files[key];
      const filePath: string = path.join(dirDownloads, path.basename(file.url));
      if (!fileExists(filePath)) {
        const fileBuffer: ArrayBuffer = await apiBuffer(file.url);
        fileCreate(filePath, Buffer.from(fileBuffer));
      }

      // Check file hash matches expected hash.
      const hash: string = await fileHash(filePath);
      if (hash !== file.sha256) return console.error(`Error: ${filePath} hash mismatch`);

      // If installer, run the installer.
      if (file.type === FileType.Installer) {
        fileOpen(filePath);
      }

      // If archive, extract the archive to temporary directory, then move individual files.
      if (file.type === FileType.Archive) {
        const dirSource: string = path.join(
          this.config.get('appDir') as string,
          file.type,
          this.type,
          slug,
          versionNum,
        );
        const dirSub: string = path.join(slug, versionNum);
        let formatDir: Record<string, string> = pluginFormatDir;
        if (this.type === RegistryType.Presets) formatDir = presetFormatDir;
        if (this.type === RegistryType.Projects) formatDir = projectFormatDir;
        archiveExtract(filePath, dirSource);
        const filesMoved: string[] = filesMove(dirSource, this.typeDir, dirSub, formatDir);

        // Output json metadata into every directory a file was added to.
        filesMoved.forEach((fileMoved: string) => {
          const fileJson: string = path.join(path.dirname(fileMoved), 'index.json');
          fileCreateJson(fileJson, pkgVersion);
        });
      }
    }
    pkgVersion.installed = true;
    return pkgVersion;
  }

  async uninstall(slug: string, version?: string) {
    // Get package information from registry.
    const pkg: Package | undefined = this.getPackage(slug);
    if (!pkg) return console.error(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) return console.error(`Package ${slug} version ${versionNum} not found in registry`);
    if (!pkgVersion.installed) return console.error(`Package ${slug} version ${versionNum} not installed`);

    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      let command: string = `--operation uninstall --type ${this.type} --slug ${slug}`;
      if (version) command += ` --ver ${version}`;
      await runCliAsAdmin(command);
      return this.getPackage(slug)?.getVersion(versionNum);
    }

    // Delete all directories for this package version.
    const versionDirs: string[] = dirRead(`${this.typeDir}/**/${slug}/${versionNum}`);
    versionDirs.forEach((versionDir: string) => {
      dirDelete(versionDir);
    });

    // Delete all empty directories for this package.
    const pkgDirs: string[] = dirRead(`${this.typeDir}/**/${slug}`);
    pkgDirs.forEach((pkgDir: string) => {
      if (dirEmpty(pkgDir)) dirDelete(pkgDir);
    });

    // Delete all empty directories for the org.
    const orgDirs: string[] = dirRead(`${this.typeDir}/**/${slug.split('/')[0]}`);
    orgDirs.forEach((orgDir: string) => {
      if (dirEmpty(orgDir)) dirDelete(orgDir);
    });

    delete pkgVersion.installed;
    return this.getPackage(slug)?.getVersion(versionNum);
  }
}

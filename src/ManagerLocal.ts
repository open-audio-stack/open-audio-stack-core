import {
  archiveExtract,
  dirCreate,
  dirRead,
  fileCreate,
  fileCreateJson,
  fileExists,
  fileHash,
  fileMove,
  fileOpen,
  fileReadJson,
  isAdmin,
  runCliAsAdmin,
} from './helpers/file.js';
import { PluginInterface } from '../src/types/Plugin.js';
import { PresetInterface } from '../src/types/Preset.js';
import { Manager } from './Manager.js';
import { getSystem, isTests, pathGetSlug, pathGetVersion } from './helpers/utils.js';
import { ProjectInterface } from './types/Project.js';
import { RegistryInterface, RegistryType } from './types/Registry.js';
import { PackageInterface, PackageVersionType } from '../src/types/Package.js';
import { ConfigLocal } from './ConfigLocal.js';
import { ConfigInterface } from './types/Config.js';
import path from 'path';
import { apiBuffer } from './helpers/api.js';
import { getArchitecture } from './helpers/utils.js';
import { FileInterface } from './types/File.js';
import { FileType } from './types/FileType.js';
import { PluginFormat, pluginFormatDir } from './types/PluginFormat.js';

export class ManagerLocal extends Manager {
  override config: ConfigLocal;

  constructor(config: ConfigInterface, registry?: RegistryInterface) {
    super(config, registry);
    const configPath: string = path.join(config.appDir || '', 'config.json');
    this.config = new ConfigLocal(configPath, config);
  }

  scanLocal(type?: RegistryType) {
    if (type) {
      this.scanDir(type);
    } else {
      this.scanDir(RegistryType.Plugins);
      this.scanDir(RegistryType.Presets);
      this.scanDir(RegistryType.Projects);
    }
  }

  scanDir(type: RegistryType) {
    console.log('scanDir', type);
    const rootDir: string = this.config.get(`${type}Dir`) as string;
    const filePaths: string[] = dirRead(`${rootDir}/**/index.json`);
    filePaths.forEach((filePath: string) => {
      const subPath: string = filePath.replace(`${rootDir}/`, '');
      const pkgSlug: string = pathGetSlug(subPath);
      const pkgVersion: string = pathGetVersion(subPath);
      const pkgFile = fileReadJson(filePath) as PluginInterface | PresetInterface | ProjectInterface;
      this.registry.packageVersionAdd(type, pkgSlug, pkgVersion, pkgFile);
    });
  }

  async packageInstall(type: RegistryType, slug: string, version?: string) {
    // Get package information from registry.
    const pkg: PackageInterface = this.registry.package(type, slug);
    const versionNum: string = version || this.registry.packageVersionLatest(pkg.versions);
    const pkgVersion: PackageVersionType = this.registry.packageLatest(type, slug, versionNum);
    if (!pkgVersion) return console.error(`Package ${slug} ${versionNum} not found in registry ${type} cache`);
    if (pkgVersion.installed) return pkgVersion;

    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      let command: string = `--operation install --type ${type} --slug ${slug}`;
      if (version) command += ` --ver ${version}`;
      await runCliAsAdmin(command);
      return this.get(slug, type, version);
    }

    // Install the extracted files based on the package type.
    if (type === RegistryType.Plugins) await this.pluginInstall(slug, versionNum, pkgVersion);
    if (type === RegistryType.Presets) await this.presetInstall();
    if (type === RegistryType.Projects) await this.projectInstall();
  }

  async pluginInstall(slug: string, versionNum: string, pkgVersion: PackageVersionType) {
    // Create temporary directory to store downloaded files.
    const dirDownloads: string = path.join(
      this.config.get('appDir') as string,
      'downloads',
      RegistryType.Plugins,
      slug,
      versionNum,
    );
    dirCreate(dirDownloads);

    // Filter for compatible files and download.
    const files: FileInterface[] = this.getCompatibleFiles(pkgVersion);
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
          RegistryType.Plugins,
          slug,
          versionNum,
        );
        const dirSub: string = path.join(slug, versionNum);
        archiveExtract(filePath, dirSource);
        const filesMoved: string[] = this.filesMove(dirSource, this.config.get('pluginsDir') as string, dirSub);

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

  filesMove(dirSource: string, dirTarget: string, dirSub: string) {
    // Read files from source directory, ignoring Mac Contents files.
    const files: string[] = dirRead(`${dirSource}/**/*.*`, {
      ignore: [`${dirSource}/**/Contents/**/*`],
    });
    console.log('files', files);
    const filesMoved: string[] = [];

    // For each file, move to correct folder based on type
    files.forEach((fileSource: string) => {
      if (fileSource.includes('__MACOSX')) return;
      const fileExt: string = path.extname(fileSource).slice(1).toLowerCase();
      const fileTarget: string = path.join(
        dirTarget,
        pluginFormatDir[fileExt as PluginFormat],
        dirSub,
        path.basename(fileSource),
      );
      if (fileExists(fileTarget)) return;
      dirCreate(path.dirname(fileTarget));
      fileMove(fileSource, fileTarget);
      filesMoved.push(fileTarget);
    });
    return filesMoved;
  }

  async presetInstall() {
    // TODO
  }

  async projectInstall() {
    // TODO
  }

  getCompatibleFiles(pkg: PackageVersionType) {
    return pkg.files.filter((file: FileInterface) => {
      const archMatches = file.architectures.filter(architecture => {
        return architecture === getArchitecture();
      });
      const sysMatches = file.systems.filter(system => {
        return system.type === getSystem();
      });
      return archMatches.length && sysMatches.length;
    });
  }

  async packageUninstall(type: RegistryType, slug: string, version?: string) {
    // TODO
    console.log(type, slug, version);
  }
}

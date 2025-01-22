import path from 'path';
import { Package } from './Package.js';
import { PackageVersion } from '../types/Package.js';
import { PluginManager } from './PluginManager.js';
import {
  archiveExtract,
  dirCreate,
  dirRead,
  fileCreate,
  fileCreateJson,
  fileExists,
  fileHash,
  fileOpen,
  fileReadJson,
  filesMove,
  isAdmin,
  runCliAsAdmin,
} from '../helpers/file.js';
import { getArchitecture, getSystem, isTests, pathGetSlug, pathGetVersion } from '../helpers/utils.js';
import { PluginInterface } from '../types/Plugin.js';
import { PresetInterface } from '../types/Preset.js';
import { ProjectInterface } from '../types/Project.js';
import { apiBuffer } from '../helpers/api.js';
import { FileInterface } from '../types/File.js';
import { FileType } from '../types/FileType.js';
import { RegistryType } from '../types/Registry.js';
import { pluginFormatDir } from '../types/PluginFormat.js';
import { ConfigInterface } from '../types/Config.js';
import { ConfigLocal } from './ConfigLocal.js';

export class PluginManagerLocal extends PluginManager {
  constructor(config: ConfigInterface) {
    super(config);
    const configPath: string = path.join(config.appDir || '', 'config.json');
    this.config = new ConfigLocal(configPath, config);
  }

  getCompatibleFiles(pkg: PackageVersion) {
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

  scan() {
    const rootDir: string = this.config.get('pluginsDir') as string;
    const filePaths: string[] = dirRead(`${rootDir}/**/index.json`);
    filePaths.forEach((filePath: string) => {
      const subPath: string = filePath.replace(`${rootDir}/`, '');
      const pkgJson = fileReadJson(filePath) as PluginInterface | PresetInterface | ProjectInterface;
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
      let command: string = `--operation install --type ${RegistryType.Plugins} --slug ${slug}`;
      if (version) command += ` --ver ${version}`;
      await runCliAsAdmin(command);
      return this.getPackage(slug)?.getVersion(versionNum);
    }

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
        const filesMoved: string[] = filesMove(
          dirSource,
          this.config.get('pluginsDir') as string,
          dirSub,
          pluginFormatDir,
        );

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
    // TODO
    console.log(slug, version);
  }
}

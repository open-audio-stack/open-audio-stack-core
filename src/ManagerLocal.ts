import {
  dirCreate,
  dirRead,
  fileCreate,
  fileHash,
  fileOpen,
  fileReadJson,
  isAdmin,
  runCliAsAdmin,
  zipExtract,
} from './helpers/file.js';
import { PluginInterface } from '../src/types/Plugin.js';
import { PresetInterface } from '../src/types/Preset.js';
import { Manager } from './Manager.js';
import { getSystem, isTests, pathGetSlug, pathGetVersion } from './helpers/utils.js';
import { ProjectInterface } from './types/Project.js';
import { RegistryInterface, RegistryType } from './types/Registry.js';
import { PackageVersionType } from '../src/types/Package.js';
import { ConfigLocal } from './ConfigLocal.js';
import { ConfigInterface } from './types/Config.js';
import path from 'path';
import { apiBuffer } from './helpers/api.js';
import { getArchitecture } from './helpers/utils.js';
import { FileInterface } from './types/File.js';
import { FileType } from './index-browser.js';

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
    const pkg: PackageVersionType = this.registry.packageLatest(type, slug, version);
    if (!pkg) return console.error(`Package ${slug} not found in registry ${type} cache`);
    if (pkg.installed) return pkg;

    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      let command: string = `--operation install --type ${type} --slug ${slug}`;
      if (version) command += ` --ver ${version}`;
      await runCliAsAdmin(command);
      return this.get(slug, type, version);
    }

    // Install the extracted files based on the package type.
    if (type === RegistryType.Plugins) await this.pluginInstall(slug, pkg);
    if (type === RegistryType.Presets) await this.presetInstall();
    if (type === RegistryType.Projects) await this.projectInstall();
  }

  async pluginInstall(slug: string, pkg: PackageVersionType) {
    // Create temporary directory to store downloaded files.
    const dirDownloads: string = path.join(
      this.config.get('appDir') as string,
      'downloads',
      RegistryType.Plugins,
      slug,
    );
    dirCreate(dirDownloads);

    // Filter for compatible files and download.
    const files: FileInterface[] = this.getCompatibleFiles(pkg);
    if (!files.length) return console.error(`Error: No compatible files found for ${slug}`);
    for (const key in files) {
      // Download file to temporary directory.
      const file: FileInterface = files[key];
      const fileBuffer: ArrayBuffer = await apiBuffer(file.url);
      const filePath: string = path.join(dirDownloads, path.basename(file.url));
      fileCreate(filePath, Buffer.from(fileBuffer));

      // Check file hash matches expected hash.
      const hash: string = await fileHash(filePath);
      if (hash !== file.sha256) return console.error(`Error: ${filePath} hash mismatch`);

      // If installer, run the installer.
      if (file.type === FileType.Installer) {
        fileOpen(filePath);
      }

      // If archive, extract the archive to temporary directory.
      if (file.type === FileType.Archive) {
        const dirPlugins: string = path.join(this.config.get('pluginsDir') as string, file.type, slug);
        zipExtract(Buffer.from(fileBuffer), dirPlugins);
      }
    }
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

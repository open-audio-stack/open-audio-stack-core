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
  fileCreateYaml,
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
import { packageLoadFile, packageSaveFile } from '../helpers/packageLocal.js';

export class ManagerLocal extends Manager {
  protected typeDir: string;

  constructor(type: RegistryType, config: ConfigInterface) {
    super(type, config);
    const configPath: string = path.join(config.appDir || '', 'config.json');
    this.config = new ConfigLocal(configPath, config);
    this.typeDir = this.config.get(`${type}Dir`) as string;
  }

  scan(ext = 'json', installable = true) {
    const filePaths: string[] = dirRead(`${this.typeDir}/**/index.${ext}`);
    filePaths.forEach((filePath: string) => {
      const subPath: string = filePath.replace(`${this.typeDir}/`, '');
      const pkgJson =
        ext === 'yaml' ? (fileReadYaml(filePath) as PackageVersion) : (fileReadJson(filePath) as PackageVersion);
      if (installable) pkgJson.installed = true;
      const pkg = new Package(pathGetSlug(subPath));
      const version = pathGetVersion(subPath);
      pkg.addVersion(version, pkgJson);
      this.addPackage(pkg);
    });
  }

  export(dir: string, ext = 'json') {
    const packagesByOrg: any = {};
    const filename: string = `index.${ext}`;
    const saveFile = ext === 'yaml' ? fileCreateYaml : fileCreateJson;
    for (const [pkgSlug, pkg] of this.packages) {
      for (const [version, pkgVersion] of pkg.versions) {
        dirCreate(path.join(dir, pkgSlug, version));
        saveFile(path.join(dir, pkgSlug, version, filename), pkgVersion);
      }
      saveFile(path.join(dir, pkgSlug, filename), pkg.toJSON());

      // TODO find a more elegant way to handle org exports.
      const pkgOrg: string = pkgSlug.split('/')[0];
      if (!packagesByOrg[pkgOrg]) packagesByOrg[pkgOrg] = {};
      packagesByOrg[pkgOrg][pkgSlug] = pkg.toJSON();
    }
    for (const orgId in packagesByOrg) {
      dirCreate(path.join(dir, orgId));
      saveFile(path.join(dir, orgId, filename), packagesByOrg[orgId]);
    }
    dirCreate(dir);
    saveFile(path.join(dir, filename), this.toJSON());
    saveFile(path.join(dir, `report.${ext}`), this.getReport());
    return true;
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

  async installDependency(slug: string, version?: string, filePath?: string, type = RegistryType.Plugins) {
    // Get dependency package information from registry.
    const manager = new ManagerLocal(type, this.config.config);
    await manager.sync();
    const pkg: Package | undefined = manager.getPackage(slug);
    if (!pkg) return console.error(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) return console.error(`Package ${slug} version ${versionNum} not found in registry`);
    // Get local package file.
    const pkgFile = packageLoadFile(filePath) as any;
    if (pkgFile[type] && pkgFile[type][slug] && pkgFile[type][slug] === versionNum) {
      return console.error(`Package ${slug} version ${versionNum} is already a dependency`);
    }
    // Install dependency.
    await manager.install(slug, version);
    // Add dependency to local package file and save.
    if (!pkgFile[type]) pkgFile[type] = {};
    pkgFile[type][slug] = versionNum;
    packageSaveFile(pkgFile, filePath);
    pkgFile.installed = true;
    return pkgFile;
  }

  async installDependencies(filePath?: string, type = RegistryType.Plugins) {
    // Loop through dependency packages and install each one.
    const pkgFile = packageLoadFile(filePath) as any;
    const manager = new ManagerLocal(type, this.config.config);
    await manager.sync();
    for (const slug in pkgFile[type]) {
      await manager.install(slug, pkgFile[type][slug]);
    }
    pkgFile.installed = true;
    return pkgFile;
  }

  open(filePath?: string) {
    const pkgFile = packageLoadFile(filePath) as any;
    // If installer, run the installer.
    if (pkgFile.open) {
      fileOpen(pkgFile.open);
    }
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

  async uninstallDependency(slug: string, version?: string, filePath?: string, type = RegistryType.Plugins) {
    // Get local package file.
    const pkgFile = packageLoadFile(filePath) as any;
    if (!pkgFile[type]) return console.error(`Package ${type} is missing`);
    if (!pkgFile[type][slug]) return console.error(`Package ${type} ${slug} is not a dependency`);

    // Uninstall dependency.
    const manager = new ManagerLocal(type, this.config.config);
    await manager.sync();
    await manager.uninstall(slug, version || pkgFile[type][slug]);

    // Remove dependency from local package file and save.
    if (!pkgFile[type]) pkgFile[type] = {};
    delete pkgFile[type][slug];
    packageSaveFile(pkgFile, filePath);
    pkgFile.installed = true;
    return pkgFile;
  }

  async uninstallDependencies(filePath?: string, type = RegistryType.Plugins) {
    // Loop through dependency packages and uninstall each one.
    const pkgFile = packageLoadFile(filePath) as any;
    const manager = new ManagerLocal(type, this.config.config);
    await manager.sync();
    for (const slug in pkgFile[type]) {
      await manager.uninstall(slug, pkgFile[type][slug]);
    }
    pkgFile.installed = true;
    return pkgFile;
  }
}

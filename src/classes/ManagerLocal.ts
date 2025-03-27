import path from 'path';
import { Package } from './Package.js';
import { PackageVersion } from '../types/Package.js';
import { Manager } from './Manager.js';
import {
  archiveExtract,
  dirCreate,
  dirDelete,
  dirEmpty,
  dirMove,
  dirRead,
  fileCreate,
  fileCreateJson,
  fileCreateYaml,
  fileExists,
  fileHash,
  fileInstall,
  fileOpen,
  fileReadJson,
  fileReadYaml,
  filesMove,
  isAdmin,
  runCliAsAdmin,
} from '../helpers/file.js';
import { isValidVersion, pathGetSlug, pathGetVersion, toSlug } from '../helpers/utils.js';
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
import { FileFormat } from '../types/FileFormat.js';
import { licenses } from '../types/License.js';
import { PluginType, PluginTypeOption, pluginTypes } from '../types/PluginType.js';
import { PresetTypeOption, presetTypes } from '../types/PresetType.js';
import { ProjectTypeOption, projectTypes } from '../types/ProjectType.js';
import { SystemType } from '../types/SystemType.js';
import { packageLoadFile, packageSaveFile } from '../helpers/packageLocal.js';
import inquirer from 'inquirer';

export class ManagerLocal extends Manager {
  protected typeDir: string;

  constructor(type: RegistryType, config?: ConfigInterface) {
    super(type, config);
    this.config = new ConfigLocal(config);
    this.typeDir = this.config.get(`${type}Dir`) as string;
  }

  async create() {
    // TODO Rewrite this code after prototype is proven.
    const pkgQuestions = [
      {
        name: 'org',
        type: 'input',
        message: 'Org id',
        default: 'org-name',
        validate: (value: string) => value === toSlug(value),
      },
      {
        name: 'package',
        type: 'input',
        message: 'Package id',
        default: 'package-name',
        validate: (value: string) => value === toSlug(value),
      },
      {
        name: 'version',
        type: 'input',
        message: 'Package version',
        default: '1.0.0',
        validate: (value: string) => isValidVersion(value),
      },
    ];
    const pkgAnswers = await inquirer.prompt(pkgQuestions as any);
    let types: PluginTypeOption[] | PresetTypeOption[] | ProjectTypeOption[] = pluginTypes;
    if (this.type === RegistryType.Presets) {
      types = presetTypes;
    } else if (this.type === RegistryType.Projects) {
      types = projectTypes;
    }
    const pkgVersionQuestions = [
      { name: 'name', type: 'input', message: 'Package name' },
      { name: 'author', type: 'input', message: 'Author name' },
      { name: 'description', type: 'input', message: 'Description' },
      { name: 'license', type: 'list', message: 'License', choices: licenses },
      { name: 'type', type: 'list', message: 'Type', choices: types },
      {
        name: 'tags',
        type: 'input',
        message: 'Tags (comma-separated)',
        filter: (input: string) =>
          input
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0),
      },
      {
        name: 'url',
        type: 'input',
        message: 'Website url',
        default: `https://github.com/${pkgAnswers.org}/${pkgAnswers.package}`,
      },
      {
        name: 'audio',
        type: 'input',
        message: 'Audio preview url',
        default: `https://open-audio-stack.github.io/open-audio-stack-registry/${this.type}/${pkgAnswers.org}/${pkgAnswers.package}/${pkgAnswers.package}.flac`,
      },
      {
        name: 'image',
        type: 'input',
        message: 'Image preview url',
        default: `https://open-audio-stack.github.io/open-audio-stack-registry/${this.type}/${pkgAnswers.org}/${pkgAnswers.package}/${pkgAnswers.package}.jpg`,
      },
      { name: 'date', type: 'input', message: 'Date released', default: new Date().toISOString() },
      { name: 'changes', type: 'input', message: 'List of changes' },
    ];
    if (this.type === RegistryType.Projects) {
      pkgVersionQuestions.push({ name: 'open', type: 'input', message: 'File to open' });
    }
    const pkgVersionAnswers = await inquirer.prompt(pkgVersionQuestions as any);
    // TODO prompt for each file.
    pkgVersionAnswers.files = [];
    if (this.type === RegistryType.Presets || this.type === RegistryType.Projects) {
      pkgVersionAnswers.plugins = [];
    }
    this.log(pkgVersionAnswers);
    const pkg = new Package(`${pkgAnswers.org}/${pkgAnswers.package}`);
    pkg.addVersion(pkgAnswers.version, pkgVersionAnswers as PackageVersion);
    this.log(JSON.stringify(pkg.getReport(), null, 2));
    this.addPackage(pkg);
  }

  scan(ext = 'json', installable = true) {
    const filePaths: string[] = dirRead(path.join(this.typeDir, '**', `index.${ext}`));
    filePaths.forEach((filePath: string) => {
      let subPath: string = filePath.replace(`${this.typeDir}` + path.sep, '');
      // TODO improve this code.
      const parts = subPath.split(path.sep);
      parts.shift();
      subPath = parts.join(path.sep);
      const pkgJson =
        ext === 'yaml' ? (fileReadYaml(filePath) as PackageVersion) : (fileReadJson(filePath) as PackageVersion);
      if (installable) pkgJson.installed = true;
      const pkg = new Package(pathGetSlug(subPath, path.sep));
      const version = pathGetVersion(subPath, path.sep);
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
      dirCreate(path.join(dir, pkgSlug));
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
    this.log('install', slug, version);
    // Get package information from registry.
    const pkg: Package | undefined = this.getPackage(slug);
    if (!pkg) return this.log(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) return this.log(`Package ${slug} version ${versionNum} not found in registry`);
    if (pkgVersion.installed) {
      this.log(`Package ${slug} version ${versionNum} already installed`);
      return pkgVersion;
    }

    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      let command: string = `--appDir "${this.config.get('appDir')}" --operation "install" --type "${this.type}" --id "${slug}"`;
      if (version) command += ` --ver "${version}"`;
      if (this.debug) command += ` --log`;
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
    if (!files.length) return this.log(`Error: No compatible files found for ${slug}`);
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
      if (hash !== file.sha256) return this.log(`Error: ${filePath} hash mismatch`);

      // If installer, run the installer headless (without the user interface).
      if (file.type === FileType.Installer) {
        if (isTests()) fileOpen(filePath);
        else fileInstall(filePath);
        // Currently we don't get a list of paths from the installer.
        // Create empty directory and save package version information.
        // Installers have to be manually uninstalled for now.
        const dirTarget: string = path.join(this.typeDir, 'Installers', slug, versionNum);
        dirCreate(dirTarget);
        fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
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
        await archiveExtract(filePath, dirSource);

        // Move entire directory, maintaining the same folder structure.
        if (pkgVersion.type === PluginType.Sampler) {
          const dirTarget: string = path.join(this.typeDir, 'Samplers', dirSub);
          dirCreate(dirTarget);
          dirMove(dirSource, dirTarget);
          fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
        } else {
          // Move only supported file extensions into their respective installation directories.
          const filesMoved: string[] = filesMove(dirSource, this.typeDir, dirSub, formatDir);
          filesMoved.forEach((fileMoved: string) => {
            const fileJson: string = path.join(path.dirname(fileMoved), 'index.json');
            fileCreateJson(fileJson, pkgVersion);
          });
        }
      }
    }
    pkgVersion.installed = true;
    return pkgVersion;
  }

  async installAll() {
    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      let command: string = `--appDir "${this.config.get('appDir')}" --operation "installAll" --type "${this.type}"`;
      if (this.debug) command += ` --log`;
      await runCliAsAdmin(command);
      return this.listPackages();
    }

    // Loop through all packages and install each one.
    for (const [slug, pkg] of this.packages) {
      const versionNum: string = pkg.latestVersion();
      await this.install(slug, versionNum);
    }
    return this.listPackages();
  }

  async installDependency(slug: string, version?: string, filePath?: string, type = RegistryType.Plugins) {
    // Get dependency package information from registry.
    const manager = new ManagerLocal(type, this.config.config);
    await manager.sync();
    manager.scan();
    const pkg: Package | undefined = manager.getPackage(slug);
    if (!pkg) return this.log(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) return this.log(`Package ${slug} version ${versionNum} not found in registry`);
    // Get local package file.
    const pkgFile = packageLoadFile(filePath) as any;
    if (pkgFile[type] && pkgFile[type][slug] && pkgFile[type][slug] === versionNum) {
      return this.log(`Package ${slug} version ${versionNum} is already a dependency`);
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
    manager.scan();
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
    if (!pkg) return this.log(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) return this.log(`Package ${slug} version ${versionNum} not found in registry`);
    if (!pkgVersion.installed) return this.log(`Package ${slug} version ${versionNum} not installed`);

    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      let command: string = `--appDir "${this.config.get('appDir')}" --operation "uninstall" --type "${this.type}" --id "${slug}"`;
      if (version) command += ` --ver "${version}"`;
      if (this.debug) command += ` --log`;
      await runCliAsAdmin(command);
      return this.getPackage(slug)?.getVersion(versionNum);
    }

    // Delete all directories for this package version.
    const versionDirs: string[] = dirRead(path.join(this.typeDir, '**', slug, versionNum));
    versionDirs.forEach((versionDir: string) => {
      dirDelete(versionDir);
    });

    // Delete all empty directories for this package.
    const pkgDirs: string[] = dirRead(path.join(this.typeDir, '**', slug));
    pkgDirs.forEach((pkgDir: string) => {
      if (dirEmpty(pkgDir)) dirDelete(pkgDir);
    });

    // Delete all empty directories for the org.
    const orgDirs: string[] = dirRead(path.join(this.typeDir, '**', slug.split('/')[0]));
    orgDirs.forEach((orgDir: string) => {
      if (dirEmpty(orgDir)) dirDelete(orgDir);
    });

    delete pkgVersion.installed;
    return this.getPackage(slug)?.getVersion(versionNum);
  }

  async uninstallDependency(slug: string, version?: string, filePath?: string, type = RegistryType.Plugins) {
    // Get local package file.
    const pkgFile = packageLoadFile(filePath) as any;
    if (!pkgFile[type]) return this.log(`Package ${type} is missing`);
    if (!pkgFile[type][slug]) return this.log(`Package ${type} ${slug} is not a dependency`);

    // Uninstall dependency.
    const manager = new ManagerLocal(type, this.config.config);
    await manager.sync();
    manager.scan();
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
    manager.scan();
    for (const slug in pkgFile[type]) {
      await manager.uninstall(slug, pkgFile[type][slug]);
    }
    pkgFile.installed = true;
    return pkgFile;
  }
}

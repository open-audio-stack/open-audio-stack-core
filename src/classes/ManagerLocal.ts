import path from 'path';
import { Package } from './Package.js';
import { PackageVersion } from '../types/Package.js';
import { Manager } from './Manager.js';
import { Architecture } from '../types/Architecture.js';
import {
  archiveExtract,
  dirCreate,
  dirDelete,
  dirEmpty,
  dirExists,
  dirIs,
  dirMove,
  dirRead,
  fileCreate,
  fileCreateJson,
  fileCreateYaml,
  fileExec,
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
import { isValidGithubRepo, isValidSlug, isValidVersion, pathGetSlug, pathGetVersion } from '../helpers/utils.js';
import { commandExists, getArchitecture, getSystem, isTests } from '../helpers/utilsLocal.js';
import { apiBuffer } from '../helpers/api.js';
import { CreateQuestion, createPackageQuestions, createPackageVersionQuestions } from '../helpers/createQuestions.js';
import { FileInterface } from '../types/File.js';
import { FileType } from '../types/FileType.js';
import { RegistryType } from '../types/Registry.js';
import { PluginFormat, pluginFormatDir } from '../types/PluginFormat.js';
import { ConfigInterface } from '../types/Config.js';
import { ConfigLocal } from './ConfigLocal.js';
import { packageCompatibleFiles, packageErrors, packageRecommendations } from '../helpers/package.js';
import { PresetInterface } from '../types/Preset.js';
import { presetFormatDir } from '../types/PresetFormat.js';
import { ProjectInterface } from '../types/Project.js';
import { projectFormatDir } from '../types/ProjectFormat.js';
import { FileFormat } from '../types/FileFormat.js';
import { PluginType } from '../types/PluginType.js';
import { SystemType } from '../types/SystemType.js';
import { packageLoadFile, packageSaveFile } from '../helpers/packageLocal.js';

export class ManagerLocal extends Manager {
  protected typeDir: string;
  protected unsupported: string[];

  constructor(type: RegistryType, config?: ConfigInterface) {
    super(type, config);
    this.config = new ConfigLocal(config);
    this.typeDir = this.config.get(`${type}Dir`) as string;
    this.unsupported = [];
  }

  isPackageInstalled(slug: string, version: string): boolean {
    const versionDirs: string[] = dirRead(path.join(this.typeDir, '**', slug, version));
    return versionDirs.length > 0;
  }

  // Desired Platform override (see specification.md "Platform and Architecture Detection") -
  // the runtime's auto-detected architecture doesn't always match what the user actually needs
  // (e.g. a native ARM64 manager running alongside a DAW under x64 emulation), so a configured
  // value always wins over auto-detection. Falls back to auto-detection if the configured value
  // isn't a recognized Architecture, rather than silently filtering out every package.
  getDesiredArchitecture(): Architecture {
    const configured = this.config.get('architecture') as Architecture | undefined;
    if (configured && Object.values(Architecture).includes(configured)) return configured;
    return getArchitecture();
  }

  getDesiredSystem(): SystemType {
    const configured = this.config.get('system') as SystemType | undefined;
    if (configured && Object.values(SystemType).includes(configured)) return configured;
    return getSystem();
  }

  async clone(slug: string, template: string) {
    this.log('clone', slug, template);
    if (!isValidSlug(slug)) throw new Error(`Invalid package slug: ${slug}`);
    if (!isValidGithubRepo(template)) throw new Error(`Invalid template repo: ${template}`);

    // "Package already installed" (per spec) doesn't apply to authoring a new package from a
    // template - there's no runtime install to check. The equivalent guard here is: don't
    // clobber a package that's already been scaffolded at the target directory.
    const dirTarget: string = path.join(this.config.get('templatesDir') as string, this.type, slug);
    if (dirExists(dirTarget)) throw new Error(`Package ${slug} already exists at ${dirTarget}`);

    // Download the template repo's default branch directly via GitHub's content-delivery
    // archive route - "HEAD" resolves to whatever the default branch is, the same trick tools
    // like degit use - rather than first resolving the branch name through the REST API
    // (api.github.com). That endpoint has a strict unauthenticated rate limit (60 requests/hour,
    // shared across a CI runner's IP pool), which a single clone() call has no business burning
    // just to look up a branch name; this route has no such limit.
    const templateUrl = `https://github.com/${template}/archive/HEAD.zip`;

    // Download to a template-scoped cache dir so repeat clones of the same template reuse it,
    // matching the download-caching pattern used by install().
    const dirDownloads: string = path.join(this.config.get('appDir') as string, 'downloads', 'templates', template);
    dirCreate(dirDownloads);
    const zipPath: string = path.join(dirDownloads, 'HEAD.zip');
    if (!fileExists(zipPath)) {
      let fileBuffer: ArrayBuffer;
      try {
        fileBuffer = await apiBuffer(templateUrl);
      } catch {
        throw new Error(`Template ${template} not found on GitHub`);
      }
      fileCreate(zipPath, Buffer.from(fileBuffer));
    }

    const dirExtract: string = path.join(this.config.get('appDir') as string, 'temp', 'templates', template);
    dirDelete(dirExtract);
    await archiveExtract(zipPath, dirExtract);

    // GitHub codeload zips always contain exactly one top-level folder (named "<repo>-<branch>"
    // for a branch/tag ref, or "<repo>-<short-sha>" for the "HEAD" ref used above) - found by
    // path rather than assumed by name, since the exact name isn't otherwise knowable here.
    const extractedDirs: string[] = dirRead(path.join(dirExtract, '*')).filter(dirIs);
    const dirSource: string = extractedDirs[0] || dirExtract;

    dirCreate(path.dirname(dirTarget));
    dirMove(dirSource, dirTarget);
    dirDelete(dirExtract);

    return dirTarget;
  }

  // Interactive prompting (previously driven by the `inquirer` package directly from this
  // method) doesn't belong in an isomorphic browser/server library - see review.md item 5. The
  // question metadata below is what a CLI needs to drive its own prompt library; createSave()
  // then persists whatever it collects. createQuestions() first, to obtain org/package (needed
  // to compute createVersionQuestions()'s own defaults), then createVersionQuestions(org, pkg).

  createQuestions(): CreateQuestion[] {
    return createPackageQuestions();
  }

  createVersionQuestions(org: string, pkg: string): CreateQuestion[] {
    return createPackageVersionQuestions(this.type, org, pkg);
  }

  // A freshly created package is expected to be incomplete - there is no built/published release
  // yet, so `files` (and, for Presets/Projects, `plugins`) default to empty rather than requiring
  // the caller to remember to set them - so, unlike Package.addVersion() which throws on any
  // validation error, this only logs errors/recommendations as a report and always persists - the
  // point of `create` is to scaffold the metadata file for a developer to fill in over time, not
  // to produce a fully valid, publishable package on the first pass.
  createSave(slug: string, pkgVersion: PackageVersion, dirPath?: string) {
    if (!isValidSlug(slug)) throw new Error(`Invalid package slug: ${slug}`);
    if (!pkgVersion.files) pkgVersion.files = [];
    if (this.type === RegistryType.Presets || this.type === RegistryType.Projects) {
      const pkgVersionWithPlugins = pkgVersion as PresetInterface | ProjectInterface;
      if (!pkgVersionWithPlugins.plugins) pkgVersionWithPlugins.plugins = {};
    }
    const errors = packageErrors(pkgVersion);
    const recs = packageRecommendations(pkgVersion);
    this.logReport(slug, errors, recs);

    const filePath: string = path.join(dirPath || '.', 'index.json');
    dirCreate(path.dirname(filePath));
    packageSaveFile(pkgVersion, filePath);
    return filePath;
  }

  scan(ext = 'json', installable = true) {
    // Reset on each call - a package that was unsupported on a previous scan may have since
    // been identified (e.g. after a sync()), and stale entries shouldn't linger.
    this.unsupported = [];

    // Walk every directory under typeDir rather than only globbing for existing index.$ext
    // files, so packages installed by another manager (or by hand, with no metadata file at
    // all) are still discovered instead of silently invisible to scan(). A directory is treated
    // as a package version directory purely by its basename being a valid semver version - the
    // same convention pathGetSlug()/pathGetVersion() already rely on - so this works regardless
    // of the format-specific subdirectory nesting used by install() (e.g. VST vs VST3, or no
    // format subdirectory at all for apps/presets/projects).
    const versionDirs: string[] = dirRead(path.join(this.typeDir, '**'))
      .filter(dirIs)
      .filter(dir => isValidVersion(path.basename(dir)));

    versionDirs.forEach((versionDir: string) => {
      const subPath: string = versionDir.replace(`${this.typeDir}${path.sep}`, '');
      const slug: string = pathGetSlug(subPath, path.sep);
      const version: string = pathGetVersion(subPath, path.sep);
      const filePath: string = path.join(versionDir, `index.${ext}`);

      if (fileExists(filePath)) {
        // Package Validation: check the file is structurally valid before trusting it, rather
        // than letting Package.addVersion() throw and abort the rest of the scan over one bad
        // package.
        const pkgJson =
          ext === 'yaml' ? (fileReadYaml(filePath) as PackageVersion) : (fileReadJson(filePath) as PackageVersion);
        if (packageErrors(pkgJson).length > 0) {
          this.unsupported.push(versionDir);
          return;
        }
        if (installable) pkgJson.installed = true;
        const pkg = new Package(slug);
        pkg.addVersion(version, pkgJson);
        this.addPackage(pkg);
        return;
      }

      // No metadata file - most likely installed by another manager, or by hand. Fall back to
      // whatever this manager already knows about the registry (from a prior sync()) to
      // identify the package, and write its metadata alongside the files for next time.
      const registryVersion: PackageVersion | undefined = this.getPackage(slug)?.getVersion(version);
      if (!registryVersion) {
        this.unsupported.push(versionDir);
        return;
      }
      const pkgJson: PackageVersion = { ...registryVersion, ...(installable && { installed: true }) };
      fileCreateJson(filePath, pkgJson);
      const pkg = new Package(slug);
      pkg.addVersion(version, pkgJson);
      this.addPackage(pkg);
    });
  }

  getUnsupported(): string[] {
    return this.unsupported;
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
    // slug/version can originate from remote registry JSON (via sync(), e.g. through
    // installAll() iterating every synced package) or from a local project file - never from a
    // value the caller has already validated. Reject anything malformed before it can reach the
    // elevated command payload built below.
    if (!isValidSlug(slug)) throw new Error(`Invalid package slug: ${slug}`);
    if (version && !isValidVersion(version)) throw new Error(`Invalid package version: ${version}`);
    // Get package information from registry.
    const pkg: Package | undefined = this.getPackage(slug);
    if (!pkg) throw new Error(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) throw new Error(`Package ${slug} version ${versionNum} not found in registry`);
    if (this.isPackageInstalled(slug, versionNum)) {
      this.log(`Package ${slug} version ${versionNum} already installed`);
      pkgVersion.installed = true;
      return pkgVersion;
    }

    // Check for compatible files before running admin command
    const excludedFormats: FileFormat[] = [];
    const system = this.getDesiredSystem();
    if (system === SystemType.Linux) {
      const hasDpkg = await commandExists('dpkg');
      const hasRpm = await commandExists('rpm');
      // If both exist, prefer DEB over RPM
      if (hasDpkg && hasRpm) {
        excludedFormats.push(FileFormat.RedHatPackage);
      } else if (!hasDpkg) {
        excludedFormats.push(FileFormat.DebianPackage);
      } else if (!hasRpm) {
        excludedFormats.push(FileFormat.RedHatPackage);
      }
    }
    let files: FileInterface[] = packageCompatibleFiles(
      pkgVersion,
      [this.getDesiredArchitecture()],
      [system],
      excludedFormats,
    );
    if (!files.length) throw new Error(`No compatible files found for ${slug}`);

    // Elevate permissions if not running as admin, unless a compatible archive is available -
    // archives install into a user-owned pluginsDir without elevation, so only fall back to
    // elevation when the only compatible files are installers.
    if (!isAdmin() && !isTests()) {
      const archiveFiles: FileInterface[] = files.filter(file => file.type === FileType.Archive);
      if (archiveFiles.length > 0) {
        files = archiveFiles;
      } else {
        await runCliAsAdmin({
          appDir: this.config.get('appDir') as string,
          operation: 'install',
          type: this.type,
          id: slug,
          version,
          log: this.debug,
        });
        const returnedPkg = this.getPackage(slug)?.getVersion(versionNum);
        if (returnedPkg) {
          if (this.isPackageInstalled(slug, versionNum)) returnedPkg.installed = true;
          else delete returnedPkg.installed;
          return returnedPkg;
        }
      }
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
    // Every directory this call populates under `this.typeDir` (the live, user-facing install
    // location that isPackageInstalled()/scan() look at) - tracked so that if a later file in
    // this loop fails (hash mismatch, extraction error, ...), everything already installed for
    // this call can be rolled back instead of leaving a partial install that looks installed but
    // is actually missing files. Downloads/extraction happen in scratch temp directories outside
    // typeDir and are deliberately left alone - see the download-caching note in
    // ManagerLocal.test.ts.
    const installedDirs = new Set<string>();
    try {
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
        if (hash !== file.sha256) throw new Error(`${filePath} hash mismatch`);

        // If installer, run the installer headless (without the user interface).
        if (file.type === FileType.Installer) {
          // Test time out if installing during tests.
          if (isTests()) fileOpen(filePath);
          else fileInstall(filePath);
          // Currently we don't get a list of paths from the installer.
          // Create empty directory and save package version information.
          // Installers have to be manually uninstalled for now.
          const dirTarget: string = path.join(this.typeDir, 'Installers', slug, versionNum);
          dirCreate(dirTarget);
          fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
          installedDirs.add(dirTarget);
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
          if (this.type === RegistryType.Apps) formatDir = pluginFormatDir;
          else if (this.type === RegistryType.Presets) formatDir = presetFormatDir;
          else if (this.type === RegistryType.Projects) formatDir = projectFormatDir;
          await archiveExtract(filePath, dirSource);

          // Move entire directory, maintaining the same folder structure.
          if (pkgVersion.type === PluginType.Sampler) {
            const dirTarget: string = path.join(this.typeDir, 'Samplers', dirSub);
            dirCreate(dirTarget);
            dirMove(dirSource, dirTarget);
            fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
            installedDirs.add(dirTarget);
          } else {
            // Check if archive contains installer files (pkg, dmg) that should be run
            const allFiles = dirRead(`${dirSource}/**/*`).filter(f => !dirIs(f));
            const installerFiles = allFiles.filter(f => {
              const ext = path.extname(f).toLowerCase();
              return ext === '.pkg' || ext === '.dmg';
            });

            if (installerFiles.length > 0) {
              // Run installer files found in archive
              for (const installerFile of installerFiles) {
                if (isTests()) fileOpen(installerFile);
                else fileInstall(installerFile);
              }
              // Create directory and save package info for installer
              const dirTarget: string = path.join(this.typeDir, 'Installers', dirSub);
              dirCreate(dirTarget);
              fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
              installedDirs.add(dirTarget);
            } else if (this.type === RegistryType.Plugins) {
              // For plugins, move files into type-specific subdirectories
              const filesMoved: string[] = filesMove(dirSource, this.typeDir, dirSub, formatDir);
              if (filesMoved.length === 0) {
                throw new Error(`No compatible files found to install for ${slug}`);
              }
              filesMoved.forEach((fileMoved: string) => {
                const fileJson: string = path.join(path.dirname(fileMoved), 'index.json');
                fileCreateJson(fileJson, pkgVersion);
                // A single archive can contain multiple formats (e.g. VST3 and CLAP), moved into
                // different formatDir subdirectories - track each one, not just the first.
                installedDirs.add(path.dirname(fileMoved));
              });
            } else {
              // For apps/projects/presets, move entire directory without type subdirectories
              const dirTarget: string = path.join(this.typeDir, dirSub);
              dirCreate(dirTarget);
              dirMove(dirSource, dirTarget);
              fileCreateJson(path.join(dirTarget, 'index.json'), pkgVersion);
              installedDirs.add(dirTarget);
              // Ensure executable permissions for likely executables inside moved app/project/preset
              try {
                const movedFiles = dirRead(path.join(dirTarget, '**', '*')).filter(f => !dirIs(f));
                movedFiles.forEach((movedFile: string) => {
                  const ext = path.extname(movedFile).slice(1).toLowerCase();
                  if (['', 'elf', 'exe'].includes(ext)) {
                    try {
                      fileExec(movedFile);
                    } catch (err) {
                      this.log(`Failed to set exec on ${movedFile}:`, err);
                    }
                  }
                });
              } catch (err) {
                this.log('Error while setting executable permissions:', err);
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
                        this.log(`Failed to set exec on app binary ${binFile}:`, err);
                      }
                    });
                  } catch (err) {
                    this.log(`Error scanning .app contents for ${appDir}:`, err);
                  }
                });
              } catch (err) {
                this.log(err);
              }
            }
          }
        }
      }
    } catch (err) {
      // Roll back everything this call already installed under typeDir before propagating -
      // otherwise a package that failed partway through would be left looking installed (its
      // version directory exists) while actually missing files, and neither isPackageInstalled()
      // nor scan() would have any way to tell the difference.
      for (const dir of installedDirs) dirDelete(dir);
      throw err;
    }
    pkgVersion.installed = true;
    return pkgVersion;
  }

  async installAll() {
    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      await runCliAsAdmin({
        appDir: this.config.get('appDir') as string,
        operation: 'installAll',
        type: this.type,
        id: '',
        log: this.debug,
      });
      return this.listPackages();
    }

    // Loop through all packages and install each one.
    for (const pkg of this.listPackages()) {
      const versionNum: string = pkg.latestVersion();
      await this.install(pkg.slug, versionNum);
    }
    return this.listPackages();
  }

  async installDependency(slug: string, version?: string, filePath?: string, type = RegistryType.Plugins) {
    // Get dependency package information from registry.
    const manager = new ManagerLocal(type, this.config.config);
    await manager.sync();
    manager.scan();
    const pkg: Package | undefined = manager.getPackage(slug);
    if (!pkg) throw new Error(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) throw new Error(`Package ${slug} version ${versionNum} not found in registry`);
    // Get local package file.
    const pkgFile = packageLoadFile(filePath) as any;
    if (pkgFile[type] && pkgFile[type][slug] && pkgFile[type][slug] === versionNum) {
      this.log(`Package ${slug} version ${versionNum} is already a dependency`);
      pkgFile.installed = true;
      return pkgFile;
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

  async installDependencies(filePath: string, type = RegistryType.Plugins) {
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

  open(slug: string, version?: string, options: string[] = []) {
    this.log('open', slug, version, options);

    // Get package information
    const pkg = this.getPackage(slug);
    if (!pkg) {
      throw new Error(`Package ${slug} not found`);
    }

    const versionNum = version || pkg.latestVersion();
    const pkgVersion = pkg.getVersion(versionNum);
    if (!pkgVersion) {
      throw new Error(`Package ${slug} version ${versionNum} not found`);
    }

    // Check if package is installed
    if (!this.isPackageInstalled(slug, versionNum)) {
      throw new Error(`Package ${slug} version ${versionNum} not installed`);
    }

    // Filter compatible files and find one with open field
    const files: FileInterface[] = packageCompatibleFiles(
      pkgVersion,
      [this.getDesiredArchitecture()],
      [this.getDesiredSystem()],
      [],
    );

    const openableFile = files.find(file => (file as any).open);
    if (!openableFile) {
      throw new Error(`Package ${slug} has no compatible file with open command defined`);
    }

    // Let fileOpen()/path errors propagate rather than catching them here - every other
    // mutating method on this class (install, uninstall, installDependency, ...) throws on
    // failure, and swallowing errors into a `false` return would be the only exception to that,
    // silently discarding the actual cause in the (default, debug logging disabled) case.
    const openPath = (openableFile as any).open;
    const fileExt: string = path.extname(openPath).slice(1).toLowerCase();
    let packageDir: string;

    if (this.type === RegistryType.Plugins) {
      // For plugins, use type-specific subdirectories
      const formatDir: string = pluginFormatDir[fileExt as PluginFormat] || 'Plugin';
      packageDir = path.join(this.typeDir, formatDir, slug, versionNum);
    } else {
      // For apps/projects/presets, files are in direct package directory
      packageDir = path.join(this.typeDir, slug, versionNum);
    }
    let fullPath: string;
    if (path.isAbsolute(openPath)) {
      fullPath = openPath;
    } else if (fileExt === 'app') {
      // For .app bundles, construct path to executable inside Contents/MacOS/
      const appName = path.basename(openPath, '.app');
      fullPath = path.join(packageDir, openPath, 'Contents', 'MacOS', appName);
    } else {
      fullPath = path.join(packageDir, openPath);
    }
    const command = `"${fullPath}" ${options.join(' ')}`;

    this.log(`Running: ${command}`);
    fileOpen(fullPath, options);
    return true;
  }

  async uninstall(slug: string, version?: string) {
    if (!isValidSlug(slug)) throw new Error(`Invalid package slug: ${slug}`);
    if (version && !isValidVersion(version)) throw new Error(`Invalid package version: ${version}`);
    // Get package information from registry.
    const pkg: Package | undefined = this.getPackage(slug);
    if (!pkg) throw new Error(`Package ${slug} not found in registry`);
    const versionNum: string = version || pkg.latestVersion();
    const pkgVersion: PackageVersion | undefined = pkg?.getVersion(versionNum);
    if (!pkgVersion) throw new Error(`Package ${slug} version ${versionNum} not found in registry`);
    if (!this.isPackageInstalled(slug, versionNum))
      throw new Error(`Package ${slug} version ${versionNum} not installed`);

    // Elevate permissions if not running as admin.
    if (!isAdmin() && !isTests()) {
      await runCliAsAdmin({
        appDir: this.config.get('appDir') as string,
        operation: 'uninstall',
        type: this.type,
        id: slug,
        version,
        log: this.debug,
      });
      const returnedPkg = this.getPackage(slug)?.getVersion(versionNum);
      if (returnedPkg) {
        if (this.isPackageInstalled(slug, versionNum)) returnedPkg.installed = true;
        else delete returnedPkg.installed;
        return returnedPkg;
      }
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
    return pkgVersion;
  }

  async uninstallDependency(slug: string, version?: string, filePath?: string, type = RegistryType.Plugins) {
    // Get local package file.
    const pkgFile = packageLoadFile(filePath) as any;
    if (!pkgFile[type] || !pkgFile[type][slug]) {
      // Mirrors installDependency()'s "already a dependency" no-op: the requested end state
      // (this dependency is gone) is already true, so this is idempotent success rather than an
      // error - matches how most package managers treat "already removed"/"already installed".
      this.log(`Package ${type} ${slug} is not a dependency`);
      pkgFile.installed = true;
      return pkgFile;
    }

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

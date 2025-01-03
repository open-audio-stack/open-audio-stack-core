import { dirRead, fileReadJson, isAdmin, runCliAsAdmin } from './helpers/file.js';
import { PluginInterface } from '../src/types/Plugin.js';
import { PresetInterface } from '../src/types/Preset.js';
import { Manager } from './Manager.js';
import { isTests, pathGetSlug, pathGetVersion } from './helpers/utils.js';
import { ProjectInterface } from './types/Project.js';
import { RegistryInterface, RegistryType } from './types/Registry.js';
import { PackageVersionType } from '../src/types/Package.js';
import { ConfigLocal } from './ConfigLocal.js';
import { ConfigInterface } from './types/Config.js';
import path from 'path';

export class ManagerLocal extends Manager {
  override config: ConfigLocal;

  constructor(config: ConfigInterface, registry?: RegistryInterface) {
    super(config, registry);
    const configPath: string = path.join(config.appDir || '', 'config.json');
    this.config = new ConfigLocal(configPath, config);
    this.scanLocal(RegistryType.Plugins);
    this.scanLocal(RegistryType.Presets);
    this.scanLocal(RegistryType.Projects);
  }

  scanLocal(type: RegistryType) {
    const rootDir: string = this.config.get(`${type}Dir`) as string;
    const filePaths: string[] = dirRead(`${rootDir}/**/*.json`);
    filePaths.forEach((filePath: string) => {
      const subPath: string = filePath.replace(`${rootDir}/`, '');
      const pkgSlug: string = pathGetSlug(subPath);
      const pkgVersion: string = pathGetVersion(subPath);
      const pkgFile = fileReadJson(filePath) as PluginInterface | PresetInterface | ProjectInterface;
      this.registry.packageVersionAdd(type, pkgSlug, pkgVersion, pkgFile);
    });
  }

  async packageInstall(type: RegistryType, slug: string, version?: string) {
    const pkg: PackageVersionType = this.registry.packageLatest(type, slug, version);
    if (pkg.installed) return 'Package already installed';
    if (!isAdmin() && !isTests()) {
      let command: string = `--operation install`;
      if (type) command += ` --type ${type}`;
      if (slug) command += ` --slug ${slug}`;
      if (version) command += ` --ver ${version}`;
      await runCliAsAdmin(command);
      return await this.getBySlug(slug, type, version);
    }
  }

  async packageUninstall(type: RegistryType, slug: string, version?: string) {
    // TODO
    console.log(type, slug, version);
  }
}

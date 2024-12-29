import { dirRead, fileReadJson, isAdmin } from './helpers/file.js';
import { PluginInterface } from '../src/types/Plugin.js';
import { PresetInterface } from '../src/types/Preset.js';
import { Manager } from './Manager.js';
import { isTests, pathGetSlug, pathGetVersion } from './helpers/utils.js';
import { ProjectInterface } from './types/Project.js';
import { RegistryType } from './types/Registry.js';
import { PackageVersionType } from '../src/types/Package.js';

export class ManagerLocal extends Manager {
  dir: string = '';

  constructor(dir: string) {
    super();
    this.dir = dir;
    this.scanLocal(RegistryType.Plugins);
    this.scanLocal(RegistryType.Presets);
    this.scanLocal(RegistryType.Projects);
  }

  scanLocal(type: RegistryType) {
    const filePaths: string[] = dirRead(`${this.dir}/${type}/**/*.json`);
    filePaths.forEach((filePath: string) => {
      const subPath: string = filePath.replace(`${this.dir}/${type}/`, '');
      const pkgSlug: string = pathGetSlug(subPath);
      const pkgVersion: string = pathGetVersion(subPath);
      const pkgFile = fileReadJson(filePath) as PluginInterface | PresetInterface | ProjectInterface;
      this.registry.packageVersionAdd(type, pkgSlug, pkgVersion, pkgFile);
    });
  }

  // packageInstall(type: RegistryType, slug: string, version?: string) {
  //   const pkg: PackageVersionType = this.registry.packageLatest(type, slug, version);
  //   if (pkg.installed) return 'Package already installed';
  //   if (!isAdmin() && !isTests()) {
  //     let command: string = `--operation install`;
  //     if (slug) command += ` --slug ${slug}`;
  //     if (version) command += ` --ver ${version}`;
  //     await runCliAsAdmin(command);
  //     return await pluginGetLocal(plugin.id || '', plugin.version);
  //   }
  // }
}

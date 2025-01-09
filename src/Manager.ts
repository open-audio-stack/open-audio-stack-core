import { Config } from './Config.js';
import { Registry } from './Registry.js';
import { apiJson } from './helpers/api.js';
import { PackageVersion } from '../src/types/Package.js';
import { ConfigInterface, ConfigRegistry } from './types/Config.js';
import { RegistryInterface, RegistryType } from './types/Registry.js';

export class Manager {
  registry: Registry;
  config: Config;

  constructor(config?: ConfigInterface, registry?: RegistryInterface) {
    this.config = new Config(config);
    this.registry = new Registry(registry);
  }

  addPackages(json: RegistryInterface, type: RegistryType) {
    for (const slug in json[type]) {
      this.registry.packageAdd(type, slug, json[type][slug]);
    }
    console.log(`${type}: ${Object.keys(this.registry.packages(type)).length}`);
  }

  async scan(type?: RegistryType) {
    this.registry.reset();
    const registries: ConfigRegistry[] = this.config.get('registries') as ConfigRegistry[];
    for (const index in registries) {
      const json: RegistryInterface = await apiJson(registries[index].url);
      if (type) {
        this.addPackages(json, type);
      } else {
        this.addPackages(json, RegistryType.Plugins);
        this.addPackages(json, RegistryType.Presets);
        this.addPackages(json, RegistryType.Projects);
      }
    }
  }

  filter(query: string | number | object, field: keyof PackageVersion, type?: RegistryType) {
    if (type) {
      return this.registry.packagesFilter(type, query, field);
    }
    return {
      plugins: this.registry.packagesFilter(RegistryType.Plugins, query, field),
      presets: this.registry.packagesFilter(RegistryType.Presets, query, field),
      projects: this.registry.packagesFilter(RegistryType.Projects, query, field),
    };
  }

  search(query: string, type?: RegistryType) {
    if (type) {
      return this.registry.packagesSearch(type, query);
    }
    return {
      plugins: this.registry.packagesSearch(RegistryType.Plugins, query),
      presets: this.registry.packagesSearch(RegistryType.Presets, query),
      projects: this.registry.packagesSearch(RegistryType.Projects, query),
    };
  }

  list(type?: RegistryType) {
    if (type) {
      return this.registry.packages(type);
    }
    return {
      plugins: this.registry.packages(RegistryType.Plugins),
      presets: this.registry.packages(RegistryType.Presets),
      projects: this.registry.packages(RegistryType.Projects),
    };
  }

  listOrg(org: string, type?: RegistryType) {
    if (type) {
      return this.registry.packagesOrg(type, org);
    }
    return {
      plugins: this.registry.packagesOrg(RegistryType.Plugins, org),
      presets: this.registry.packagesOrg(RegistryType.Presets, org),
      projects: this.registry.packagesOrg(RegistryType.Projects, org),
    };
  }

  get(slug: string, type?: RegistryType, version?: string) {
    if (type) {
      const pkg = this.registry.package(type, slug);
      return pkg ? this.registry.packageLatest(type, slug, version) : {};
    }
    const pluginsPkg = this.registry.package(RegistryType.Plugins, slug);
    const presetsPkg = this.registry.package(RegistryType.Presets, slug);
    const projectsPkg = this.registry.package(RegistryType.Projects, slug);
    return {
      plugins: pluginsPkg ? this.registry.packageLatest(RegistryType.Plugins, slug, version) : {},
      presets: presetsPkg ? this.registry.packageLatest(RegistryType.Presets, slug, version) : {},
      projects: projectsPkg ? this.registry.packageLatest(RegistryType.Projects, slug, version) : {},
    };
  }
}

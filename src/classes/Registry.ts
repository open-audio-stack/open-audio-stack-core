import { PackageManager } from './PackageManager.js';
import { RegistryInterface, RegistryType } from '../types/Registry.js';

export class Registry {
  name: string;
  url: string;
  version: string;

  private managers: Record<string, PackageManager>;

  constructor(name: string, url: string, version: string) {
    this.name = name;
    this.url = url;
    this.version = version;
    this.managers = {};
  }

  addManager(type: RegistryType, manager: PackageManager) {
    this.managers[type] = manager;
  }

  getManager(type: RegistryType) {
    return this.managers[type];
  }

  reset() {
    Object.values(this.managers).forEach(manager => manager.reset());
  }

  async sync() {
    for (const [type, manager] of Object.entries(this.managers)) {
      await manager.sync(type as RegistryType);
    }
  }

  toJSON(): RegistryInterface {
    const data: RegistryInterface = {
      name: this.name,
      url: this.url,
      version: this.version,
    };
    for (const [type, manager] of Object.entries(this.managers)) {
      data[type as RegistryType] = manager.toJSON();
    }
    return data;
  }
}

import { Manager } from './Manager.js';
import { RegistryInterface, RegistryType } from '../types/Registry.js';
import { Base } from './Base.js';

export class Registry extends Base {
  name: string;
  url: string;
  version: string;

  protected managers: Record<string, Manager>;

  constructor(name: string, url: string, version: string) {
    super();
    this.name = name;
    this.url = url;
    this.version = version;
    this.managers = {};
  }

  addManager(manager: Manager) {
    this.managers[manager.type] = manager;
  }

  getManager(type: RegistryType) {
    return this.managers[type];
  }

  reset() {
    Object.values(this.managers).forEach(manager => manager.reset());
  }

  async sync() {
    for (const [, manager] of Object.entries(this.managers)) {
      await manager.sync();
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

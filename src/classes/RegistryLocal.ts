import { ManagerLocal } from './ManagerLocal.js';
import { Registry } from './Registry.js';

export class RegistryLocal extends Registry {
  protected override managers: Record<string, ManagerLocal>;

  constructor(name: string, url: string, version: string) {
    super(name, url, version);
    this.managers = {};
  }

  scan(ext = 'json') {
    for (const [, manager] of Object.entries(this.managers)) {
      manager.scan(ext);
    }
  }
}

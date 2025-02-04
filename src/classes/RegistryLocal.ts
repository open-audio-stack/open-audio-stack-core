import path from 'path';
import { ManagerLocal } from './ManagerLocal.js';
import { Registry } from './Registry.js';
import { dirCreate, fileCreateJson, fileCreateYaml } from '../helpers/file.js';

export class RegistryLocal extends Registry {
  protected override managers: Record<string, ManagerLocal>;

  constructor(name: string, url: string, version: string) {
    super(name, url, version);
    this.managers = {};
  }

  export(dir: string, ext = 'json') {
    const saveFile = ext === 'yaml' ? fileCreateYaml : fileCreateJson;
    for (const [, manager] of Object.entries(this.managers)) {
      manager.export(path.join(dir, manager.type), ext);
    }
    dirCreate(dir);
    saveFile(path.join(dir, `index.${ext}`), this.toJSON());
    return true;
  }

  scan(ext = 'json', installable = true) {
    for (const [, manager] of Object.entries(this.managers)) {
      manager.scan(ext, installable);
    }
  }
}

import path from 'path';
import { Config } from './Config.js';
import { dirCreate, fileCreateJson, fileDelete, fileExists, fileReadJson } from './helpers/file.js';
import { ConfigInterface } from './types/Config.js';

export class ConfigLocal extends Config {
  path: string;

  constructor(configPath: string, config?: ConfigInterface) {
    super(config);
    this.path = configPath;
    if (fileExists(this.path)) {
      // Merge local config over config defaults.
      this.config = { ...this.config, ...this.load() };
    } else {
      this.save();
    }
  }

  delete() {
    return fileDelete(this.path);
  }

  load() {
    return fileReadJson(this.path) as ConfigInterface;
  }

  save() {
    dirCreate(path.dirname(this.path));
    return fileCreateJson(this.path, this.getAll());
  }

  override set(key: keyof ConfigInterface, val: any) {
    super.set(key, val);
    this.save();
  }
}

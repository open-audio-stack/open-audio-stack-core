import { Config } from './Config.js';
import { fileDelete, fileExists, fileJsonCreate, fileReadJson } from './helpers/file.js';
import { ConfigInterface } from './types/Config.js';

export class ConfigLocal extends Config {
  path: string;

  constructor(configPath: string, config?: ConfigInterface) {
    super(config);
    this.path = configPath;
    if (fileExists(this.path)) {
      this.config = this.load();
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
    return fileJsonCreate(this.path, this.getAll());
  }

  override set(key: keyof ConfigInterface, val: any) {
    super.set(key, val);
    this.save();
  }
}

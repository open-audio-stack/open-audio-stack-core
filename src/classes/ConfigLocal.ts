import path from 'path';
import { Config } from './Config.js';
import { dirCreate, fileCreateJson, fileCreateYaml, fileDelete, fileExists, fileReadJson } from '../helpers/file.js';
import { ConfigInterface } from '../types/Config.js';
import { configDefaultsLocal } from '../helpers/configLocal.js';

export class ConfigLocal extends Config {
  path: string;

  constructor(configPath: string, config?: ConfigInterface) {
    super(config);
    this.config = { ...configDefaultsLocal(), ...config };
    this.path = configPath;
    if (fileExists(this.path)) {
      this.config = { ...this.config, ...this.load() };
    } else {
      this.save();
    }
  }

  delete() {
    return fileDelete(this.path);
  }

  export(dir: string, ext = 'json') {
    // TODO improve the way this is handled.
    this.exportConfig(path.join(dir, 'architectures'), this.architectures(), ext);
    this.exportConfig(path.join(dir, 'file-formats'), this.fileFormats(), ext);
    this.exportConfig(path.join(dir, 'file-types'), this.fileTypes(), ext);
    this.exportConfig(path.join(dir, 'licenses'), this.licenses(), ext);
    this.exportConfig(path.join(dir, 'plugin-formats'), this.pluginFormats(), ext);
    this.exportConfig(path.join(dir, 'plugin-types'), this.pluginTypes(), ext);
    this.exportConfig(path.join(dir, 'preset-formats'), this.presetFormats(), ext);
    this.exportConfig(path.join(dir, 'preset-types'), this.presetTypes(), ext);
    this.exportConfig(path.join(dir, 'project-formats'), this.projectFormats(), ext);
    this.exportConfig(path.join(dir, 'project-types'), this.projectTypes(), ext);
    this.exportConfig(path.join(dir, 'systems'), this.systems(), ext);
    return true;
  }

  exportConfig(dirRoot: string, items: any, ext = 'json') {
    const saveFile = ext === 'yaml' ? fileCreateYaml : fileCreateJson;
    items.forEach((item: any) => {
      dirCreate(path.join(dirRoot, item.value));
      saveFile(path.join(dirRoot, item.value, `index.${ext}`), item);
    });
    saveFile(path.join(dirRoot, `index.${ext}`), items);
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

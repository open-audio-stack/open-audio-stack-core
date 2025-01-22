import { ConfigInterface } from '../types/Config.js';
import { PackageManager } from './PackageManager.js';

export class PluginManager extends PackageManager {
  constructor(config?: ConfigInterface) {
    super(config);
  }
}

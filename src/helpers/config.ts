import { ConfigInterface } from '../types/Config.js';
import { configDefaults } from './config-defaults.js';

let config: ConfigInterface = configDefaults();

export function configReset() {
  config = configDefaults();
  return config;
}

export function configGet(key: keyof ConfigInterface): any {
  return config[key];
}

export function configSet(key: keyof ConfigInterface, val: any) {
  config[key] = val;
  return configGet(key);
}

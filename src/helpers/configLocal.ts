import { ConfigInterface } from '../types/Config.js';
import { configDefaults } from './config.js';
import { dirApp, dirApps, dirPlugins, dirPresets, dirProjects } from './file.js';

export function configDefaultsLocal(): ConfigInterface {
  return {
    ...configDefaults(),
    appDir: dirApp(),
    appsDir: dirApps(),
    pluginsDir: dirPlugins(),
    presetsDir: dirPresets(),
    projectsDir: dirProjects(),
  };
}

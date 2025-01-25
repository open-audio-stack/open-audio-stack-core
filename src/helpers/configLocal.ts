import { ConfigInterface } from '../types/Config.js';
import { configDefaults } from './config.js';
import { dirApp, dirPlugins, dirPresets, dirProjects } from './file.js';

export function configDefaultsLocal(): ConfigInterface {
  return {
    ...configDefaults(),
    appDir: dirApp(),
    pluginsDir: dirPlugins(),
    presetsDir: dirPresets(),
    projectsDir: dirProjects(),
  };
}

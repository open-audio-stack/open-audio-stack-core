import path from 'path';
import { dirApp, dirPlugins, dirPresets, dirProjects } from '../../src/helpers/file';
import { ConfigInterface } from '../../src/types/Config';

export const CONFIG: ConfigInterface = {
  registries: [
    {
      name: 'Open Audio Registry',
      url: 'https://open-audio-stack.github.io/open-audio-stack-registry',
    },
  ],
  version: '1.0.0',
};

export const CONFIG_LOCAL: ConfigInterface = {
  ...CONFIG,
  appDir: dirApp(),
  pluginsDir: dirPlugins(),
  presetsDir: dirPresets(),
  projectsDir: dirProjects(),
};

export const CONFIG_LOCAL_TEST: ConfigInterface = {
  ...CONFIG,
  appDir: 'test',
  pluginsDir: path.join('test', 'installed', 'plugins'),
  presetsDir: path.join('test', 'installed', 'presets'),
  projectsDir: path.join('test', 'installed', 'projects'),
};

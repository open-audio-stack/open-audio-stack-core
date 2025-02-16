import path from 'path';
import { beforeAll, expect, test } from 'vitest';
import { CONFIG_LOCAL, CONFIG_LOCAL_TEST } from '../data/Config.js';
import { ConfigLocal } from '../../src/classes/ConfigLocal.js';
import { architectures, Architecture } from '../../src/types/Architecture.js';
import { PluginFormat, pluginFormats } from '../../src/types/PluginFormat.js';
import { FileFormat, fileFormats } from '../../src/types/FileFormat.js';
import { FileType, fileTypes } from '../../src/types/FileType.js';
import { License, licenses } from '../../src/types/License.js';
import { PluginType, pluginTypes } from '../../src/types/PluginType.js';
import { PresetFormat, presetFormats } from '../../src/types/PresetFormat.js';
import { PresetType, presetTypes } from '../../src/types/PresetType.js';
import { ProjectType, projectTypes } from '../../src/types/ProjectType.js';
import { ProjectFormat, projectFormats } from '../../src/types/ProjectFormat.js';
import { SystemType, systemTypes } from '../../src/types/SystemType.js';
import { configDefaultsLocal } from '../../src/helpers/configLocal.js';
import { fileReadJson } from '../../src/helpers/file.js';
import { ConfigInterface } from '../../src/types/Config.js';

const APP_DIR: string = 'test';
const CONFIG: ConfigInterface = {
  appDir: APP_DIR,
  pluginsDir: path.join(APP_DIR, 'installed', 'plugins'),
  presetsDir: path.join(APP_DIR, 'installed', 'presets'),
  projectsDir: path.join(APP_DIR, 'installed', 'projects'),
};

beforeAll(() => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  config.delete();
});

test('Create new Config', () => {
  const config: ConfigLocal = new ConfigLocal(configDefaultsLocal());
  const config2: ConfigLocal = new ConfigLocal(CONFIG);
  const config3: ConfigLocal = new ConfigLocal();
  expect(config.getAll()).toEqual(CONFIG_LOCAL);
  expect(config2.getAll()).toEqual(CONFIG_LOCAL_TEST);
  expect(config3.getAll()).toEqual(CONFIG_LOCAL);
});

test('Set and get value', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  config.set('appDir', 'test');
  expect(config.get('appDir')).toEqual('test');
  config.set('pluginsDir', CONFIG_LOCAL_TEST.pluginsDir + '1');
  expect(config.get('pluginsDir')).toEqual(CONFIG_LOCAL_TEST.pluginsDir + '1');
  config.set('pluginsDir', CONFIG_LOCAL_TEST.pluginsDir);
  expect(config.get('pluginsDir')).toEqual(CONFIG_LOCAL_TEST.pluginsDir);
  config.set('presetsDir', CONFIG_LOCAL_TEST.presetsDir);
  config.set('projectsDir', CONFIG_LOCAL_TEST.projectsDir);
});

test('Config export', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  config.export('test/export/config');
  const options = fileReadJson('test/export/config/architectures/index.json');
  expect(options).toEqual(config.architectures());
  const option = fileReadJson('test/export/config/architectures/arm64/index.json');
  expect(option).toEqual(config.architecture(Architecture.Arm64));
});

test('Get architecture', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.architecture(Architecture.X32)).toEqual(architectures[2]);
});

test('Get architectures', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.architectures()).toEqual(architectures);
});

test('Get file format', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.fileFormat(FileFormat.AppleDiskImage)).toEqual(fileFormats[1]);
});

test('Get file formats', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.fileFormats()).toEqual(fileFormats);
});

test('Get file type', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.fileType(FileType.Installer)).toEqual(fileTypes[1]);
});

test('Get file types', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.fileTypes()).toEqual(fileTypes);
});

test('Get license', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.license(License.ApacheLicense2)).toEqual(licenses[1]);
});

test('Get licenses', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.licenses()).toEqual(licenses);
});

test('Get plugin format', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.pluginFormat(PluginFormat.AvidAudioExtension)).toEqual(pluginFormats[1]);
});

test('Get plugin formats', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.pluginFormats()).toEqual(pluginFormats);
});

test('Get plugin type', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.pluginType(PluginType.Generator)).toEqual(pluginTypes[1]);
});

test('Get plugin types', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.pluginTypes()).toEqual(pluginTypes);
});

test('Get preset format', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.presetFormat(PresetFormat.AvidAudioExtension)).toEqual(presetFormats[1]);
});

test('Get preset formats', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.presetFormats()).toEqual(presetFormats);
});

test('Get preset type', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.presetType(PresetType.Mapping)).toEqual(presetTypes[2]);
});

test('Get preset types', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.presetTypes()).toEqual(presetTypes);
});

test('Get project format', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.projectFormat(ProjectFormat.Bitwig)).toEqual(projectFormats[1]);
});

test('Get project formats', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.projectFormats()).toEqual(projectFormats);
});

test('Get project type', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.projectType(ProjectType.DJSet)).toEqual(projectTypes[1]);
});

test('Get project types', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.projectTypes()).toEqual(projectTypes);
});

test('Get system', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.system(SystemType.Linux)).toEqual(systemTypes[0]);
});

test('Get systems', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG);
  expect(config.systems()).toEqual(systemTypes);
});

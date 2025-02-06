import path from 'path';
import { beforeAll, expect, test } from 'vitest';
import { CONFIG_LOCAL } from '../data/Config.js';
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

const CONFIG_FILE_PATH = path.join('test', 'config.json');

beforeAll(() => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  config.delete();
});

test('Create new Config', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH, configDefaultsLocal());
  const config2: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.getAll()).toEqual(CONFIG_LOCAL);
  expect(config2.getAll()).toEqual(CONFIG_LOCAL);
});

test('Set and get value', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  config.set('appDir', 'test');
  expect(config.get('appDir')).toEqual('test');
  config.set('pluginsDir', 'test/installed/plugins1');
  expect(config.get('pluginsDir')).toEqual('test/installed/plugins1');
  config.set('pluginsDir', 'test/installed/plugins');
  expect(config.get('pluginsDir')).toEqual('test/installed/plugins');
  config.set('presetsDir', 'test/installed/presets');
  config.set('projectsDir', 'test/installed/projects');
});

test('Config export', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  config.export('test/export/config');
  const options = fileReadJson('test/export/config/architectures/index.json');
  expect(options).toEqual(config.architectures());
  const option = fileReadJson('test/export/config/architectures/arm64/index.json');
  expect(option).toEqual(config.architecture(Architecture.Arm64));
});

test('Get architecture', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.architecture(Architecture.X32)).toEqual(architectures[2]);
});

test('Get architectures', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.architectures()).toEqual(architectures);
});

test('Get file format', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.fileFormat(FileFormat.AppleDiskImage)).toEqual(fileFormats[1]);
});

test('Get file formats', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.fileFormats()).toEqual(fileFormats);
});

test('Get file type', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.fileType(FileType.Installer)).toEqual(fileTypes[1]);
});

test('Get file types', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.fileTypes()).toEqual(fileTypes);
});

test('Get license', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.license(License.ApacheLicense2)).toEqual(licenses[1]);
});

test('Get licenses', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.licenses()).toEqual(licenses);
});

test('Get plugin format', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.pluginFormat(PluginFormat.AvidAudioExtension)).toEqual(pluginFormats[1]);
});

test('Get plugin formats', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.pluginFormats()).toEqual(pluginFormats);
});

test('Get plugin type', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.pluginType(PluginType.Generator)).toEqual(pluginTypes[1]);
});

test('Get plugin types', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.pluginTypes()).toEqual(pluginTypes);
});

test('Get preset format', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.presetFormat(PresetFormat.AvidAudioExtension)).toEqual(presetFormats[1]);
});

test('Get preset formats', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.presetFormats()).toEqual(presetFormats);
});

test('Get preset type', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.presetType(PresetType.Mapping)).toEqual(presetTypes[2]);
});

test('Get preset types', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.presetTypes()).toEqual(presetTypes);
});

test('Get project format', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.projectFormat(ProjectFormat.Bitwig)).toEqual(projectFormats[1]);
});

test('Get project formats', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.projectFormats()).toEqual(projectFormats);
});

test('Get project type', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.projectType(ProjectType.DJSet)).toEqual(projectTypes[1]);
});

test('Get project types', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.projectTypes()).toEqual(projectTypes);
});

test('Get system', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.system(SystemType.Linux)).toEqual(systemTypes[0]);
});

test('Get systems', () => {
  const config: ConfigLocal = new ConfigLocal(CONFIG_FILE_PATH);
  expect(config.systems()).toEqual(systemTypes);
});

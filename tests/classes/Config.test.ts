import { expect, test } from 'vitest';
import { CONFIG } from '../data/Config.js';
import { Config } from '../../src/classes/Config.js';
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
import { configDefaults } from '../../src/helpers/config.js';
import {
  PluginCategoryEffect,
  pluginCategoryEffects,
  PluginCategoryInstrument,
  pluginCategoryInstruments,
} from '../../src/types/PluginCategory.js';

test('Create new Config', () => {
  const config: Config = new Config(configDefaults());
  const config2: Config = new Config();
  expect(config.getAll()).toEqual(CONFIG);
  expect(config2.getAll()).toEqual(CONFIG);
});

test('Set and get value', () => {
  const config: Config = new Config();
  config.set('appDir', 'test');
  expect(config.get('appDir')).toEqual('test');
  config.set('appsDir', 'test/installed/apps');
  expect(config.get('appsDir')).toEqual('test/installed/apps');
  config.set('pluginsDir', 'test/installed/plugins1');
  expect(config.get('pluginsDir')).toEqual('test/installed/plugins1');
  config.set('pluginsDir', 'test/installed/plugins');
  expect(config.get('pluginsDir')).toEqual('test/installed/plugins');
  config.set('presetsDir', 'test/installed/presets');
  config.set('projectsDir', 'test/installed/projects');
});

test('Get architecture', () => {
  const config: Config = new Config();
  expect(config.architecture(Architecture.X32)).toEqual(architectures[2]);
});

test('Get architectures', () => {
  const config: Config = new Config();
  expect(config.architectures()).toEqual(architectures);
});

test('Get file format', () => {
  const config: Config = new Config();
  expect(config.fileFormat(FileFormat.AppleDiskImage)).toEqual(fileFormats[1]);
});

test('Get file formats', () => {
  const config: Config = new Config();
  expect(config.fileFormats()).toEqual(fileFormats);
});

test('Get file type', () => {
  const config: Config = new Config();
  expect(config.fileType(FileType.Installer)).toEqual(fileTypes[1]);
});

test('Get file types', () => {
  const config: Config = new Config();
  expect(config.fileTypes()).toEqual(fileTypes);
});

test('Get license', () => {
  const config: Config = new Config();
  expect(config.license(License.ApacheLicense2)).toEqual(licenses[1]);
});

test('Get licenses', () => {
  const config: Config = new Config();
  expect(config.licenses()).toEqual(licenses);
});

test('Get plugin category effect', () => {
  const config: Config = new Config();
  expect(config.pluginCategoryEffect(PluginCategoryEffect.Distortion)).toEqual(pluginCategoryEffects[1]);
});

test('Get plugin category effects', () => {
  const config: Config = new Config();
  expect(config.pluginCategoryEffects()).toEqual(pluginCategoryEffects);
});

test('Get plugin category instrument', () => {
  const config: Config = new Config();
  expect(config.pluginCategoryInstrument(PluginCategoryInstrument.Brass)).toEqual(pluginCategoryInstruments[1]);
});

test('Get plugin category instruments', () => {
  const config: Config = new Config();
  expect(config.pluginCategoryInstruments()).toEqual(pluginCategoryInstruments);
});

test('Get plugin format', () => {
  const config: Config = new Config();
  expect(config.pluginFormat(PluginFormat.AvidAudioExtension)).toEqual(pluginFormats[1]);
});

test('Get plugin formats', () => {
  const config: Config = new Config();
  expect(config.pluginFormats()).toEqual(pluginFormats);
});

test('Get plugin type', () => {
  const config: Config = new Config();
  expect(config.pluginType(PluginType.Generator)).toEqual(pluginTypes[1]);
});

test('Get plugin types', () => {
  const config: Config = new Config();
  expect(config.pluginTypes()).toEqual(pluginTypes);
});

test('Get preset format', () => {
  const config: Config = new Config();
  expect(config.presetFormat(PresetFormat.AvidAudioExtension)).toEqual(presetFormats[1]);
});

test('Get preset formats', () => {
  const config: Config = new Config();
  expect(config.presetFormats()).toEqual(presetFormats);
});

test('Get preset type', () => {
  const config: Config = new Config();
  expect(config.presetType(PresetType.Mapping)).toEqual(presetTypes[2]);
});

test('Get preset types', () => {
  const config: Config = new Config();
  expect(config.presetTypes()).toEqual(presetTypes);
});

test('Get project format', () => {
  const config: Config = new Config();
  expect(config.projectFormat(ProjectFormat.Bitwig)).toEqual(projectFormats[1]);
});

test('Get project formats', () => {
  const config: Config = new Config();
  expect(config.projectFormats()).toEqual(projectFormats);
});

test('Get project type', () => {
  const config: Config = new Config();
  expect(config.projectType(ProjectType.DJSet)).toEqual(projectTypes[1]);
});

test('Get project types', () => {
  const config: Config = new Config();
  expect(config.projectTypes()).toEqual(projectTypes);
});

test('Get system', () => {
  const config: Config = new Config();
  expect(config.system(SystemType.Linux)).toEqual(systemTypes[0]);
});

test('Get systems', () => {
  const config: Config = new Config();
  expect(config.systems()).toEqual(systemTypes);
});

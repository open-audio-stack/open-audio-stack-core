import { expect, test } from 'vitest';
import Config from '../src/Config.js';
import { architectures, Architecture } from '../src/types/Architecture.js';
import { Platform, platforms } from '../src/types/Platform.js';
import { System, systems } from '../src/types/System.js';
import { PluginFormat, pluginFormats } from '../src/types/PluginFormat.js';
import { FileFormat, fileFormats } from '../src/types/FileFormat.js';
import { FileType, fileTypes } from '../src/types/FileType.js';
import { License, licenses } from '../src/index-browser.js';
import { PluginType, pluginTypes } from '../src/types/PluginType.js';
import { PresetFormat, presetFormats } from '../src/types/PresetFormat.js';
import { PresetType, presetTypes } from '../src/types/PresetType.js';
import { ProjectType, projectTypes } from '../src/types/ProjectType.js';
import { ProjectFormat, projectFormats } from '../src/types/ProjectFormat.js';

test('Create new Config', () => {
  const config: Config = new Config({});
  expect(config.getConfig()).toEqual({});
});

test('Get architecture', () => {
  const config: Config = new Config({});
  expect(config.getArchitecture(Architecture.Bit32)).toEqual(architectures[2]);
});

test('Get architectures', () => {
  const config: Config = new Config({});
  expect(config.getArchitectures()).toEqual(architectures);
});

test('Get file format', () => {
  const config: Config = new Config({});
  expect(config.getFileFormat(FileFormat.DebianPackage)).toEqual(fileFormats[1]);
});

test('Get file formats', () => {
  const config: Config = new Config({});
  expect(config.getFileFormats()).toEqual(fileFormats);
});

test('Get file type', () => {
  const config: Config = new Config({});
  expect(config.getFileType(FileType.Installer)).toEqual(fileTypes[1]);
});

test('Get file types', () => {
  const config: Config = new Config({});
  expect(config.getFileTypes()).toEqual(fileTypes);
});

test('Get license', () => {
  const config: Config = new Config({});
  expect(config.getLicense(License.ApacheLicense2)).toEqual(licenses[1]);
});

test('Get licenses', () => {
  const config: Config = new Config({});
  expect(config.getLicenses()).toEqual(licenses);
});

test('Get platform', () => {
  const config: Config = new Config({});
  expect(config.getPlatform(Platform.Linux)).toEqual(platforms[1]);
});

test('Get platforms', () => {
  const config: Config = new Config({});
  expect(config.getPlatforms()).toEqual(platforms);
});

test('Get plugin format', () => {
  const config: Config = new Config({});
  expect(config.getPluginFormat(PluginFormat.AvidAudioExtension)).toEqual(pluginFormats[1]);
});

test('Get plugin formats', () => {
  const config: Config = new Config({});
  expect(config.getPluginFormats()).toEqual(pluginFormats);
});

test('Get plugin type', () => {
  const config: Config = new Config({});
  expect(config.getPluginType(PluginType.Generator)).toEqual(pluginTypes[1]);
});

test('Get plugin types', () => {
  const config: Config = new Config({});
  expect(config.getPluginTypes()).toEqual(pluginTypes);
});

test('Get preset format', () => {
  const config: Config = new Config({});
  expect(config.getPresetFormat(PresetFormat.NativeInstruments)).toEqual(presetFormats[1]);
});

test('Get preset formats', () => {
  const config: Config = new Config({});
  expect(config.getPresetFormats()).toEqual(presetFormats);
});

test('Get preset type', () => {
  const config: Config = new Config({});
  expect(config.getPresetType(PresetType.Sound)).toEqual(presetTypes[0]);
});

test('Get preset types', () => {
  const config: Config = new Config({});
  expect(config.getPresetTypes()).toEqual(presetTypes);
});

test('Get project format', () => {
  const config: Config = new Config({});
  expect(config.getProjectFormat(ProjectFormat.Bitwig)).toEqual(projectFormats[1]);
});

test('Get project formats', () => {
  const config: Config = new Config({});
  expect(config.getProjectFormats()).toEqual(projectFormats);
});

test('Get project type', () => {
  const config: Config = new Config({});
  expect(config.getProjectType(ProjectType.DJSet)).toEqual(projectTypes[1]);
});

test('Get project types', () => {
  const config: Config = new Config({});
  expect(config.getProjectTypes()).toEqual(projectTypes);
});

test('Get system', () => {
  const config: Config = new Config({});
  expect(config.getSystem(System.LinuxArm32)).toEqual(systems[0]);
});

test('Get systems', () => {
  const config: Config = new Config({});
  expect(config.getSystems()).toEqual(systems);
});

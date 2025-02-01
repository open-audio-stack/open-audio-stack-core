import { beforeEach, expect, test } from 'vitest';
import { RegistryLocal } from '../../src/classes/RegistryLocal.js';
import { RegistryType } from '../../src/types/Registry.js';
import {
  REGISTRY,
  REGISTRY_EMPTY_PKG,
  REGISTRY_MULTIPLE_TYPES,
  REGISTRY_PACKAGE_TYPES,
  REGISTRY_PLUGIN_MULTIPLE,
  REGISTRY_PLUGIN_VER,
} from '../data/Registry.js';
import { PLUGIN, PLUGIN_PACKAGE } from '../data/Plugin.js';
import { PRESET, PRESET_PACKAGE } from '../data/Preset.js';
import { PROJECT, PROJECT_PACKAGE } from '../data/Project.js';
import { ManagerLocal } from '../../src/classes/ManagerLocal.js';
import { Package } from '../../src/classes/Package.js';
import { ConfigInterface } from '../../src/types/Config.js';

const APP_DIR: string = 'test';
const CONFIG: ConfigInterface = {
  appDir: APP_DIR,
};

let registry: RegistryLocal;
let manager: ManagerLocal;

beforeEach(() => {
  registry = new RegistryLocal(REGISTRY.name, REGISTRY.url, REGISTRY.version);
  manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  registry.addManager(manager);
});

test('Create new Registry', () => {
  expect(registry.toJSON()).toEqual(REGISTRY);
});

test('Registry add an empty package', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  manager.addPackage(pkg);
  expect(registry.toJSON()).toEqual(REGISTRY_EMPTY_PKG);
});

test('Registry add and remove package', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  manager.addPackage(pkg);
  manager.removePackage(pkg.slug);
  expect(registry.toJSON()).toEqual(REGISTRY);
});

test('Registry add a package version', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkg);
  expect(registry.toJSON()).toEqual(REGISTRY_PLUGIN_VER);
});

test('Registry add and remove a package version', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.removeVersion(PLUGIN_PACKAGE.version);
  manager.addPackage(pkg);
  expect(registry.toJSON()).toEqual(REGISTRY_EMPTY_PKG);
});

test('Registry add multiple package versions', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.addVersion('1.3.2', PLUGIN);
  manager.addPackage(pkg);
  expect(registry.toJSON()).toEqual(REGISTRY_PLUGIN_MULTIPLE);
});

test('Registry add and remove multiple package versions', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.addVersion('1.3.2', PLUGIN);
  pkg.removeVersion('1.3.2');
  manager.addPackage(pkg);
  expect(registry.toJSON()).toEqual(REGISTRY_PLUGIN_VER);
});

test('Registry add multiple package managers', () => {
  // Plugin
  const pkgPlugin = new Package(PLUGIN_PACKAGE.slug);
  pkgPlugin.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkgPlugin);
  // Preset
  const presetManager = new ManagerLocal(RegistryType.Presets, CONFIG);
  registry.addManager(presetManager);
  const pkgPreset = new Package(PRESET_PACKAGE.slug);
  pkgPreset.addVersion(PRESET_PACKAGE.version, PRESET);
  presetManager.addPackage(pkgPreset);
  // Project
  const projectManager = new ManagerLocal(RegistryType.Projects, CONFIG);
  registry.addManager(projectManager);
  const pkgProject = new Package(PROJECT_PACKAGE.slug);
  pkgProject.addVersion(PROJECT_PACKAGE.version, PROJECT);
  projectManager.addPackage(pkgProject);
  expect(registry.toJSON()).toEqual(REGISTRY_PACKAGE_TYPES);
});

test('Get manager', () => {
  expect(registry.getManager(RegistryType.Plugins)).toEqual(manager);
  expect(registry.getManager(RegistryType.Presets)).toEqual(undefined);
});

test('Reset managers', () => {
  // Plugin
  const pkgPlugin = new Package(PLUGIN_PACKAGE.slug);
  pkgPlugin.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkgPlugin);
  // Preset
  const presetManager = new ManagerLocal(RegistryType.Presets, CONFIG);
  registry.addManager(presetManager);
  const pkgPreset = new Package(PRESET_PACKAGE.slug);
  pkgPreset.addVersion(PRESET_PACKAGE.version, PRESET);
  presetManager.addPackage(pkgPreset);
  // Project
  const projectManager = new ManagerLocal(RegistryType.Projects, CONFIG);
  registry.addManager(projectManager);
  const pkgProject = new Package(PROJECT_PACKAGE.slug);
  pkgProject.addVersion(PROJECT_PACKAGE.version, PROJECT);
  projectManager.addPackage(pkgProject);
  // Reset managers
  registry.reset();
  expect(registry.toJSON()).toEqual(REGISTRY_MULTIPLE_TYPES);
});

test('Sync managers', async () => {
  // Plugin
  const pkgPlugin = new Package(PLUGIN_PACKAGE.slug);
  pkgPlugin.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkgPlugin);
  // Preset
  const presetManager = new ManagerLocal(RegistryType.Presets, CONFIG);
  registry.addManager(presetManager);
  const pkgPreset = new Package(PRESET_PACKAGE.slug);
  pkgPreset.addVersion(PRESET_PACKAGE.version, PRESET);
  presetManager.addPackage(pkgPreset);
  // Project
  const projectManager = new ManagerLocal(RegistryType.Projects, CONFIG);
  registry.addManager(projectManager);
  const pkgProject = new Package(PROJECT_PACKAGE.slug);
  pkgProject.addVersion(PROJECT_PACKAGE.version, PROJECT);
  projectManager.addPackage(pkgProject);
  // Sync managers
  await registry.sync();
  expect(registry.toJSON()).toBeDefined();
});

test('Registry scan', async () => {
  // Plugin
  const pkgPlugin = new Package(PLUGIN_PACKAGE.slug);
  pkgPlugin.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkgPlugin);
  // Preset
  const presetManager = new ManagerLocal(RegistryType.Presets, CONFIG);
  registry.addManager(presetManager);
  const pkgPreset = new Package(PRESET_PACKAGE.slug);
  pkgPreset.addVersion(PRESET_PACKAGE.version, PRESET);
  presetManager.addPackage(pkgPreset);
  // Project
  const projectManager = new ManagerLocal(RegistryType.Projects, CONFIG);
  registry.addManager(projectManager);
  const pkgProject = new Package(PROJECT_PACKAGE.slug);
  pkgProject.addVersion(PROJECT_PACKAGE.version, PROJECT);
  projectManager.addPackage(pkgProject);
  // Sync managers
  registry.scan();
  expect(registry.toJSON()).toBeDefined();
});

test('Registry export', async () => {
  const presetManager = new ManagerLocal(RegistryType.Presets, CONFIG);
  registry.addManager(presetManager);
  const projectManager = new ManagerLocal(RegistryType.Projects, CONFIG);
  registry.addManager(projectManager);
  await registry.sync();
  expect(registry.export(`test/export`)).toEqual(true);
});

test('Get registry name', () => {
  expect(registry.name).toEqual(REGISTRY.name);
});

test('Get registry url', () => {
  expect(registry.url).toEqual(REGISTRY.url);
});

test('Get registry version', () => {
  expect(registry.version).toEqual(REGISTRY.version);
});

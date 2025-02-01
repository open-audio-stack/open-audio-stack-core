import path from 'path';
import { beforeAll, expect, test } from 'vitest';
import { PLUGIN, PLUGIN_INSTALLED, PLUGIN_PACKAGE } from '../data/Plugin';
import { PRESET, PRESET_INSTALLED, PRESET_PACKAGE } from '../data/Preset';
import { PROJECT, PROJECT_INSTALLED, PROJECT_PACKAGE } from '../data/Project';
import { ManagerLocal } from '../../src/classes/ManagerLocal';
import { dirDelete } from '../../src/helpers/file';
import { RegistryType } from '../../src/types/Registry';
import { ConfigInterface } from '../../src/types/Config';
import { PackageVersion } from '../../src/types/Package';

const APP_DIR: string = 'test';
const CONFIG: ConfigInterface = {
  appDir: APP_DIR,
};

beforeAll(() => {
  dirDelete(path.join(APP_DIR, 'archive'));
  // Retain existing downloads to speed-up subsequent test runs.
  // dirDelete(path.join(APP_DIR, 'downloads'));
  dirDelete(path.join(APP_DIR, 'plugins'));
});

test('Manager Local scan local directory', () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  manager.scan();
  expect(manager.toJSON()).toEqual({});
});

test('Manager Local export', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await manager.sync();
  expect(manager.export(`test/export/${RegistryType.Plugins}`)).toEqual(true);
});

test('Plugin sync, install, rescan, uninstall', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await manager.sync();

  const pkgReturned: PackageVersion | void = await manager.install(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);
  const pkgGet = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgReturned).toEqual(PLUGIN_INSTALLED);
  expect(pkgGet?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN_INSTALLED);

  manager.scan();
  const pkgGet2 = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgGet2?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN_INSTALLED);

  const pkgReturned2: PackageVersion | void = await manager.uninstall(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);
  expect(pkgReturned2).toEqual(PLUGIN);
});

test('Preset sync, install, rescan, uninstall', async () => {
  const manager = new ManagerLocal(RegistryType.Presets, CONFIG);
  await manager.sync();

  const pkgReturned: PackageVersion | void = await manager.install(PRESET_PACKAGE.slug, PRESET_PACKAGE.version);
  const pkgGet = manager.getPackage(PRESET_PACKAGE.slug);
  expect(pkgReturned).toEqual(PRESET_INSTALLED);
  expect(pkgGet?.getVersion(PRESET_PACKAGE.version)).toEqual(PRESET_INSTALLED);

  manager.scan();
  const pkgGet2 = manager.getPackage(PRESET_PACKAGE.slug);
  expect(pkgGet2?.getVersion(PRESET_PACKAGE.version)).toEqual(PRESET_INSTALLED);

  const pkgReturned2: PackageVersion | void = await manager.uninstall(PRESET_PACKAGE.slug, PRESET_PACKAGE.version);
  expect(pkgReturned2).toEqual(PRESET);
});

test('Project sync, install, rescan, uninstall', async () => {
  const manager = new ManagerLocal(RegistryType.Projects, CONFIG);
  await manager.sync();

  const pkgReturned: PackageVersion | void = await manager.install(PROJECT_PACKAGE.slug, PROJECT_PACKAGE.version);
  const pkgGet = manager.getPackage(PROJECT_PACKAGE.slug);
  expect(pkgReturned).toEqual(PROJECT_INSTALLED);
  expect(pkgGet?.getVersion(PROJECT_PACKAGE.version)).toEqual(PROJECT_INSTALLED);

  manager.scan();
  const pkgGet2 = manager.getPackage(PROJECT_PACKAGE.slug);
  expect(pkgGet2?.getVersion(PROJECT_PACKAGE.version)).toEqual(PROJECT_INSTALLED);

  const pkgReturned2: PackageVersion | void = await manager.uninstall(PROJECT_PACKAGE.slug, PROJECT_PACKAGE.version);
  expect(pkgReturned2).toEqual(PROJECT);
});

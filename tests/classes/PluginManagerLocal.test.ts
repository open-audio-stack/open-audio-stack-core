import path from 'path';
import { beforeAll, expect, test } from 'vitest';
import { PLUGIN_INSTALLED, PLUGIN_PACKAGE } from '../data/Plugin';
import { PluginManagerLocal } from '../../src/classes/PluginManagerLocal';
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
  const pluginManager = new PluginManagerLocal(CONFIG);
  pluginManager.scan();
  expect(pluginManager.toJSON()).toEqual({});
});

test('Package install', async () => {
  const pluginManager = new PluginManagerLocal(CONFIG);
  await pluginManager.sync(RegistryType.Plugins);
  const pkgReturned: PackageVersion | void = await pluginManager.install(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);
  const pkgGet = pluginManager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgReturned).toEqual(PLUGIN_INSTALLED);
  expect(pkgGet?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN_INSTALLED);
});

test('Package install and rescan', async () => {
  const pluginManager = new PluginManagerLocal(CONFIG);
  await pluginManager.sync(RegistryType.Plugins);
  await pluginManager.install(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);
  await pluginManager.sync(RegistryType.Plugins);
  const pkgGet = pluginManager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgGet?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN_INSTALLED);
});

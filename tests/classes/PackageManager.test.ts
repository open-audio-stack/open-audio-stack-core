import { expect, test } from 'vitest';
import { PLUGIN, PLUGIN_PACKAGE, PLUGIN_PACKAGE_EMPTY, PLUGIN_PACKAGE_MULTIPLE } from '../data/Plugin';
import { PluginManager } from '../../src/classes/PluginManager';
import { RegistryType } from '../../src/types/Registry';
import { Package } from '../../src/classes/Package';

test('Manager add multiple package versions', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.addVersion('1.3.2', PLUGIN);
  pluginManager.addPackage(pkg);
  expect(pluginManager.toJSON()).toEqual({
    [PLUGIN_PACKAGE.slug]: PLUGIN_PACKAGE_MULTIPLE,
  });
});

test('Manager add same package multiple times', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pluginManager.addPackage(pkg);

  const pkg2 = new Package(PLUGIN_PACKAGE.slug);
  pkg2.addVersion('1.3.2', { ...PLUGIN, name: 'Package version' });
  pluginManager.addPackage(pkg2);

  const pkgReturned = pluginManager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgReturned?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN);
  expect(pkgReturned?.getVersion('1.3.2')?.name).toEqual('Package version');
});

test('Manager add and remove package', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pluginManager.addPackage(pkg);
  pluginManager.removePackage(pkg.slug);
  expect(pluginManager.toJSON()).toEqual({});
});

test('Manager add and remove package multiple times', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pluginManager.addPackage(pkg);
  pluginManager.removePackage(pkg.slug);
  pluginManager.removePackage(pkg.slug);
  expect(pluginManager.toJSON()).toEqual({});
});

test('Manager remove multiple package versions', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.removeVersion(PLUGIN_PACKAGE.version);
  pkg.removeVersion(PLUGIN_PACKAGE.version);
  pluginManager.addPackage(pkg);
  expect(pluginManager.toJSON()).toEqual({
    [PLUGIN_PACKAGE.slug]: PLUGIN_PACKAGE_EMPTY,
  });
});

test('Manager get package', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pluginManager.addPackage(pkg);
  expect(pluginManager.getPackage(PLUGIN_PACKAGE.slug)).toEqual(pkg);
});

test('Manager list packages', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pluginManager.addPackage(pkg);
  expect(pluginManager.listPackages()).toEqual([pkg]);
});

test('Manager filter packages', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pluginManager.addPackage(pkg);
  expect(pluginManager.filter('Surge XT', 'name')).toEqual([pkg]);
  expect(pluginManager.filter('Surge X', 'name')).toEqual([]);
});

test('Manager filter packages without versions', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pluginManager.addPackage(pkg);
  expect(pluginManager.filter('Surge XT', 'name')).toEqual([]);
  expect(pluginManager.filter('Surge X', 'name')).toEqual([]);
});

test('Manager search packages', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pluginManager.addPackage(pkg);
  expect(pluginManager.search('XT')).toEqual([pkg]);
  expect(pluginManager.search('ZXT')).toEqual([]);
});

test('Manager search packages without versions', () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pluginManager.addPackage(pkg);
  expect(pluginManager.search('XT')).toEqual([]);
  expect(pluginManager.search('ZXT')).toEqual([]);
});

test('Manager sync from registries', async () => {
  const pluginManager = new PluginManager();
  await pluginManager.sync(RegistryType.Plugins);
  const pkg = pluginManager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkg?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN);
});

test('Manager sync with existing package', async () => {
  const pluginManager = new PluginManager();
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, { ...PLUGIN, name: 'Surge modified' });
  pluginManager.addPackage(pkg);

  await pluginManager.sync(RegistryType.Plugins);
  const pkgReturned = pluginManager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgReturned?.getVersion(PLUGIN_PACKAGE.version)?.name).toEqual('Surge modified');
});

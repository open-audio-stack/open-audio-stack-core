import { expect, test } from 'vitest';
import { Package } from '../../src/classes/Package';
import { PLUGIN, PLUGIN_PACKAGE, PLUGIN_PACKAGE_EMPTY } from '../data/Plugin';

test('Package new', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  expect(pkg.toJSON()).toEqual(PLUGIN_PACKAGE_EMPTY);
});

test('Package add version', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  expect(pkg.toJSON()).toEqual(PLUGIN_PACKAGE);
});

test('Package remove version', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.removeVersion(PLUGIN_PACKAGE.version);
  expect(pkg.toJSON()).toEqual(PLUGIN_PACKAGE_EMPTY);
});

test('Package get version latest', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion('3.2.1', { ...PLUGIN, name: '3.2.1' });
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.addVersion('2.1.0', { ...PLUGIN, name: '2.1.0' });
  expect(pkg.getVersionLatest()?.name).toEqual('3.2.1');
});

test('Package get version', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  expect(pkg.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN);
});

test('Package latest version', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion('3.2.1', PLUGIN);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.addVersion('2.1.0', PLUGIN);
  expect(pkg.latestVersion()).toEqual('3.2.1');
});

import { expect, test } from 'vitest';
import { Package } from '../../src/classes/Package';
import { PLUGIN, PLUGIN_PACKAGE, PLUGIN_PACKAGE_EMPTY } from '../data/Plugin';
import { PackageInterface, PackageVersion } from '../../src/types/Package';

test('Package new', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  expect(pkg.toJSON()).toEqual(PLUGIN_PACKAGE_EMPTY);
});

test('Package with invalid slug', () => {
  const PLUGIN_INVALID_SLUG: PackageInterface = structuredClone(PLUGIN_PACKAGE_EMPTY);
  PLUGIN_INVALID_SLUG.slug = 'Invalid Slug';
  const pkg = new Package(PLUGIN_INVALID_SLUG.slug);
  expect(pkg.toJSON()).toEqual(PLUGIN_INVALID_SLUG);
});

test('Package add version', () => {
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  expect(pkg.toJSON()).toEqual(PLUGIN_PACKAGE);
});

test('Package add invalid version', () => {
  const PLUGIN_INVALID: PackageVersion = structuredClone(PLUGIN);
  // @ts-expect-error this is intentionally bad data.
  delete PLUGIN_INVALID['image'];
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN_INVALID);
  expect(pkg.toJSON()).toEqual(PLUGIN_PACKAGE_EMPTY);
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

test('Package get version or latest', () => {
  const PLUGIN_V2: PackageVersion = structuredClone(PLUGIN);
  PLUGIN_V2.name = 'Plugin V2';
  const PLUGIN_V3: PackageVersion = structuredClone(PLUGIN);
  PLUGIN_V3.name = 'Plugin V3';

  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion('3.2.1', PLUGIN_V3);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.addVersion('2.1.0', PLUGIN_V2);
  expect(pkg.getVersionOrLatest('2.1.0')).toEqual(PLUGIN_V2);
  expect(pkg.getVersionOrLatest()).toEqual(PLUGIN_V3);
  expect(pkg.getVersionOrLatest('2.2.2')).toEqual(PLUGIN_V3);
  expect(pkg.getVersionOrLatest(PLUGIN_PACKAGE.version)).toEqual(PLUGIN);
  expect(pkg.getVersionOrLatest('3.2.1')).toEqual(PLUGIN_V3);
  expect(pkg.getVersionOrLatest('4.0.0')).toEqual(PLUGIN_V3);
});

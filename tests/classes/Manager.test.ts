import { expect, test, vi } from 'vitest';
import {
  PLUGIN,
  PLUGIN_INCOMPATIBLE,
  PLUGIN_PACKAGE,
  PLUGIN_PACKAGE_EMPTY,
  PLUGIN_PACKAGE_INCOMPATIBLE,
  PLUGIN_PACKAGE_MULTIPLE,
} from '../data/Plugin';
import { Manager } from '../../src/classes/Manager';
import { RegistryType } from '../../src/types/Registry';
import { Package } from '../../src/classes/Package';
import { License } from '../../src/types/License';
import { SystemType } from '../../src/types/SystemType';
import { Architecture } from '../../src/types/Architecture';
import { PackageVersion } from '../../src/types/Package';
import { packageCompatibleFiles } from '../../src/helpers/package';
import { omitDownloads } from '../testUtils';
import * as apiHelpers from '../../src/helpers/api';

test('Manager add multiple package versions', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.addVersion('1.3.2', PLUGIN);
  manager.addPackage(pkg);
  expect(manager.toJSON()).toEqual({
    [PLUGIN_PACKAGE.slug]: PLUGIN_PACKAGE_MULTIPLE,
  });
});

test('Manager add same package multiple times', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkg);

  const pkg2 = new Package(PLUGIN_PACKAGE.slug);
  pkg2.addVersion('1.3.2', { ...PLUGIN, name: 'Package version' });
  manager.addPackage(pkg2);

  const pkgReturned = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgReturned?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN);
  expect(pkgReturned?.getVersion('1.3.2')?.name).toEqual('Package version');
});

test('Manager add and remove package', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  manager.addPackage(pkg);
  manager.removePackage(pkg.slug);
  expect(manager.toJSON()).toEqual({});
});

test('Manager add and remove package multiple times', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  manager.addPackage(pkg);
  manager.removePackage(pkg.slug);
  manager.removePackage(pkg.slug);
  expect(manager.toJSON()).toEqual({});
});

test('Manager remove multiple package versions', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  pkg.removeVersion(PLUGIN_PACKAGE.version);
  pkg.removeVersion(PLUGIN_PACKAGE.version);
  manager.addPackage(pkg);
  expect(manager.toJSON()).toEqual({
    [PLUGIN_PACKAGE.slug]: PLUGIN_PACKAGE_EMPTY,
  });
});

test('Manager get package', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkg);
  expect(manager.getPackage(PLUGIN_PACKAGE.slug)).toEqual(pkg);
});

test('Manager get report', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkg);
  expect(manager.getReport()).toEqual({
    'surge-synthesizer/surge': {
      '1.3.1': {
        recs: [
          {
            field: 'url',
            rec: 'requires mounting step, consider .pkg instead',
          },
        ],
      },
    },
  });
});

test('Manager output report', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkg);
  // TODO add test support for sdout, or update report to return a testable string.
  // manager.logEnable();
  expect(manager.outputReport()).toEqual(undefined);
});

test('Manager list packages', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkg);
  expect(manager.listPackages()).toEqual([pkg]);
  expect(manager.listPackages(true)).toEqual([]);
  expect(manager.listPackages(false)).toEqual([pkg]);
});

test('Manager list packages incompatible', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkgNoWin = new Package(PLUGIN_PACKAGE_INCOMPATIBLE.slug);
  pkgNoWin.addVersion(PLUGIN_PACKAGE_INCOMPATIBLE.version, PLUGIN_INCOMPATIBLE);
  manager.addPackage(pkgNoWin);
  expect(manager.listPackages(undefined, Architecture.X64, SystemType.Win)).toEqual([]);
  expect(manager.listPackages(undefined, Architecture.X64, SystemType.Linux)).toEqual([pkgNoWin]);
});

test('Manager filter packages', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkg);

  expect(manager.filter(pkgVersion => pkgVersion.name === 'Surge XT')).toEqual([pkg]);
  expect(manager.filter(pkgVersion => pkgVersion.name === 'Surge X')).toEqual([]);

  expect(manager.filter(pkgVersion => pkgVersion.license === License.GNUGeneralPublicLicensev3)).toEqual([pkg]);
  expect(
    manager.filter(pkgVersion => {
      return (
        pkgVersion.license === License.GNUGeneralPublicLicensev3 || pkgVersion.license === License.AcademicFreeLicensev3
      );
    }),
  ).toEqual([pkg]);
  expect(manager.filter(pkgVersion => pkgVersion.license === License.AcademicFreeLicensev3)).toEqual([]);

  expect(
    manager.filter(pkgVersion => {
      return packageCompatibleFiles(pkgVersion, [Architecture.X64], [SystemType.Linux]).length > 0;
    }),
  ).toEqual([pkg]);

  expect(
    manager.filter(pkgVersion => {
      return packageCompatibleFiles(pkgVersion, [Architecture.Arm32], [SystemType.Linux]).length > 0;
    }),
  ).toEqual([]);
});

test('Manager filter packages without versions', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  manager.addPackage(pkg);
  expect(manager.filter(pkgVersion => pkgVersion.name === 'Surge XT')).toEqual([]);
  expect(manager.filter(pkgVersion => pkgVersion.name === 'Surge X')).toEqual([]);
});

test('Manager search packages', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, PLUGIN);
  manager.addPackage(pkg);
  expect(manager.search('XT')).toEqual([pkg]);
  expect(manager.search('ZXT')).toEqual([]);
});

test('Manager search packages without versions', () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  manager.addPackage(pkg);
  expect(manager.search('XT')).toEqual([]);
  expect(manager.search('ZXT')).toEqual([]);
});

test('Manager sync from registries', async () => {
  const manager = new Manager(RegistryType.Plugins);
  await manager.sync();
  const pkg = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(omitDownloads(pkg?.getVersion(PLUGIN_PACKAGE.version))).toEqual(omitDownloads(PLUGIN));
});

test('Manager sync skips an unreachable registry instead of throwing', async () => {
  // example.invalid is reserved by RFC 2606 specifically for cases like this - guaranteed to
  // never resolve, so this doesn't depend on some third-party service happening to be down.
  const manager = new Manager(RegistryType.Plugins, {
    registries: [
      { name: 'Unreachable Registry', url: 'https://example.invalid/registry' },
      { name: 'Open Audio Registry', url: 'https://open-audio-stack.github.io/open-audio-stack-registry' },
    ],
  });
  await expect(manager.sync()).resolves.not.toThrow();
  expect(manager.getSyncErrors().length).toBeGreaterThan(0);

  // The other, reachable registry should still have synced successfully.
  const pkg = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(omitDownloads(pkg?.getVersion(PLUGIN_PACKAGE.version))).toEqual(omitDownloads(PLUGIN));
});

test('Manager sync isolates a malformed package version instead of throwing', async () => {
  const pluginInvalid: PackageVersion = structuredClone(PLUGIN);
  delete (pluginInvalid as any).image;

  const apiJsonSpy = vi.spyOn(apiHelpers, 'apiJson').mockResolvedValue({
    name: 'Mock Registry',
    url: 'https://example.invalid/mock',
    version: '1.0.0',
    [RegistryType.Plugins]: {
      'test-org/good-plugin': { slug: 'test-org/good-plugin', version: '1.0.0', versions: { '1.0.0': PLUGIN } },
      'test-org/bad-plugin': {
        slug: 'test-org/bad-plugin',
        version: '1.0.0',
        versions: { '1.0.0': pluginInvalid },
      },
    },
  });

  const manager = new Manager(RegistryType.Plugins, {
    registries: [{ name: 'Mock Registry', url: 'https://example.invalid/mock' }],
  });
  await expect(manager.sync()).resolves.not.toThrow();

  expect(omitDownloads(manager.getPackage('test-org/good-plugin')?.getVersion('1.0.0'))).toEqual(omitDownloads(PLUGIN));
  expect(manager.getPackage('test-org/bad-plugin')).toBeUndefined();
  expect(manager.getSyncErrors()).toEqual(
    expect.arrayContaining([expect.stringContaining('test-org/bad-plugin@1.0.0')]),
  );

  apiJsonSpy.mockRestore();
});

test('Manager sync with existing package', async () => {
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, { ...PLUGIN, name: 'Surge modified' });
  manager.addPackage(pkg);

  await manager.sync();
  const pkgReturned = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgReturned?.getVersion(PLUGIN_PACKAGE.version)?.name).toEqual('Surge XT');
});

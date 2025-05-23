import { expect, test } from 'vitest';
import { PLUGIN, PLUGIN_PACKAGE, PLUGIN_PACKAGE_EMPTY, PLUGIN_PACKAGE_MULTIPLE } from '../data/Plugin';
import { Manager } from '../../src/classes/Manager';
import { RegistryType } from '../../src/types/Registry';
import { Package } from '../../src/classes/Package';
import { License } from '../../src/types/License';
import { SystemType } from '../../src/types/SystemType';
import { Architecture } from '../../src/types/Architecture';
import { packageCompatibleFiles } from '../../src/helpers/package';

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
  expect(pkg?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN);
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

import { afterEach, expect, test, vi } from 'vitest';
import {
  PLUGIN,
  PLUGIN_INCOMPATIBLE,
  PLUGIN_PACKAGE,
  PLUGIN_PACKAGE_EMPTY,
  PLUGIN_PACKAGE_INCOMPATIBLE,
  PLUGIN_PACKAGE_MULTIPLE,
} from '../data/Plugin';
import { REGISTRY_PLUGIN_VER } from '../data/Registry';
import { Manager } from '../../src/classes/Manager';
import { RegistryType } from '../../src/types/Registry';
import { Package } from '../../src/classes/Package';
import { License } from '../../src/types/License';
import { SystemType } from '../../src/types/SystemType';
import { Architecture } from '../../src/types/Architecture';
import { PackageVersion } from '../../src/types/Package';
import { packageCompatibleFiles } from '../../src/helpers/package';
import { mockRegistrySync, omitDownloads, toSummaryVersion } from '../testUtils';
import * as apiHelpers from '../../src/helpers/api';

afterEach(() => {
  vi.restoreAllMocks();
});

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

test('Manager list packages by architecture/system works on a sync()-cached summary (url/sha256 omitted)', () => {
  // Unlike install(), listing/filtering doesn't need a fetchPackageVersion() round trip - every
  // compatibility field (architectures, systems, contains, type, size) is already present on the
  // registry root/list endpoints, only url/sha256 are missing (see specification.md "Listing
  // endpoints vs package endpoints").
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersionSummary(PLUGIN_PACKAGE.version, toSummaryVersion(PLUGIN));
  manager.addPackageSummary(pkg);
  expect(manager.listPackages(undefined, Architecture.X64, SystemType.Linux)).toEqual([pkg]);
  expect(manager.listPackages(undefined, Architecture.Arm32, SystemType.Linux)).toEqual([]);
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
  mockRegistrySync(REGISTRY_PLUGIN_VER);
  const manager = new Manager(RegistryType.Plugins);
  await manager.sync();
  const pkg = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(omitDownloads(pkg?.getVersion(PLUGIN_PACKAGE.version))).toEqual(omitDownloads(PLUGIN));
});

test('Manager sync skips an unreachable registry instead of throwing', async () => {
  // Simulate one registry that can't be reached (rather than depending on example.invalid's
  // RFC 2606 guarantee to actually fail DNS resolution over a real network round trip) and one
  // that responds normally, so this stays deterministic and network-free either way.
  const apiJsonSpy = vi.spyOn(apiHelpers, 'apiJson').mockImplementation(async (url: string) => {
    if (url.startsWith('https://example.invalid')) throw new Error('getaddrinfo ENOTFOUND example.invalid');
    return REGISTRY_PLUGIN_VER;
  });

  const manager = new Manager(RegistryType.Plugins, {
    registries: [
      { name: 'Unreachable Registry', url: 'https://example.invalid/registry' },
      { name: 'Reachable Registry', url: 'https://example.com/registry' },
    ],
  });
  await expect(manager.sync()).resolves.not.toThrow();
  expect(manager.getSyncErrors().length).toBeGreaterThan(0);

  // The other, reachable registry should still have synced successfully.
  const pkg = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkg?.getVersion(PLUGIN_PACKAGE.version)).toEqual(PLUGIN);

  apiJsonSpy.mockRestore();
});

test('Manager sync isolates a malformed package version instead of throwing', async () => {
  const pluginInvalid: PackageVersion = structuredClone(PLUGIN);
  delete (pluginInvalid as any).image;

  vi.spyOn(apiHelpers, 'apiJson').mockResolvedValue({
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

  expect(manager.getPackage('test-org/good-plugin')?.getVersion('1.0.0')).toEqual(PLUGIN);
  expect(manager.getPackage('test-org/bad-plugin')).toBeUndefined();
  expect(manager.getSyncErrors()).toEqual(
    expect.arrayContaining([expect.stringContaining('test-org/bad-plugin@1.0.0')]),
  );
});

test('Manager sync appends a configured registry version to the request url', async () => {
  const apiJsonSpy = vi.spyOn(apiHelpers, 'apiJson').mockResolvedValue({
    name: 'Mock Registry',
    url: 'https://example.invalid/registry',
    version: '1.0.0',
    [RegistryType.Plugins]: {},
  });

  const manager = new Manager(RegistryType.Plugins, {
    registries: [{ name: 'Mock Registry', url: 'https://example.invalid/registry', version: 'v1' }],
  });
  await manager.sync();

  expect(apiJsonSpy).toHaveBeenCalledWith('https://example.invalid/registry/v1');
});

test('Manager sync with existing package', async () => {
  mockRegistrySync(REGISTRY_PLUGIN_VER);
  const manager = new Manager(RegistryType.Plugins);
  const pkg = new Package(PLUGIN_PACKAGE.slug);
  pkg.addVersion(PLUGIN_PACKAGE.version, { ...PLUGIN, name: 'Surge modified' });
  manager.addPackage(pkg);

  await manager.sync();
  const pkgReturned = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(pkgReturned?.getVersion(PLUGIN_PACKAGE.version)?.name).toEqual('Surge XT');
});

// The registry root/list endpoints only summarize each package's latest version, and omit
// `url`/`sha256` from each file (see specification.md "Listing endpoints vs package endpoints") -
// the following tests cover sync() ingesting that trimmed shape, and resolvePackageVersion()
// transparently fetching the full version (with every file's url/sha256) on demand.
test('Manager sync ingests a trimmed summary (files present, url/sha256 omitted) without rejecting the package', async () => {
  const pluginSummary = toSummaryVersion(PLUGIN);
  vi.spyOn(apiHelpers, 'apiJson').mockResolvedValue({
    name: 'Mock Registry',
    url: 'https://example.invalid/mock',
    version: '1.0.0',
    [RegistryType.Plugins]: {
      [PLUGIN_PACKAGE.slug]: {
        slug: PLUGIN_PACKAGE.slug,
        version: PLUGIN_PACKAGE.version,
        versions: { [PLUGIN_PACKAGE.version]: pluginSummary },
      },
    },
  });

  const manager = new Manager(RegistryType.Plugins, {
    registries: [{ name: 'Mock Registry', url: 'https://example.invalid/mock' }],
  });
  await manager.sync();

  expect(manager.getSyncErrors()).toEqual([]);
  const pkgVersion = manager.getPackage(PLUGIN_PACKAGE.slug)?.getVersion(PLUGIN_PACKAGE.version);
  expect(pkgVersion?.files).toHaveLength(PLUGIN.files.length);
  expect(pkgVersion?.files.every(file => !file.url && !file.sha256)).toEqual(true);
  expect(pkgVersion?.name).toEqual(PLUGIN.name);
});

test('Manager resolvePackageVersion fetches the full version when the cached summary is missing url/sha256', async () => {
  const pluginSummary = toSummaryVersion(PLUGIN);
  const versionUrl = `https://example.invalid/mock/${RegistryType.Plugins}/${PLUGIN_PACKAGE.slug}/${PLUGIN_PACKAGE.version}`;
  const apiJsonSpy = vi.spyOn(apiHelpers, 'apiJson').mockImplementation(async (url: string) => {
    if (url === versionUrl) return PLUGIN;
    return {
      name: 'Mock Registry',
      url: 'https://example.invalid/mock',
      version: '1.0.0',
      [RegistryType.Plugins]: {
        [PLUGIN_PACKAGE.slug]: {
          slug: PLUGIN_PACKAGE.slug,
          version: PLUGIN_PACKAGE.version,
          versions: { [PLUGIN_PACKAGE.version]: pluginSummary },
        },
      },
    };
  });

  const manager = new Manager(RegistryType.Plugins, {
    registries: [{ name: 'Mock Registry', url: 'https://example.invalid/mock' }],
  });
  await manager.sync();
  const resolved = await manager.resolvePackageVersion(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);

  expect(resolved?.pkgVersion.files).toEqual(PLUGIN.files);
  expect(apiJsonSpy).toHaveBeenCalledWith(versionUrl);
});

// specification.md ("Listing endpoints vs package endpoints") guarantees a version's `files` array
// is ordered identically at every tier, so a caller can select a file from the pre-fetch summary
// (no url/sha256) and find its full counterpart in resolvePackageVersion()'s result by array index
// alone - this is what studiorack-app's file picker relies on.
test('Manager resolvePackageVersion preserves file array order between the cached summary and the resolved full version', async () => {
  const pluginSummary = toSummaryVersion(PLUGIN);
  const versionUrl = `https://example.invalid/mock/${RegistryType.Plugins}/${PLUGIN_PACKAGE.slug}/${PLUGIN_PACKAGE.version}`;
  vi.spyOn(apiHelpers, 'apiJson').mockImplementation(async (url: string) => {
    if (url === versionUrl) return PLUGIN;
    return {
      name: 'Mock Registry',
      url: 'https://example.invalid/mock',
      version: '1.0.0',
      [RegistryType.Plugins]: {
        [PLUGIN_PACKAGE.slug]: {
          slug: PLUGIN_PACKAGE.slug,
          version: PLUGIN_PACKAGE.version,
          versions: { [PLUGIN_PACKAGE.version]: pluginSummary },
        },
      },
    };
  });

  const manager = new Manager(RegistryType.Plugins, {
    registries: [{ name: 'Mock Registry', url: 'https://example.invalid/mock' }],
  });
  await manager.sync();
  const summaryFiles = manager.getPackage(PLUGIN_PACKAGE.slug)!.getVersion(PLUGIN_PACKAGE.version)!.files;
  const resolved = await manager.resolvePackageVersion(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);

  expect(summaryFiles).toHaveLength(resolved!.pkgVersion.files.length);
  summaryFiles.forEach((summaryFile, index) => {
    const resolvedFile = resolved!.pkgVersion.files[index];
    expect(resolvedFile.architectures).toEqual(summaryFile.architectures);
    expect(resolvedFile.systems).toEqual(summaryFile.systems);
    expect(resolvedFile.url).toBeDefined();
  });
});

test('Manager resolvePackageVersion returns undefined for an unknown package', async () => {
  const manager = new Manager(RegistryType.Plugins);
  expect(await manager.resolvePackageVersion('nonexistent-org/nonexistent-plugin')).toBeUndefined();
});

test('Manager resolvePackageVersion returns undefined when no registry has the version', async () => {
  const apiJsonSpy = mockRegistrySync(REGISTRY_PLUGIN_VER);
  const manager = new Manager(RegistryType.Plugins, {
    registries: [{ name: 'Mock Registry', url: 'https://example.invalid/mock' }],
  });
  await manager.sync();
  apiJsonSpy.mockRejectedValue(new Error('not found'));

  expect(await manager.resolvePackageVersion(PLUGIN_PACKAGE.slug, '99.99.99')).toBeUndefined();
});

test('Manager resolvePackageVersion does not refetch when the cached version already has files', async () => {
  const apiJsonSpy = mockRegistrySync(REGISTRY_PLUGIN_VER);
  const manager = new Manager(RegistryType.Plugins);
  await manager.sync();
  apiJsonSpy.mockClear();

  const resolved = await manager.resolvePackageVersion(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);
  expect(resolved?.pkgVersion.files).toEqual(PLUGIN.files);
  expect(apiJsonSpy).not.toHaveBeenCalled();
});

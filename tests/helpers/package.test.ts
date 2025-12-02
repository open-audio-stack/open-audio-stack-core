import { expect, test } from 'vitest';
import {
  packageCompatibleFiles,
  packageRecommendations,
  packageVersionLatest,
  PackageVersionValidator,
} from '../../src/helpers/package.js';
import { PLUGIN, PLUGIN_PACKAGE_MULTIPLE } from '../data/Plugin';
import { PackageVersion } from '../../src/types/Package';
import { Architecture } from '../../src/types/Architecture.js';
import { SystemType } from '../../src/types/SystemType.js';
import { FileFormat } from '../../src/types/FileFormat.js';

test('Package version latest', () => {
  expect(packageVersionLatest(PLUGIN_PACKAGE_MULTIPLE)).toEqual('1.3.2');
});

test('Package recommendations pass', () => {
  expect(packageRecommendations(PLUGIN)).toEqual([
    {
      field: 'url',
      rec: 'requires mounting step, consider .pkg instead',
    },
  ]);
});

test('Package recommendations fail', () => {
  const PLUGIN_BAD: PackageVersion = structuredClone(PLUGIN);
  PLUGIN_BAD.url = 'http://www.github.com';
  expect(packageRecommendations(PLUGIN_BAD)).toEqual([
    {
      field: 'url',
      rec: 'should use https url',
    },
    {
      field: 'url',
      rec: 'requires mounting step, consider .pkg instead',
    },
  ]);
});

test('Package validate pass', () => {
  expect(PackageVersionValidator.safeParse(PLUGIN).success).toEqual(true);
});

test('Package validate missing field', () => {
  const PLUGIN_BAD: PackageVersion = structuredClone(PLUGIN);
  // @ts-expect-error this is intentionally bad data.
  delete PLUGIN_BAD['image'];
  expect(PackageVersionValidator.safeParse(PLUGIN_BAD).error?.issues).toEqual([
    {
      code: 'invalid_type',
      expected: 'string',
      message: 'Required',
      path: ['image'],
      received: 'undefined',
    },
  ]);
});

test('Package validate invalid type', () => {
  const PLUGIN_BAD: PackageVersion = structuredClone(PLUGIN);
  // @ts-expect-error this is intentionally bad data.
  PLUGIN_BAD['image'] = 123;
  expect(PackageVersionValidator.safeParse(PLUGIN_BAD).error?.issues).toEqual([
    {
      code: 'invalid_type',
      expected: 'string',
      message: 'Expected string, received number',
      path: ['image'],
      received: 'number',
    },
  ]);
});

test('Package compatible files returns empty when only unsupported formats exist', () => {
  const rpmOnlyPackage: PackageVersion = {
    ...PLUGIN,
    files: [PLUGIN.files[1]], // Only the RPM file
  };
  const excludedResult = packageCompatibleFiles(
    rpmOnlyPackage,
    [Architecture.X64],
    [SystemType.Linux],
    [FileFormat.RedHatPackage],
  );
  expect(excludedResult).toHaveLength(0);
});

test('Package compatible files respects exclusions when alternatives exist', () => {
  const bothFormatsPackage: PackageVersion = {
    ...PLUGIN,
    files: [PLUGIN.files[0], PLUGIN.files[1]], // DEB and RPM files
  };
  const result = packageCompatibleFiles(
    bothFormatsPackage,
    [Architecture.X64],
    [SystemType.Linux],
    [FileFormat.RedHatPackage],
  );
  expect(result).toHaveLength(1);
  expect(result[0].url).toContain('.deb');
});

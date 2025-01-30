import { expect, test } from 'vitest';
import { packageRecommendations, packageVersionLatest, PackageVersionValidator } from '../../src/helpers/package.js';
import { PLUGIN, PLUGIN_PACKAGE_MULTIPLE } from '../data/Plugin';
import { PackageVersion } from '../../src/types/Package';

test('Package version latest', () => {
  expect(packageVersionLatest(PLUGIN_PACKAGE_MULTIPLE)).toEqual('1.3.2');
});

test('Package recommendations pass', () => {
  expect(packageRecommendations(PLUGIN)).toEqual([
    {
      field: 'format',
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
      field: 'format',
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
  delete PLUGIN_BAD['audio'];
  expect(PackageVersionValidator.safeParse(PLUGIN_BAD).error?.issues).toEqual([
    {
      code: 'invalid_type',
      expected: 'string',
      message: 'Required',
      path: ['audio'],
      received: 'undefined',
    },
  ]);
});

test('Package validate invalid type', () => {
  const PLUGIN_BAD: PackageVersion = structuredClone(PLUGIN);
  // @ts-expect-error this is intentionally bad data.
  PLUGIN_BAD['audio'] = 123;
  expect(PackageVersionValidator.safeParse(PLUGIN_BAD).error?.issues).toEqual([
    {
      code: 'invalid_type',
      expected: 'string',
      message: 'Expected string, received number',
      path: ['audio'],
      received: 'number',
    },
  ]);
});

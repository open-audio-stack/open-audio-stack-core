import { expect, test } from 'vitest';
import {
  packageCompatibleFiles,
  packageDownloadsTotal,
  packageIsVerified,
  packageRecommendations,
  packageSummaryErrors,
  packageVersionLatest,
  PackageVersionSummaryValidator,
  PackageVersionValidator,
} from '../../src/helpers/package.js';
import { PLUGIN, PLUGIN_PACKAGE_MULTIPLE } from '../data/Plugin';
import { PackageVersion } from '../../src/types/Package';
import { Architecture } from '../../src/types/Architecture.js';
import { SystemType } from '../../src/types/SystemType.js';
import { FileFormat } from '../../src/types/FileFormat.js';
import { toSummaryVersion } from '../testUtils';

test('Package version latest', () => {
  expect(packageVersionLatest(PLUGIN_PACKAGE_MULTIPLE)).toEqual('1.3.2');
});

test('Package downloads total sums across files', () => {
  const pluginWithDownloads: PackageVersion = {
    ...PLUGIN,
    files: PLUGIN.files.map((file, index) => ({ ...file, downloads: index === 0 ? undefined : (index + 1) * 10 })),
  };
  // files[0].downloads left undefined - missing/not-yet-fetched data must count as 0, not NaN.
  expect(packageDownloadsTotal(pluginWithDownloads)).toEqual(20 + 30 + 40 + 50);
});

test('Package downloads total is zero when no files have downloads', () => {
  expect(packageDownloadsTotal(PLUGIN)).toEqual(0);
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

test('Package recommendations does not flag mixed-case extensions as unsupported', () => {
  const PLUGIN_MIXED_CASE: PackageVersion = structuredClone(PLUGIN);
  PLUGIN_MIXED_CASE.files = [
    {
      ...PLUGIN.files[0],
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-linux-x64-1.3.1.AppImage',
    },
  ];
  const recs = packageRecommendations(PLUGIN_MIXED_CASE);
  expect(recs).not.toContainEqual({ field: 'url', rec: 'not a supported format' });
  expect(recs).toContainEqual({
    field: 'url',
    rec: 'requires manual installation steps, consider .deb and .rpm instead',
  });
});

test('Package compatible files excludes formats regardless of extension case', () => {
  const mixedCasePackage: PackageVersion = {
    ...PLUGIN,
    files: [
      { ...PLUGIN.files[0] },
      {
        ...PLUGIN.files[1],
        url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-x86_64-1.3.1.RPM',
      },
    ],
  };
  const result = packageCompatibleFiles(
    mixedCasePackage,
    [Architecture.X64],
    [SystemType.Linux],
    [FileFormat.RedHatPackage],
  );
  expect(result).toHaveLength(1);
  expect(result[0].url).toContain('.deb');
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

test('Package is verified when every file url matches the org', () => {
  expect(packageIsVerified('surge-synthesizer/surge', PLUGIN)).toEqual(true);
});

test('Package is not verified when any file url does not match the org', () => {
  const pluginWithForeignFile: PackageVersion = {
    ...PLUGIN,
    files: [
      ...PLUGIN.files,
      {
        ...PLUGIN.files[0],
        url: 'https://github.com/someone-else/unrelated/releases/download/1.0.0/file.deb',
      },
    ],
  };
  expect(packageIsVerified('surge-synthesizer/surge', pluginWithForeignFile)).toEqual(false);
});

test('Package is not verified when url is missing per file (summary payload)', () => {
  const summaryPlugin = toSummaryVersion(PLUGIN);
  expect(() => packageIsVerified('surge-synthesizer/surge', summaryPlugin)).not.toThrow();
  expect(packageIsVerified('surge-synthesizer/surge', summaryPlugin)).toEqual(false);
});

test('Package compatible files still matches on architecture/system when url is missing (summary payload)', () => {
  const summaryPlugin = toSummaryVersion(PLUGIN);
  // PLUGIN has two Linux/x64 files (the .deb and the .rpm) - both should still match without
  // needing url, since compatibility here is architecture/system only (no excludedFormats).
  expect(() => packageCompatibleFiles(summaryPlugin, [Architecture.X64], [SystemType.Linux])).not.toThrow();
  expect(packageCompatibleFiles(summaryPlugin, [Architecture.X64], [SystemType.Linux])).toHaveLength(2);
});

test('Package compatible files does not exclude a format it cannot determine (url missing)', () => {
  const summaryPlugin = toSummaryVersion(PLUGIN);
  // excludedFormats relies on the file's url extension - without it, format can't be checked, so
  // this must not exclude the Linux files (unlike the full-data equivalent test above, which does
  // exclude the .rpm).
  const result = packageCompatibleFiles(
    summaryPlugin,
    [Architecture.X64],
    [SystemType.Linux],
    [FileFormat.RedHatPackage],
  );
  expect(result).toHaveLength(2);
});

test('Package summary validator accepts a version whose files are missing url/sha256', () => {
  const summaryPlugin = toSummaryVersion(PLUGIN);
  expect(PackageVersionSummaryValidator.safeParse(summaryPlugin).success).toEqual(true);
  expect(packageSummaryErrors(summaryPlugin)).toEqual([]);
});

test('Package summary validator still rejects other missing required fields', () => {
  const summaryPlugin = toSummaryVersion(PLUGIN);
  // @ts-expect-error this is intentionally bad data.
  delete summaryPlugin.image;
  expect(packageSummaryErrors(summaryPlugin)).toEqual([
    {
      code: 'invalid_type',
      expected: 'string',
      message: 'Required',
      path: ['image'],
      received: 'undefined',
    },
  ]);
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

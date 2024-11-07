import path from 'path';
import { expect, test } from 'vitest';
import { pathGetDirectory, pathGetExt, pathGetFilename, pathGetSlug, pathGetVersion } from '../../src/helpers/utils';

const PLUGIN_DIR = path.join('surge-synthesizer', 'surge', '1.3.1');
const PLUGIN_EXT = 'vst3';
const PLUGIN_FILENAME = 'surge.vst3';
const PLUGIN_PATH = path.join('surge-synthesizer', 'surge', '1.3.1', 'surge.vst3');
const PLUGIN_SLUG = 'surge-synthesizer/surge';
const PLUGIN_VERSION = '1.3.1';

test('Path get ext', () => {
  expect(pathGetExt(PLUGIN_PATH)).toEqual(PLUGIN_EXT);
});

test('Path get directory', () => {
  expect(pathGetDirectory(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_DIR);
});

test('Path get filename', () => {
  expect(pathGetFilename(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_FILENAME);
});

test('Path get slug', () => {
  expect(pathGetSlug(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_SLUG);
});

test('Path get version', () => {
  expect(pathGetVersion(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_VERSION);
});

import path from 'path';
import { expect, test } from 'vitest';
import {
  inputGetParts,
  isValidGithubRepo,
  pathGetDirectory,
  pathGetExt,
  pathGetFilename,
  pathGetSlug,
  pathGetVersion,
} from '../../src/helpers/utils';

const PLUGIN_ORG = 'surge-synthesizer';
const PLUGIN_ID = 'surge';
const PLUGIN_VERSION = '1.3.1';
const PLUGIN_DIR = path.join(PLUGIN_ORG, PLUGIN_ID, PLUGIN_VERSION);

const PLUGIN_EXT = 'vst3';
const PLUGIN_FILENAME = 'surge.vst3';
const PLUGIN_PATH = path.join(PLUGIN_ORG, PLUGIN_ID, PLUGIN_VERSION, 'surge.vst3');
const PLUGIN_SLUG = `${PLUGIN_ORG}/${PLUGIN_ID}`;

test('Input get parts', () => {
  expect(inputGetParts(`${PLUGIN_ORG}/${PLUGIN_ID}`)).toEqual([`${PLUGIN_ORG}/${PLUGIN_ID}`]);
  expect(inputGetParts(`${PLUGIN_ORG}/${PLUGIN_ID}@${PLUGIN_VERSION}`)).toEqual([
    `${PLUGIN_ORG}/${PLUGIN_ID}`,
    PLUGIN_VERSION,
  ]);
});

test('Path get directory', () => {
  expect(pathGetDirectory(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_DIR);
});

test('Path get extension', () => {
  expect(pathGetExt(PLUGIN_PATH)).toEqual(PLUGIN_EXT);
});

test('Path get filename', () => {
  expect(pathGetFilename(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_FILENAME);
});

test('Path get slug', () => {
  expect(pathGetSlug(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_SLUG);
  expect(pathGetSlug(path.join('prefix-dir', PLUGIN_ORG, PLUGIN_ID, PLUGIN_VERSION, 'surge.vst3'), path.sep)).toEqual(
    PLUGIN_SLUG,
  );
  expect(pathGetSlug(path.join(PLUGIN_ORG, PLUGIN_ID, PLUGIN_VERSION, 'suffix-dir', 'surge.vst3'), path.sep)).toEqual(
    PLUGIN_SLUG,
  );
});

test('Is valid GitHub repo', () => {
  expect(isValidGithubRepo('octocat/Hello-World')).toEqual(true);
  expect(isValidGithubRepo('surge-synthesizer/surge')).toEqual(true);
  expect(isValidGithubRepo('open-audio-stack')).toEqual(false);
  expect(isValidGithubRepo('too/many/slashes')).toEqual(false);
  expect(isValidGithubRepo('')).toEqual(false);
  expect(isValidGithubRepo('org/repo name')).toEqual(false);
});

test('Path get version', () => {
  expect(pathGetVersion(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_VERSION);
  expect(
    pathGetVersion(path.join('prefix-dir', PLUGIN_ORG, PLUGIN_ID, PLUGIN_VERSION, 'surge.vst3'), path.sep),
  ).toEqual(PLUGIN_VERSION);
  expect(
    pathGetVersion(path.join(PLUGIN_ORG, PLUGIN_ID, PLUGIN_VERSION, 'suffix-dir', 'surge.vst3'), path.sep),
  ).toEqual(PLUGIN_VERSION);
});

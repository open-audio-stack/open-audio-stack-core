import path from 'path';
import { expect, test } from 'vitest';
import {
  getArchitecture,
  getSystem,
  inputGetParts,
  isTests,
  logDisable,
  logEnable,
  logReport,
  pathGetDirectory,
  pathGetExt,
  pathGetFilename,
  pathGetSlug,
  pathGetVersion,
} from '../../src/helpers/utils';
import { log } from 'console';

const PLUGIN_ORG = 'surge-synthesizer';
const PLUGIN_ID = 'surge';
const PLUGIN_VERSION = '1.3.1';
const PLUGIN_DIR = path.join(PLUGIN_ORG, PLUGIN_ID, PLUGIN_VERSION);

const PLUGIN_EXT = 'vst3';
const PLUGIN_FILENAME = 'surge.vst3';
const PLUGIN_PATH = path.join(PLUGIN_ORG, PLUGIN_ID, PLUGIN_VERSION, 'surge.vst3');
const PLUGIN_SLUG = `${PLUGIN_ORG}/${PLUGIN_ID}`;

test('Get Architecture', () => {
  if (process.arch === 'arm') {
    expect(getArchitecture()).toEqual('arm32');
  } else if (process.arch === 'arm64') {
    expect(getArchitecture()).toEqual('arm64');
  } else if (process.arch === 'ia32') {
    expect(getArchitecture()).toEqual('x32');
  } else {
    expect(getArchitecture()).toEqual('x64');
  }
});

test('Get System', () => {
  if (process.platform === 'win32') {
    expect(getSystem()).toEqual('win');
  } else if (process.platform === 'darwin') {
    expect(getSystem()).toEqual('mac');
  } else {
    expect(getSystem()).toEqual('linux');
  }
});

test('Input get parts', () => {
  expect(inputGetParts(`${PLUGIN_ORG}/${PLUGIN_ID}`)).toEqual([`${PLUGIN_ORG}/${PLUGIN_ID}`]);
  expect(inputGetParts(`${PLUGIN_ORG}/${PLUGIN_ID}@${PLUGIN_VERSION}`)).toEqual([
    `${PLUGIN_ORG}/${PLUGIN_ID}`,
    PLUGIN_VERSION,
  ]);
});

test('Is tests', () => {
  expect(isTests()).toEqual(true);
});

test('Log enabled', () => {
  expect(logEnable()).toEqual(true);
});

test('Log when enabled', () => {
  expect(log()).toEqual(undefined);
});

test('Log disabled', () => {
  expect(logDisable()).toEqual(false);
});

test('Log when disabled', () => {
  expect(log()).toEqual(undefined);
});

test('Log report', () => {
  expect(logReport('Example')).toEqual(undefined);
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
});

test('Path get version', () => {
  expect(pathGetVersion(PLUGIN_PATH, path.sep)).toEqual(PLUGIN_VERSION);
});

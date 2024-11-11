import os from 'os';
import path from 'path';
import { expect, test } from 'vitest';
import {
  dirApp,
  dirCreate,
  dirDelete,
  dirEmpty,
  dirExists,
  dirIs,
  dirMove,
  dirOpen,
  dirPackage,
  dirPlugins,
  dirPresets,
  dirProjects,
  dirRead,
  dirRename,
  fileCreate,
  fileHash,
  // fileDate,
  // fileDelete,
  // fileExec,
  // fileExists,
  // fileJsonCreate,
  // fileMove,
  // fileOpen,
  // fileRead,
  // fileReadJson,
  // fileReadString,
  // fileReadYaml,
  // fileSize,
} from '../../src/helpers/file.js';
import { PackageInterface } from '../../src/types/Package.js';

const DIR_PATH: string = path.join('test', 'new-directory');
const DIR_PATH_GLOB: string = path.join('test', 'new-directory', '**', '*.txt');
const DIR_RENAME: string = path.join('test', 'new-directory-renamed');
const FILE_PATH: string = path.join('test', 'new-directory', 'file.txt');

test('Get directory app', () => {
  if (process.platform === 'win32') {
    expect(dirApp()).toEqual(process.env.APPDATA || os.homedir());
  } else if (process.platform === 'darwin') {
    expect(dirApp()).toEqual(`${os.homedir()}/Library/Preferences`);
  } else {
    expect(dirApp()).toEqual(`${os.homedir()}/.local/share`);
  }
});

test('Create new directory', () => {
  expect(dirCreate(DIR_PATH)).toEqual(DIR_PATH);
});

test('Create existing directory', () => {
  expect(dirCreate(DIR_PATH)).toEqual(false);
});

test('Directory is empty', () => {
  expect(dirEmpty(DIR_PATH)).toEqual(true);
});

test('Directory exists', () => {
  expect(dirExists(DIR_PATH)).toEqual(true);
});

test('Directory is', () => {
  fileCreate(FILE_PATH, 'file contents');
  expect(dirIs(DIR_PATH)).toEqual(true);
  expect(dirIs(FILE_PATH)).toEqual(false);
});

test('Directory move', () => {
  expect(dirMove(DIR_PATH, DIR_RENAME)).toBeUndefined();
  expect(dirMove(DIR_RENAME, DIR_PATH)).toBeUndefined();
});

test('Directory open', () => {
  expect(dirOpen(DIR_PATH)).toEqual(new Buffer(''));
});

test('Get directory package', () => {
  const PACKAGE: PackageInterface = {
    slug: 'surge-synth/surge',
    version: '1.3.1',
    versions: {},
  };
  if (process.platform === 'win32') {
    expect(dirPackage(PACKAGE)).toEqual('surge-synth\\surge\\1.3.1');
  } else {
    expect(dirPackage(PACKAGE)).toEqual('surge-synth/surge/1.3.1');
  }
});

test('Get directory plugins', () => {
  if (process.platform === 'win32') {
    expect(dirPlugins()).toEqual('Program Files\\Common Files');
  } else if (process.platform === 'darwin') {
    expect(dirPlugins()).toEqual(`${os.homedir()}/Library/Audio/Plug-ins`);
  } else {
    expect(dirPlugins()).toEqual('usr/local/lib');
  }
});

test('Get directory presets', () => {
  if (process.platform === 'win32') {
    expect(dirPresets()).toEqual(`${os.homedir()}\\Documents\\VST3 Presets`);
  } else if (process.platform === 'darwin') {
    expect(dirPresets()).toEqual(`${os.homedir()}/Library/Audio/Presets`);
  } else {
    expect(dirPresets()).toEqual(`${os.homedir()}/.vst3/presets`);
  }
});

test('Get directory projects', () => {
  if (process.platform === 'win32') {
    expect(dirProjects()).toEqual(`${os.homedir()}\\Documents\\Audio`);
  } else if (process.platform === 'darwin') {
    expect(dirProjects()).toEqual(`${os.homedir()}/Documents/Audio`);
  } else {
    expect(dirProjects()).toEqual(`${os.homedir()}/Documents/Audio`);
  }
});

test('Read directory', () => {
  expect(dirRead(DIR_PATH)).toEqual([DIR_PATH]);
});

test('Read directory glob', () => {
  expect(dirRead(DIR_PATH_GLOB)).toEqual([FILE_PATH]);
});

test('Create file', () => {
  expect(fileCreate(FILE_PATH, 'file contents')).toBeUndefined();
});

test('Rename directory', () => {
  expect(dirRename(DIR_PATH, DIR_RENAME)).toBeUndefined();
});

test('Delete existing directory', () => {
  expect(dirDelete(DIR_RENAME)).toBeUndefined();
});

test('Delete missing directory', () => {
  expect(dirDelete(DIR_RENAME)).toEqual(false);
});

test('File hash', () => {
  expect(fileHash('LICENSE')).toEqual('a2010f343487d3f7618affe54f789f5487602331c0a8d03f49e9a7c547cf0499');
});

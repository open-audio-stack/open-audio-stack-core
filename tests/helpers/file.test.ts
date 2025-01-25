import os from 'os';
import path from 'path';
import { expect, test } from 'vitest';
import {
  dirApp,
  dirCreate,
  dirContains,
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
  // fileCreateJson,
  // fileDate,
  // fileDelete,
  // fileExec,
  // fileExists,
  // fileMove,
  // fileOpen,
  // fileRead,
  // fileReadJson,
  // fileReadString,
  // fileReadYaml,
  // fileSize,
  isAdmin,
  getPlatform,
} from '../../src/helpers/file.js';
import { PackageInterface } from '../../src/types/Package.js';
import { apiText } from '../../src/helpers/api.js';

const DIR_APP: string = 'open-audio-stack';
const DIR_PATH: string = path.join('test', 'new-directory');
const DIR_PATH_GLOB: string = path.join('test', 'new-directory', '**', '*.txt');
const DIR_RENAME: string = path.join('test', 'new-directory-renamed');
const FILE_PATH: string = path.join('test', 'new-directory', 'file.txt');

test('Get directory app', () => {
  if (process.platform === 'win32') {
    expect(dirApp()).toEqual(process.env.APPDATA || path.join(os.homedir(), DIR_APP));
  } else if (process.platform === 'darwin') {
    expect(dirApp()).toEqual(`${os.homedir()}/Library/Preferences/${DIR_APP}`);
  } else {
    expect(dirApp()).toEqual(`${os.homedir()}/.local/share/${DIR_APP}`);
  }
});

test('Create new directory', () => {
  expect(dirCreate(DIR_PATH)).toEqual(DIR_PATH);
});

test('Create existing directory', () => {
  expect(dirCreate(DIR_PATH)).toEqual(false);
});

test('Directory contains', () => {
  expect(dirContains('test', DIR_PATH)).toEqual(true);
  expect(dirContains(dirApp(), DIR_PATH)).toEqual(false);
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
  expect(dirOpen(DIR_PATH)).toEqual(Buffer.from(''));
});

test('Directory package', () => {
  const PACKAGE: PackageInterface = {
    slug: 'surge-synthesizer/surge',
    version: '1.3.1',
    versions: {},
  };
  if (process.platform === 'win32') {
    expect(dirPackage(PACKAGE)).toEqual('surge-synthesizer\\surge\\1.3.1');
  } else {
    expect(dirPackage(PACKAGE)).toEqual('surge-synthesizer/surge/1.3.1');
  }
});

test('Directory plugins', () => {
  if (process.platform === 'win32') {
    expect(dirPlugins()).toEqual('Program Files\\Common Files');
  } else if (process.platform === 'darwin') {
    expect(dirPlugins()).toEqual(`${os.homedir()}/Library/Audio/Plug-ins`);
  } else {
    expect(dirPlugins()).toEqual('usr/local/lib');
  }
});

test('Directory presets', () => {
  if (process.platform === 'win32') {
    expect(dirPresets()).toEqual(`${os.homedir()}\\Documents\\VST3 Presets`);
  } else if (process.platform === 'darwin') {
    expect(dirPresets()).toEqual(`${os.homedir()}/Library/Audio/Presets`);
  } else {
    expect(dirPresets()).toEqual(`${os.homedir()}/.vst3/presets`);
  }
});

test('Directory projects', () => {
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

test('File hash', async () => {
  // Hashing a file which has been checked out from git source will produce inconsistent hashes.
  // git checkout converts file line endings based on the system running.
  // Using a file downloaded outside of git will avoide this issue.
  const fileData: string = await apiText(
    'https://github.com/open-audio-stack/open-audio-stack-core/raw/refs/heads/main/LICENSE',
  );
  fileCreate('test/fileHash', fileData);
  expect(await fileHash('test/fileHash')).toEqual('a2010f343487d3f7618affe54f789f5487602331c0a8d03f49e9a7c547cf0499');
});

test('Get platform', () => {
  let currentPlatform: string = 'linux';
  if (process.platform === 'win32') {
    currentPlatform = 'win';
  } else if (process.platform === 'darwin') {
    currentPlatform = 'mac';
  }
  expect(getPlatform()).toEqual(currentPlatform);
});

test('Is Admin', () => {
  expect(isAdmin()).toEqual(process.env.CI && process.platform === 'win32' ? true : false);
});

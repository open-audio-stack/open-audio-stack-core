import os from 'os';
import { expect, test } from 'vitest';
import FileSystem from '../src/FileSystem.js';
import { PackageInterface } from '../src/types/Package.js';

test('Get directory app', () => {
  const fileSystem: FileSystem = new FileSystem();
  if (process.platform === 'win32') {
    expect(fileSystem.dirApp()).toEqual(process.env.APPDATA || os.homedir());
  } else if (process.platform === 'darwin') {
    expect(fileSystem.dirApp()).toEqual(`${os.homedir()}/Library/Preferences`);
  } else {
    expect(fileSystem.dirApp()).toEqual(`${os.homedir()}/.local/share`);
  }
});

test('Get directory package', () => {
  const fileSystem: FileSystem = new FileSystem();
  const PACKAGE: PackageInterface = {
    slug: 'surge-synth/surge',
    version: '1.3.1',
    versions: {},
  };
  if (process.platform === 'win32') {
    expect(fileSystem.dirPackage(PACKAGE)).toEqual('surge-synth\\surge\\1.3.1');
  } else {
    expect(fileSystem.dirPackage(PACKAGE)).toEqual('surge-synth/surge/1.3.1');
  }
});

test('Get directory plugins', () => {
  const fileSystem: FileSystem = new FileSystem();
  if (process.platform === 'win32') {
    expect(fileSystem.dirPlugins()).toEqual('Program Files\\Common Files');
  } else if (process.platform === 'darwin') {
    expect(fileSystem.dirPlugins()).toEqual(`${os.homedir()}/Library/Audio/Plug-ins`);
  } else {
    expect(fileSystem.dirPlugins()).toEqual('usr/local/lib');
  }
});

test('Get directory presets', () => {
  const fileSystem: FileSystem = new FileSystem();
  if (process.platform === 'win32') {
    expect(fileSystem.dirPresets()).toEqual(`${os.homedir()}\\Documents\\VST3 Presets`);
  } else if (process.platform === 'darwin') {
    expect(fileSystem.dirPresets()).toEqual(`${os.homedir()}/Library/Audio/Presets`);
  } else {
    expect(fileSystem.dirPresets()).toEqual(`${os.homedir()}/.vst3/presets`);
  }
});

test('Get directory projects', () => {
  const fileSystem: FileSystem = new FileSystem();
  if (process.platform === 'win32') {
    expect(fileSystem.dirProjects()).toEqual(`${os.homedir()}\\Documents\\Audio`);
  } else if (process.platform === 'darwin') {
    expect(fileSystem.dirProjects()).toEqual(`${os.homedir()}/Documents/Audio`);
  } else {
    expect(fileSystem.dirProjects()).toEqual(`${os.homedir()}/Documents/Audio`);
  }
});

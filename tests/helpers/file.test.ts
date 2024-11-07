import os from 'os';
import { expect, test } from 'vitest';
import { dirApp, dirPackage, dirPlugins, dirPresets, dirProjects } from '../../src/helpers/file.js';
import { PackageInterface } from '../../src/types/Package.js';

test('Get directory app', () => {
  if (process.platform === 'win32') {
    expect(dirApp()).toEqual(process.env.APPDATA || os.homedir());
  } else if (process.platform === 'darwin') {
    expect(dirApp()).toEqual(`${os.homedir()}/Library/Preferences`);
  } else {
    expect(dirApp()).toEqual(`${os.homedir()}/.local/share`);
  }
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

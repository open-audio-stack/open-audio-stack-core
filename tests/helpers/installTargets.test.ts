import path from 'path';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import * as fileHelpers from '../../src/helpers/file';
import { dirCreate, dirDelete, fileCreate, fileExists, fileReadJson } from '../../src/helpers/file';
import { installArchiveFile, installInstallerFile } from '../../src/helpers/installTargets';
import { PLUGIN } from '../data/Plugin';
import { PRESET } from '../data/Preset';
import { PROJECT } from '../data/Project';
import { PluginType } from '../../src/types/PluginType';
import { RegistryType } from '../../src/types/Registry';

// These target install*() from src/helpers/installTargets.ts directly - unlike
// ManagerLocal.test.ts's install()/uninstall() round trips, none of these go through
// download/hash-check/elevation at all, so each destination (installer marker, sampler, embedded
// installer, plugin format sorting, flat move) can be asserted in isolation.

const APP_DIR: string = path.join('test', 'installTargets');

beforeAll(() => {
  dirDelete(APP_DIR);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('installInstallerFile records a marker directory and package metadata without moving the installer itself', () => {
  const typeDir = path.join(APP_DIR, 'installer', 'plugins');
  const filePath = path.join(APP_DIR, 'installer', 'downloads', 'surge.deb');
  dirCreate(path.dirname(filePath));
  fileCreate(filePath, 'not a real installer');
  const fileOpenSpy = vi.spyOn(fileHelpers, 'fileOpen').mockReturnValue(undefined as any);

  const dirsCreated = installInstallerFile({
    typeDir,
    slug: 'surge-synthesizer/surge',
    versionNum: '1.3.1',
    pkgVersion: PLUGIN,
    filePath,
    isTestsFn: () => true,
  });

  expect(fileOpenSpy).toHaveBeenCalledWith(filePath);
  const dirTarget = path.join(typeDir, 'Installers', 'surge-synthesizer/surge', '1.3.1');
  expect(dirsCreated).toEqual([dirTarget]);
  expect(fileReadJson(path.join(dirTarget, 'index.json'))).toEqual(PLUGIN);
});

test('installArchiveFile with a Sampler package moves the whole extracted directory into Samplers/', async () => {
  const typeDir = path.join(APP_DIR, 'sampler', 'plugins');
  const filePath = path.join(APP_DIR, 'sampler', 'downloads', 'my-sampler.zip');
  const dirSource = path.join(APP_DIR, 'sampler', 'extract-source');
  dirCreate(path.dirname(filePath));
  fileCreate(filePath, 'not a real zip');

  const archiveExtractSpy = vi.spyOn(fileHelpers, 'archiveExtract').mockImplementation(async (_f, dirPath) => {
    dirCreate(dirPath);
    fileCreate(path.join(dirPath, 'sample.wav'), 'dummy');
  });

  const samplerPkgVersion = { ...PLUGIN, type: PluginType.Sampler };
  const dirsCreated = await installArchiveFile({
    typeDir,
    type: RegistryType.Plugins,
    slug: 'test-org/my-sampler',
    versionNum: '1.0.0',
    pkgVersion: samplerPkgVersion,
    filePath,
    dirSource,
    isTestsFn: () => true,
    log: () => {},
  });

  const dirTarget = path.join(typeDir, 'Samplers', 'test-org/my-sampler', '1.0.0');
  expect(dirsCreated).toEqual([dirTarget]);
  expect(fileExists(path.join(dirTarget, 'sample.wav'))).toEqual(true);
  expect(fileReadJson(path.join(dirTarget, 'index.json'))).toEqual(samplerPkgVersion);

  archiveExtractSpy.mockRestore();
});

test('installArchiveFile runs an embedded .pkg/.dmg installer found inside the archive instead of moving it', async () => {
  const typeDir = path.join(APP_DIR, 'embedded', 'projects');
  const filePath = path.join(APP_DIR, 'embedded', 'downloads', 'bundle.zip');
  const dirSource = path.join(APP_DIR, 'embedded', 'extract-source');
  dirCreate(path.dirname(filePath));
  fileCreate(filePath, 'not a real zip');

  const archiveExtractSpy = vi.spyOn(fileHelpers, 'archiveExtract').mockImplementation(async (_f, dirPath) => {
    dirCreate(dirPath);
    fileCreate(path.join(dirPath, 'installer.dmg'), 'dummy');
  });
  const fileOpenSpy = vi.spyOn(fileHelpers, 'fileOpen').mockReturnValue(undefined as any);

  const dirsCreated = await installArchiveFile({
    typeDir,
    type: RegistryType.Projects,
    slug: 'kmt/banwer',
    versionNum: '1.0.1',
    pkgVersion: PROJECT,
    filePath,
    dirSource,
    isTestsFn: () => true,
    log: () => {},
  });

  expect(fileOpenSpy).toHaveBeenCalledWith(path.join(dirSource, 'installer.dmg'));
  const dirTarget = path.join(typeDir, 'Installers', 'kmt/banwer', '1.0.1');
  expect(dirsCreated).toEqual([dirTarget]);
  expect(fileReadJson(path.join(dirTarget, 'index.json'))).toEqual(PROJECT);

  archiveExtractSpy.mockRestore();
  fileOpenSpy.mockRestore();
});

test('installArchiveFile for a Plugins package sorts files into format-specific subdirectories', async () => {
  const typeDir = path.join(APP_DIR, 'plugin-formats', 'plugins');
  const filePath = path.join(APP_DIR, 'plugin-formats', 'downloads', 'surge.zip');
  const dirSource = path.join(APP_DIR, 'plugin-formats', 'extract-source');
  dirCreate(path.dirname(filePath));
  fileCreate(filePath, 'not a real zip');

  const archiveExtractSpy = vi.spyOn(fileHelpers, 'archiveExtract').mockImplementation(async (_f, dirPath) => {
    dirCreate(dirPath);
    fileCreate(path.join(dirPath, 'surge.vst3'), 'dummy');
  });

  const dirsCreated = await installArchiveFile({
    typeDir,
    type: RegistryType.Plugins,
    slug: 'surge-synthesizer/surge',
    versionNum: '1.3.1',
    pkgVersion: PLUGIN,
    filePath,
    dirSource,
    isTestsFn: () => true,
    log: () => {},
  });

  const dirTarget = path.join(typeDir, 'VST3', 'surge-synthesizer/surge', '1.3.1');
  expect(dirsCreated).toEqual([dirTarget]);
  expect(fileExists(path.join(dirTarget, 'surge.vst3'))).toEqual(true);
  expect(fileReadJson(path.join(dirTarget, 'index.json'))).toEqual(PLUGIN);

  archiveExtractSpy.mockRestore();
});

test('installArchiveFile throws when the archive contains no files matching a known install format', async () => {
  const typeDir = path.join(APP_DIR, 'unmapped', 'plugins');
  const filePath = path.join(APP_DIR, 'unmapped', 'downloads', 'mystery.zip');
  const dirSource = path.join(APP_DIR, 'unmapped', 'extract-source');
  dirCreate(path.dirname(filePath));
  fileCreate(filePath, 'not a real zip');

  const archiveExtractSpy = vi.spyOn(fileHelpers, 'archiveExtract').mockImplementation(async (_f, dirPath) => {
    dirCreate(dirPath);
    // No recognizable plugin format inside - just an unrelated text file.
    fileCreate(path.join(dirPath, 'readme.txt'), 'nothing to install');
  });

  await expect(
    installArchiveFile({
      typeDir,
      type: RegistryType.Plugins,
      slug: 'test-org/mystery',
      versionNum: '1.0.0',
      pkgVersion: PLUGIN,
      filePath,
      dirSource,
      isTestsFn: () => true,
      log: () => {},
    }),
  ).rejects.toThrow('No compatible files found to install for test-org/mystery');

  archiveExtractSpy.mockRestore();
});

test('installArchiveFile for a Presets/Projects/Apps package moves the extracted directory as-is', async () => {
  const typeDir = path.join(APP_DIR, 'flat', 'presets');
  const filePath = path.join(APP_DIR, 'flat', 'downloads', 'preset.zip');
  const dirSource = path.join(APP_DIR, 'flat', 'extract-source');
  dirCreate(path.dirname(filePath));
  fileCreate(filePath, 'not a real zip');

  const archiveExtractSpy = vi.spyOn(fileHelpers, 'archiveExtract').mockImplementation(async (_f, dirPath) => {
    dirCreate(dirPath);
    fileCreate(path.join(dirPath, 'preset.data'), 'dummy');
  });
  const fileExecSpy = vi.spyOn(fileHelpers, 'fileExec').mockReturnValue(undefined as any);

  const dirsCreated = await installArchiveFile({
    typeDir,
    type: RegistryType.Presets,
    slug: 'jh/floating-rhodes',
    versionNum: '1.0.0',
    pkgVersion: PRESET,
    filePath,
    dirSource,
    isTestsFn: () => true,
    log: () => {},
  });

  const dirTarget = path.join(typeDir, 'jh/floating-rhodes', '1.0.0');
  expect(dirsCreated).toEqual([dirTarget]);
  expect(fileExists(path.join(dirTarget, 'preset.data'))).toEqual(true);
  expect(fileReadJson(path.join(dirTarget, 'index.json'))).toEqual(PRESET);
  // 'preset.data' isn't a likely-executable extension ('', 'elf', 'exe') - no exec call for it.
  expect(fileExecSpy).not.toHaveBeenCalled();

  archiveExtractSpy.mockRestore();
  fileExecSpy.mockRestore();
});

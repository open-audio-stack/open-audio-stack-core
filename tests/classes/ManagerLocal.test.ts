import path from 'path';
import { beforeAll, expect, test, vi } from 'vitest';
import { PLUGIN, PLUGIN_INSTALLED, PLUGIN_PACKAGE, PLUGIN_PACKAGE_INSTALLED } from '../data/Plugin';
import { PRESET, PRESET_INSTALLED, PRESET_PACKAGE } from '../data/Preset';
import {
  PROJECT,
  PROJECT_INSTALLED,
  PROJECT_DEPS,
  PROJECT_PACKAGE,
  PROJECT_NO_DEPS,
  PROJECT_PATH,
} from '../data/Project';
import { CONFIG_LOCAL_TEST } from '../data/Config';
import { ManagerLocal } from '../../src/classes/ManagerLocal';
import { dirDelete, dirEmpty, dirExists, fileReadJson } from '../../src/helpers/file';
import * as fileHelpers from '../../src/helpers/file';
import * as utilsLocalHelpers from '../../src/helpers/utilsLocal';
import { RegistryType } from '../../src/types/Registry';
import { ConfigInterface } from '../../src/types/Config';
import { PackageVersion } from '../../src/types/Package';
import { omitDownloads } from '../testUtils';

const APP_DIR: string = 'test';
// Explicitly test-scoped rather than relying on Config.test.ts/ConfigLocal.test.ts to have
// already persisted these overrides into the shared test/config.json - appDir alone does not
// redirect pluginsDir/presetsDir/projectsDir, which otherwise default to real OS directories
// (see configDefaultsLocal in src/helpers/configLocal.ts) regardless of cross-file test order.
const CONFIG: ConfigInterface = CONFIG_LOCAL_TEST;

beforeAll(() => {
  dirDelete(path.join(APP_DIR, 'archive'));
  // Retain existing downloads to speed-up subsequent test runs.
  // dirDelete(path.join(APP_DIR, 'downloads'));
  dirDelete(path.join(APP_DIR, 'export'));
  dirDelete(path.join(APP_DIR, 'installed'));
  dirDelete(path.join(APP_DIR, 'plugins'));
  dirDelete(path.join(APP_DIR, 'templates'));
});

test('Manager Local scan local directory', () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  manager.scan();
  expect(manager.toJSON()).toEqual({});
});

test('Manager Local export', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await manager.sync();
  manager.export(`test/export/${RegistryType.Plugins}`);
  const pkg = fileReadJson('test/export/plugins/surge-synthesizer/surge/index.json');
  expect(pkg).toEqual(manager.getPackage('surge-synthesizer/surge')?.toJSON());
  const pkgVersion = fileReadJson('test/export/plugins/surge-synthesizer/surge/1.3.1/index.json');
  expect(pkgVersion).toEqual(manager.getPackage('surge-synthesizer/surge')?.getVersion('1.3.1'));
});

test('Plugin sync, install, rescan, uninstall', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await manager.sync();

  const pkgReturned: PackageVersion | void = await manager.install(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);
  const pkgGet = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(omitDownloads(pkgReturned)).toEqual(omitDownloads(PLUGIN_INSTALLED));
  expect(omitDownloads(pkgGet?.getVersion(PLUGIN_PACKAGE.version))).toEqual(omitDownloads(PLUGIN_INSTALLED));

  manager.scan();
  const pkgGet2 = manager.getPackage(PLUGIN_PACKAGE.slug);
  expect(omitDownloads(pkgGet2?.getVersion(PLUGIN_PACKAGE.version))).toEqual(omitDownloads(PLUGIN_INSTALLED));

  const pkgReturned2: PackageVersion | void = await manager.uninstall(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);
  expect(omitDownloads(pkgReturned2)).toEqual(omitDownloads(PLUGIN));
});

test('Preset sync, install, rescan, uninstall', async () => {
  const manager = new ManagerLocal(RegistryType.Presets, CONFIG);
  await manager.sync();

  const pkgReturned: PackageVersion | void = await manager.install(PRESET_PACKAGE.slug, PRESET_PACKAGE.version);
  const pkgGet = manager.getPackage(PRESET_PACKAGE.slug);
  expect(pkgReturned).toEqual(PRESET_INSTALLED);
  expect(pkgGet?.getVersion(PRESET_PACKAGE.version)).toEqual(PRESET_INSTALLED);

  manager.scan();
  const pkgGet2 = manager.getPackage(PRESET_PACKAGE.slug);
  expect(pkgGet2?.getVersion(PRESET_PACKAGE.version)).toEqual(PRESET_INSTALLED);

  const pkgReturned2: PackageVersion | void = await manager.uninstall(PRESET_PACKAGE.slug, PRESET_PACKAGE.version);
  expect(pkgReturned2).toEqual(PRESET);
});

test('Project sync, install, rescan, uninstall', async () => {
  const manager = new ManagerLocal(RegistryType.Projects, CONFIG);
  await manager.sync();

  const pkgReturned: PackageVersion | void = await manager.install(PROJECT_PACKAGE.slug, PROJECT_PACKAGE.version);
  const pkgGet = manager.getPackage(PROJECT_PACKAGE.slug);
  expect(omitDownloads(pkgReturned)).toEqual(omitDownloads(PROJECT_INSTALLED));
  expect(omitDownloads(pkgGet?.getVersion(PROJECT_PACKAGE.version))).toEqual(omitDownloads(PROJECT_INSTALLED));

  manager.scan();
  const pkgGet2 = manager.getPackage(PROJECT_PACKAGE.slug);
  expect(omitDownloads(pkgGet2?.getVersion(PROJECT_PACKAGE.version))).toEqual(omitDownloads(PROJECT_INSTALLED));

  const pkgReturned2: PackageVersion | void = await manager.uninstall(PROJECT_PACKAGE.slug, PROJECT_PACKAGE.version);
  expect(omitDownloads(pkgReturned2)).toEqual(omitDownloads(PROJECT));
});

test('Install archive package does not elevate when unprivileged', async () => {
  // Regression test for https://github.com/open-audio-stack/open-audio-stack-core/issues/83 -
  // a package whose only compatible file is an archive must install without admin elevation,
  // even in a headless environment with no polkit agent.
  const isAdminSpy = vi.spyOn(fileHelpers, 'isAdmin').mockReturnValue(false);
  const isTestsSpy = vi.spyOn(utilsLocalHelpers, 'isTests').mockReturnValue(false);
  const runCliAsAdminSpy = vi.spyOn(fileHelpers, 'runCliAsAdmin').mockResolvedValue(undefined);

  const manager = new ManagerLocal(RegistryType.Projects, CONFIG);
  await manager.sync();
  const pkgReturned: PackageVersion | void = await manager.install(PROJECT_PACKAGE.slug, PROJECT_PACKAGE.version);
  expect(runCliAsAdminSpy).not.toHaveBeenCalled();
  expect(omitDownloads(pkgReturned)).toEqual(omitDownloads(PROJECT_INSTALLED));

  isAdminSpy.mockRestore();
  isTestsSpy.mockRestore();
  runCliAsAdminSpy.mockRestore();

  await manager.uninstall(PROJECT_PACKAGE.slug, PROJECT_PACKAGE.version);
});

test('Install installer-only package still elevates when unprivileged', async () => {
  // Regression guard alongside the above - a package with no compatible archive (only
  // installers) must still elevate, since there is no unprivileged install path available.
  const isAdminSpy = vi.spyOn(fileHelpers, 'isAdmin').mockReturnValue(false);
  const isTestsSpy = vi.spyOn(utilsLocalHelpers, 'isTests').mockReturnValue(false);
  const runCliAsAdminSpy = vi.spyOn(fileHelpers, 'runCliAsAdmin').mockResolvedValue(undefined);

  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await manager.sync();
  await manager.install(PLUGIN_PACKAGE.slug, PLUGIN_PACKAGE.version);
  expect(runCliAsAdminSpy).toHaveBeenCalledTimes(1);

  isAdminSpy.mockRestore();
  isTestsSpy.mockRestore();
  runCliAsAdminSpy.mockRestore();
});

test('Project sync, install project, install dependencies, uninstall dependencies', async () => {
  const manager = new ManagerLocal(RegistryType.Projects, CONFIG);
  await manager.sync();
  await manager.install(PROJECT_PACKAGE.slug, PROJECT_PACKAGE.version);

  const pluginManager = new ManagerLocal(RegistryType.Plugins, CONFIG);

  await manager.installDependencies(PROJECT_PATH);
  await pluginManager.scan();
  expect(omitDownloads(pluginManager.toJSON())).toEqual({
    [PLUGIN_PACKAGE.slug]: omitDownloads(PLUGIN_PACKAGE_INSTALLED),
  });
  await manager.uninstallDependencies(PROJECT_PATH);
  await pluginManager.scan();
  // TODO update when headless installation is working.
  expect(omitDownloads(pluginManager.toJSON())).toEqual({
    [PLUGIN_PACKAGE.slug]: omitDownloads(PLUGIN_PACKAGE_INSTALLED),
  });
});

test('Project sync, install project, add new dependency, remove new dependency', async () => {
  const manager = new ManagerLocal(RegistryType.Projects, CONFIG);
  await manager.sync();
  await manager.install(PROJECT_PACKAGE.slug, PROJECT_PACKAGE.version);
  const pkgDeps = await manager.installDependency(PLUGIN_PACKAGE.slug, '1.3.4', PROJECT_PATH);
  expect(omitDownloads(pkgDeps)).toEqual(omitDownloads(PROJECT_DEPS));

  const pkgNoDeps = await manager.uninstallDependency(PLUGIN_PACKAGE.slug, '1.3.4', PROJECT_PATH);
  expect(omitDownloads(pkgNoDeps)).toEqual(omitDownloads(PROJECT_NO_DEPS));
});

test('Clone package from GitHub template', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  const dirTarget: string = await manager.clone('template-org/template-plugin', 'octocat/Hello-World');
  expect(dirExists(dirTarget)).toEqual(true);
  expect(dirEmpty(dirTarget)).toEqual(false);
});

test('Clone throws when target directory already exists', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await expect(manager.clone('template-org/template-plugin', 'octocat/Hello-World')).rejects.toThrow('already exists');
});

test('Clone throws for invalid package slug', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await expect(manager.clone('Invalid Slug', 'octocat/Hello-World')).rejects.toThrow('Invalid package slug');
});

test('Clone throws for invalid template repo', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await expect(manager.clone('template-org/template-plugin-2', 'not a repo')).rejects.toThrow('Invalid template repo');
});

test('Clone throws for nonexistent template repo', async () => {
  const manager = new ManagerLocal(RegistryType.Plugins, CONFIG);
  await expect(
    manager.clone('template-org/template-plugin-3', 'open-audio-stack/this-repo-does-not-exist-xyz123'),
  ).rejects.toThrow('not found on GitHub');
});

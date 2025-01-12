import { expect, test } from 'vitest';
import { PackageVersions } from '../src/types/Package.js';
import { Registry } from '../src/Registry.js';
import { RegistryInterface, RegistryPackages, RegistryType } from '../src/types/Registry.js';
import { REGISTRY } from './data/Registry.js';
import { PLUGIN, PLUGIN_PACKAGE } from './data/Plugin.js';
import { PRESET, PRESET_PACKAGE } from './data/Preset.js';
import { PROJECT, PROJECT_PACKAGE } from './data/Project.js';
import { registryDefaults } from '../src/helpers/registry.js';

test('Create new Registry', () => {
  const registry: Registry = new Registry(registryDefaults());
  const registry2: Registry = new Registry();
  expect(registry.get()).toEqual(REGISTRY);
  expect(registry2.get()).toEqual(REGISTRY);
});

test('Registry add an empty package', () => {
  const REGISTRY_PACKAGE: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_PACKAGE.plugins = {
    'surge-synthesizer/surge': {
      slug: 'surge-synthesizer/surge',
      version: '',
      versions: {},
    },
  };
  const registry: Registry = new Registry();
  registry.packageAdd(RegistryType.Plugins, 'surge-synthesizer/surge');
  expect(registry.get()).toEqual(REGISTRY_PACKAGE);
});

test('Registry add and remove package', () => {
  const registry: Registry = new Registry();
  registry.packageAdd(RegistryType.Plugins, 'surge-synthesizer/surge');
  registry.packageRemove(RegistryType.Plugins, 'surge-synthesizer/surge');
  expect(registry.get()).toEqual(REGISTRY);
});

test('Registry add a package version', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.plugins = {
    'surge-synthesizer/surge': PLUGIN_PACKAGE,
  };
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PLUGIN);
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove a package', () => {
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PLUGIN);
  registry.packageVersionRemove(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1');
  expect(registry.get()).toEqual(REGISTRY);
});

test('Registry add multiple package versions', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.plugins = {
    'surge-synthesizer/surge': {
      slug: 'surge-synthesizer/surge',
      version: '1.3.2',
      versions: {
        '1.3.1': PLUGIN,
        '1.3.2': PLUGIN,
      },
    },
  };
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.2', PLUGIN);
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PLUGIN);
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove multiple package versions', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.plugins = {
    'surge-synthesizer/surge': PLUGIN_PACKAGE,
  };
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.2', PLUGIN);
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PLUGIN);
  registry.packageVersionRemove(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.2');
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add different package types', () => {
  const REGISTRY_WITH_PACKAGES: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PACKAGES.plugins = {
    'surge-synthesizer/surge': PLUGIN_PACKAGE,
  };
  REGISTRY_WITH_PACKAGES.presets = {
    'jh/floating-rhodes': PRESET_PACKAGE,
  };
  REGISTRY_WITH_PACKAGES.projects = {
    'kmt/banwer': PROJECT_PACKAGE,
  };
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PLUGIN);
  registry.packageVersionAdd(RegistryType.Presets, 'jh/floating-rhodes', '1.0.0', PRESET);
  registry.packageVersionAdd(RegistryType.Projects, 'kmt/banwer', '1.0.1', PROJECT);
  expect(registry.get()).toEqual(REGISTRY_WITH_PACKAGES);
});

test('Get packages', () => {
  const registry: Registry = new Registry();
  expect(registry.packages(RegistryType.Plugins)).toEqual(REGISTRY.plugins);
});

test('Filter packages', () => {
  const REGISTRY_PACKAGES: RegistryPackages = {
    'surge-synthesizer/surge': PLUGIN_PACKAGE,
  };
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PLUGIN);
  expect(registry.packagesFilter(RegistryType.Plugins, 'Surge XT', 'name')).toEqual(REGISTRY_PACKAGES);
});

test('Search packages', () => {
  const REGISTRY_PACKAGES: RegistryPackages = {
    'surge-synthesizer/surge': PLUGIN_PACKAGE,
  };
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PLUGIN);
  expect(registry.packagesSearch(RegistryType.Plugins, 'XT')).toEqual(REGISTRY_PACKAGES);
});

test('Get packages latest', () => {
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PRESET);
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.4.1', PLUGIN);
  expect(registry.packageLatest(RegistryType.Plugins, 'surge-synthesizer/surge')).toEqual(PLUGIN);
  expect(registry.packageLatest(RegistryType.Plugins, 'surge-synthesizer/surge', '1.4.1')).toEqual(PLUGIN);
});

test('Get packages by type', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.plugins = {
    'surge-synthesizer/surge': PLUGIN_PACKAGE,
  };
  const registry: Registry = new Registry();
  registry.packageVersionAdd(RegistryType.Plugins, 'surge-synthesizer/surge', '1.3.1', PLUGIN);
  registry.packageVersionAdd(RegistryType.Presets, 'jh/floating-rhodes', '1.0.0', PRESET);
  registry.packageVersionAdd(RegistryType.Projects, 'kmt/banwer', '1.0.1', PROJECT);
  expect(registry.packages(RegistryType.Plugins)).toEqual(REGISTRY_WITH_PLUGIN.plugins);
});

test('Get registry name', () => {
  const registry: Registry = new Registry();
  expect(registry.name()).toEqual(REGISTRY.name);
});

test('Get registry url', () => {
  const registry: Registry = new Registry();
  expect(registry.url()).toEqual(REGISTRY.url);
});

test('Get registry version', () => {
  const registry: Registry = new Registry();
  expect(registry.version()).toEqual(REGISTRY.version);
});

test('Get package latest version', () => {
  const registry: Registry = new Registry();
  const VERSIONS: PackageVersions = {
    '1.3.1': PLUGIN,
    '10.3.2': PLUGIN,
    '0.3.0': PLUGIN,
  };
  expect(registry.packageVersionLatest(VERSIONS)).toEqual('10.3.2');
});

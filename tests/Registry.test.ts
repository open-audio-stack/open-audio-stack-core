import { expect, test } from 'vitest';
import { PackageVersions } from '../src/types/Package.js';
import { Registry } from '../src/Registry.js';
import { RegistryInterface, RegistryPackages, RegistryType } from '../src/types/Registry.js';
import { REGISTRY } from './data/Registry.js';
import { PLUGIN } from './data/Plugin.js';
import { PRESET } from './data/Preset.js';
import { PROJECT } from './data/Project.js';

test('Create new Registry', () => {
  const registry: Registry = new Registry();
  const registry2: Registry = new Registry(REGISTRY);
  expect(registry.get()).toEqual({});
  expect(registry2.get()).toEqual(REGISTRY);
});

test('Registry add a package', () => {
  const REGISTRY_PACKAGE: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_PACKAGE.plugins = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '',
      versions: {},
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.packageAdd('surge-synth/surge', RegistryType.Plugins);
  expect(registry.get()).toEqual(REGISTRY_PACKAGE);
});

test('Registry add and remove package', () => {
  const registry: Registry = new Registry(REGISTRY);
  registry.packageAdd('surge-synth/surge', RegistryType.Plugins);
  registry.packageRemove('surge-synth/surge', RegistryType.Plugins);
  expect(registry.get()).toEqual(REGISTRY);
});

test('Registry add a package version', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.plugins = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '1.3.1',
      versions: {
        '1.3.1': PLUGIN,
      },
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.1', PLUGIN);
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove a package', () => {
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.1', PLUGIN);
  registry.packageVersionRemove('surge-synth/surge', RegistryType.Plugins, '1.3.1');
  expect(registry.get()).toEqual(REGISTRY);
});

test('Registry add multiple package versions', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.plugins = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '1.3.2',
      versions: {
        '1.3.1': PLUGIN,
        '1.3.2': PLUGIN,
      },
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.2', PLUGIN);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.1', PLUGIN);
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove multiple package versions', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.plugins = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '1.3.1',
      versions: {
        '1.3.1': PLUGIN,
      },
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.2', PLUGIN);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.1', PLUGIN);
  registry.packageVersionRemove('surge-synth/surge', RegistryType.Plugins, '1.3.2');
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add different package types', () => {
  const REGISTRY_WITH_PACKAGES: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PACKAGES.plugins = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '1.3.1',
      versions: {
        '1.3.1': PLUGIN,
      },
    },
    'jh/floating-rhodes': {
      slug: 'jh/floating-rhodes',
      version: '1.0.0',
      versions: {
        '1.0.0': PRESET,
      },
    },
    'kmt/banwer': {
      slug: 'kmt/banwer',
      version: '1.0.1',
      versions: {
        '1.0.1': PROJECT,
      },
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.1', PLUGIN);
  registry.packageVersionAdd('jh/floating-rhodes', RegistryType.Plugins, '1.0.0', PRESET);
  registry.packageVersionAdd('kmt/banwer', RegistryType.Plugins, '1.0.1', PROJECT);
  expect(registry.get()).toEqual(REGISTRY_WITH_PACKAGES);
});

test('Get packages', () => {
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.packages(RegistryType.Plugins)).toEqual(REGISTRY.plugins);
});

test('Get packages filtered', () => {
  const REGISTRY_PACKAGES: RegistryPackages = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '1.3.1',
      versions: {
        '1.3.1': PLUGIN,
      },
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.packagesFilter(RegistryType.Plugins, 'name', 'Surge XT')).toEqual(REGISTRY_PACKAGES);
});

test('Get packages latest', () => {
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.1', PRESET);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.4.1', PLUGIN);
  expect(registry.packageLatest('surge-synth/surge', RegistryType.Plugins)).toEqual(PLUGIN);
  expect(registry.packageLatest('surge-synth/surge', RegistryType.Plugins, '1.4.1')).toEqual(PLUGIN);
});

test('Get packages by type', () => {
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', RegistryType.Plugins, '1.3.1', PLUGIN);
  registry.packageVersionAdd('jh/floating-rhodes', RegistryType.Plugins, '1.0.0', PRESET);
  registry.packageVersionAdd('kmt/banwer', RegistryType.Plugins, '1.0.1', PROJECT);
  expect(registry.packages(RegistryType.Plugins)).toEqual(REGISTRY.plugins);
});

test('Get registry name', () => {
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.name()).toEqual(REGISTRY.name);
});

test('Get registry url', () => {
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.url()).toEqual(REGISTRY.url);
});

test('Get registry version', () => {
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.version()).toEqual(REGISTRY.version);
});

test('Get package latest version', () => {
  const registry: Registry = new Registry(REGISTRY);
  const VERSIONS: PackageVersions = {
    '1.3.1': PLUGIN,
    '10.3.2': PLUGIN,
    '0.3.0': PLUGIN,
  };
  expect(registry.packageVersionLatest(VERSIONS)).toEqual('10.3.2');
});

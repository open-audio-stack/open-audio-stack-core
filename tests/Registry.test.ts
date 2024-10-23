import { expect, test } from 'vitest';
import Registry from '../src/Registry.js';
import { RegistryInterface } from '../src/types/Registry.js';
import { REGISTRY } from './data/Registry.js';
import { PLUGIN } from './data/Plugin.js';
import { PackageVersions } from '../src/types/Package.js';

test('Create new Registry', () => {
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.get()).toEqual(REGISTRY);
});

test('Registry add a package', () => {
  const REGISTRY_PACKAGE: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_PACKAGE.packages = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '',
      versions: {},
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.packageAdd('surge-synth/surge');
  expect(registry.get()).toEqual(REGISTRY_PACKAGE);
});

test('Registry add and remove package', () => {
  const registry: Registry = new Registry(REGISTRY);
  registry.packageAdd('surge-synth/surge');
  registry.packageRemove('surge-synth/surge');
  expect(registry.get()).toEqual(REGISTRY);
});

test('Registry add a package version', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.packages = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '1.3.1',
      versions: {
        '1.3.1': PLUGIN,
      },
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', '1.3.1', PLUGIN);
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove a package', () => {
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', '1.3.1', PLUGIN);
  registry.packageVersionRemove('surge-synth/surge', '1.3.1');
  expect(registry.get()).toEqual(REGISTRY);
});

test('Registry add multiple package versions', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.packages = {
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
  registry.packageVersionAdd('surge-synth/surge', '1.3.2', PLUGIN);
  registry.packageVersionAdd('surge-synth/surge', '1.3.1', PLUGIN);
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove multiple package versions', () => {
  const REGISTRY_WITH_PLUGIN: RegistryInterface = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.packages = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '1.3.1',
      versions: {
        '1.3.1': PLUGIN,
      },
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.packageVersionAdd('surge-synth/surge', '1.3.2', PLUGIN);
  registry.packageVersionAdd('surge-synth/surge', '1.3.1', PLUGIN);
  registry.packageVersionRemove('surge-synth/surge', '1.3.2');
  expect(registry.get()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Get packages', () => {
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.packages()).toEqual(REGISTRY.packages);
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

test('Validate package version', () => {
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.packageVersionValidate(PLUGIN)).toEqual([]);
});

import { expect, test } from 'vitest';
import Registry from '../src/Registry.js';
import { RegistryType } from '../src/types/Registry.js';
import { REGISTRY } from './data/Registry.js';
import { PLUGIN } from './data/Plugin.js';
import { PackageVersions } from '../src/types/Package.js';

test('Create new Registry', () => {
  const registry: Registry = new Registry(REGISTRY);
  expect(registry.getRegistry()).toEqual(REGISTRY);
});

test('Registry add a package', () => {
  const REGISTRY_PACKAGE: RegistryType = structuredClone(REGISTRY);
  REGISTRY_PACKAGE.packages = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '',
      versions: {},
    },
  };
  const registry: Registry = new Registry(REGISTRY);
  registry.addPackage('surge-synth/surge');
  expect(registry.getRegistry()).toEqual(REGISTRY_PACKAGE);
});

test('Registry add and remove package', () => {
  const registry: Registry = new Registry(REGISTRY);
  registry.addPackage('surge-synth/surge');
  registry.removePackage('surge-synth/surge');
  expect(registry.getRegistry()).toEqual(REGISTRY);
});

test('Registry add a package version', () => {
  const REGISTRY_WITH_PLUGIN: RegistryType = structuredClone(REGISTRY);
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
  registry.addPackageVersion('surge-synth/surge', '1.3.1', PLUGIN);
  expect(registry.getRegistry()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove a package', () => {
  const registry: Registry = new Registry(REGISTRY);
  registry.addPackageVersion('surge-synth/surge', '1.3.1', PLUGIN);
  registry.removePackageVersion('surge-synth/surge', '1.3.1');
  expect(registry.getRegistry()).toEqual(REGISTRY);
});

test('Registry add multiple package versions', () => {
  const REGISTRY_WITH_PLUGIN: RegistryType = structuredClone(REGISTRY);
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
  registry.addPackageVersion('surge-synth/surge', '1.3.2', PLUGIN);
  registry.addPackageVersion('surge-synth/surge', '1.3.1', PLUGIN);
  expect(registry.getRegistry()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove multiple package versions', () => {
  const REGISTRY_WITH_PLUGIN: RegistryType = structuredClone(REGISTRY);
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
  registry.addPackageVersion('surge-synth/surge', '1.3.2', PLUGIN);
  registry.addPackageVersion('surge-synth/surge', '1.3.1', PLUGIN);
  registry.removePackageVersion('surge-synth/surge', '1.3.2');
  expect(registry.getRegistry()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Get package latest version', () => {
  const registry: Registry = new Registry(REGISTRY);
  const VERSIONS: PackageVersions = {
    '1.3.1': PLUGIN,
    '10.3.2': PLUGIN,
    '0.3.0': PLUGIN,
  };
  expect(registry.getPackageVersionLatest(VERSIONS)).toEqual('10.3.2');
});

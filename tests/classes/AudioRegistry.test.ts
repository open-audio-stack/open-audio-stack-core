import { expect, test } from 'vitest';
import AudioRegistry from '../../src/classes/AudioRegistry.js';
import { Registry } from '../../src/types/Registry.js';
import { REGISTRY } from '../data/Registry.js';
import { PLUGIN } from '../data/Plugin.js';

test('Create new Registry', () => {
  const registry: AudioRegistry = new AudioRegistry(
    'Open Audio Registry',
    'https://openaudio.github.io/registry',
    '1.0.0',
  );
  expect(registry.getRegistry()).toEqual(REGISTRY);
});

test('Registry add a package', () => {
  const REGISTRY_PACKAGE: Registry = structuredClone(REGISTRY);
  REGISTRY_PACKAGE.packages = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '',
      versions: {},
    },
  };
  const registry: AudioRegistry = new AudioRegistry(
    'Open Audio Registry',
    'https://openaudio.github.io/registry',
    '1.0.0',
  );
  registry.addPackage('surge-synth/surge');
  expect(registry.getRegistry()).toEqual(REGISTRY_PACKAGE);
});

test('Registry add and remove package', () => {
  const registry: AudioRegistry = new AudioRegistry(
    'Open Audio Registry',
    'https://openaudio.github.io/registry',
    '1.0.0',
  );
  registry.addPackage('surge-synth/surge');
  registry.removePackage('surge-synth/surge');
  expect(registry.getRegistry()).toEqual(REGISTRY);
});

test('Registry add a package version', () => {
  const REGISTRY_WITH_PLUGIN: Registry = structuredClone(REGISTRY);
  REGISTRY_WITH_PLUGIN.packages = {
    'surge-synth/surge': {
      slug: 'surge-synth/surge',
      version: '1.3.1',
      versions: {
        '1.3.1': PLUGIN,
      },
    },
  };
  const registry: AudioRegistry = new AudioRegistry(
    'Open Audio Registry',
    'https://openaudio.github.io/registry',
    '1.0.0',
  );
  registry.addPackageVersion('surge-synth/surge', '1.3.1', PLUGIN);
  expect(registry.getRegistry()).toEqual(REGISTRY_WITH_PLUGIN);
});

test('Registry add and remove a package', () => {
  const registry: AudioRegistry = new AudioRegistry(
    'Open Audio Registry',
    'https://openaudio.github.io/registry',
    '1.0.0',
  );
  registry.addPackageVersion('surge-synth/surge', '1.3.1', PLUGIN);
  registry.removePackageVersion('surge-synth/surge', '1.3.1');
  expect(registry.getRegistry()).toEqual(REGISTRY);
});

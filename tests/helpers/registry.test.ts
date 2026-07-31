import { expect, test } from 'vitest';
import { registryDefaults, registryUrl } from '../../src/helpers/registry';
import { RegistryInterface } from '../../src/types/Registry';

const REGISTRY: RegistryInterface = {
  name: 'Open Audio Registry',
  plugins: {},
  presets: {},
  projects: {},
  url: 'https://open-audio-stack.github.io/open-audio-stack-registry',
  version: '1.0.0',
};

test('Get default value', () => {
  expect(registryDefaults()).toEqual(REGISTRY);
});

test('Registry url without a version is unchanged', () => {
  expect(registryUrl({ name: 'Open Audio Registry', url: 'https://example.com/registry' })).toEqual(
    'https://example.com/registry',
  );
});

test('Registry url with a version appends the version segment', () => {
  expect(registryUrl({ name: 'Open Audio Registry', url: 'https://example.com/registry', version: 'v1' })).toEqual(
    'https://example.com/registry/v1',
  );
});

test('Registry url with a version strips a trailing slash from the root first', () => {
  expect(registryUrl({ name: 'Open Audio Registry', url: 'https://example.com/registry/', version: 'v1' })).toEqual(
    'https://example.com/registry/v1',
  );
});

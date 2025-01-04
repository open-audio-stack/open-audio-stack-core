import { expect, test } from 'vitest';
import { Manager } from '../src/Manager.js';
import { PRESET } from './data/Preset.js';
import { RegistryType } from '../src/types/Registry.js';

test('Create new Manager', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.list()).toBeDefined();
});

test('Manager filter packages', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.filter('Floating Rhodes', 'name', RegistryType.Presets)).toEqual({
    'jh/floating-rhodes': {
      slug: 'jh/floating-rhodes',
      version: '1.0.0',
      versions: {
        '1.0.0': PRESET,
      },
    },
  });
});

test('Manager search packages', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.search('Float', RegistryType.Presets)).toEqual({
    'jh/floating-rhodes': {
      slug: 'jh/floating-rhodes',
      version: '1.0.0',
      versions: {
        '1.0.0': PRESET,
      },
    },
  });
});

test('Manager get package by org', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.listOrg('jh', RegistryType.Presets)).toEqual({
    'jh/floating-rhodes': {
      slug: 'jh/floating-rhodes',
      version: '1.0.0',
      versions: {
        '1.0.0': PRESET,
      },
    },
  });
});

test('Manager get package by slug', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.get('jh/floating-rhodes', RegistryType.Presets, '1.0.0')).toEqual(PRESET);
});

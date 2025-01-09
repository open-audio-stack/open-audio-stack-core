import { expect, test } from 'vitest';
import { Manager } from '../src/Manager.js';
import { PRESET, PRESET_PACKAGE } from './data/Preset.js';
import { RegistryType } from '../src/types/Registry.js';

test('Create new Manager', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.list()).toBeDefined();
});

test('Manager list packages', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.list()).toBeDefined();
});

test('Manager list presets', async () => {
  const manager: Manager = new Manager();
  await manager.scan(RegistryType.Presets);
  expect(manager.list(RegistryType.Presets)).toEqual({
    'jh/floating-rhodes': PRESET_PACKAGE,
  });
});

test('Manager filter packages', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.filter('Floating Rhodes', 'name')).toEqual({
    plugins: {},
    presets: {
      'jh/floating-rhodes': PRESET_PACKAGE,
    },
    projects: {},
  });
});

test('Manager filter presets', async () => {
  const manager: Manager = new Manager();
  await manager.scan(RegistryType.Presets);
  expect(manager.filter('Floating Rhodes', 'name', RegistryType.Presets)).toEqual({
    'jh/floating-rhodes': PRESET_PACKAGE,
  });
});

test('Manager search packages', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.search('Float')).toEqual({
    plugins: {},
    presets: {
      'jh/floating-rhodes': PRESET_PACKAGE,
    },
    projects: {},
  });
});

test('Manager search packages', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.search('Float')).toEqual({
    plugins: {},
    presets: {
      'jh/floating-rhodes': PRESET_PACKAGE,
    },
    projects: {},
  });
});

test('Manager search presets', async () => {
  const manager: Manager = new Manager();
  await manager.scan(RegistryType.Presets);
  expect(manager.search('Float', RegistryType.Presets)).toEqual({
    'jh/floating-rhodes': PRESET_PACKAGE,
  });
});

test('Manager get package by org', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.listOrg('jh')).toEqual({
    plugins: {},
    presets: {
      'jh/floating-rhodes': PRESET_PACKAGE,
    },
    projects: {},
  });
});

test('Manager get preset by org', async () => {
  const manager: Manager = new Manager();
  await manager.scan(RegistryType.Presets);
  expect(manager.listOrg('jh', RegistryType.Presets)).toEqual({
    'jh/floating-rhodes': PRESET_PACKAGE,
  });
});

test('Manager get package by slug', async () => {
  const manager: Manager = new Manager();
  await manager.scan();
  expect(manager.get('jh/floating-rhodes')).toEqual({
    plugins: {},
    presets: PRESET,
    projects: {},
  });
  expect(manager.get('jh/floating-rhodes2')).toEqual({
    plugins: {},
    presets: {},
    projects: {},
  });
});

test('Manager get preset by slug', async () => {
  const manager: Manager = new Manager();
  await manager.scan(RegistryType.Presets);
  expect(manager.get('jh/floating-rhodes', RegistryType.Presets)).toEqual(PRESET);
  expect(manager.get('jh/floating-rhodes2', RegistryType.Presets)).toEqual({});
});

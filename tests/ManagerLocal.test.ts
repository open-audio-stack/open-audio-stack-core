import { expect, test } from 'vitest';
import { ManagerLocal } from '../src/ManagerLocal.js';
import { RegistryType } from '../src/types/Registry.js';

test('Create new ManagerLocal', async () => {
  const manager: ManagerLocal = new ManagerLocal({
    appDir: 'test',
  });
  await manager.scanLocal();
  expect(manager.list()).toBeDefined();
});

test('Package install', async () => {
  const manager: ManagerLocal = new ManagerLocal({
    appDir: 'test',
  });
  await manager.scan();
  await manager.packageInstall(RegistryType.Plugins, 'wolf-plugins/wolf-shaper');
  expect(manager.list(RegistryType.Plugins)).toBeDefined();
});

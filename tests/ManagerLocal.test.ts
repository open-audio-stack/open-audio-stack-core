import path from 'path';
import { beforeAll, expect, test } from 'vitest';
import { ManagerLocal } from '../src/ManagerLocal.js';
import { RegistryType } from '../src/types/Registry.js';
import { dirDelete } from '../src/helpers/file.js';

const APP_DIR: string = 'test';

beforeAll(() => {
  dirDelete(path.join(APP_DIR, 'archive'));
  // dirDelete(path.join(APP_DIR, 'downloads'));
  dirDelete(path.join(APP_DIR, 'plugins'));
});

test('Create new ManagerLocal', async () => {
  const manager: ManagerLocal = new ManagerLocal({
    appDir: APP_DIR,
  });
  await manager.scanLocal();
  expect(manager.list()).toBeDefined();
});

test('Package install', async () => {
  const manager: ManagerLocal = new ManagerLocal({
    appDir: APP_DIR,
  });
  await manager.scan();
  await manager.packageInstall(RegistryType.Plugins, 'surge-synthesizer/surge');
  expect(manager.list(RegistryType.Plugins)).toBeDefined();
});

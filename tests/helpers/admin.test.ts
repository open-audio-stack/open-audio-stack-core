import { expect, test } from 'vitest';
import { adminArguments, adminInit } from '../../src/helpers/admin';

test('Admin arguments', async () => {
  expect(adminArguments()).toBeDefined();
});

test('Admin init', async () => {
  expect(adminInit()).toBeDefined();
});

import { expect, test } from 'vitest';
import { configDefaults } from '../../src/helpers/config';
import { CONFIG } from '../data/Config';

test('Get default value', () => {
  expect(configDefaults()).toEqual(CONFIG);
});

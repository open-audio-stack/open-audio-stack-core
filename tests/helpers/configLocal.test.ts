import { expect, test } from 'vitest';
import { configDefaultsLocal } from '../../src/helpers/configLocal';
import { CONFIG_LOCAL } from '../data/Config';

test('Get default value', () => {
  expect(configDefaultsLocal()).toEqual(CONFIG_LOCAL);
});

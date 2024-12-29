import { afterAll, beforeAll, expect, test } from 'vitest';
import { configGet, configReset, configSet } from '../../src/helpers/config';
import { ConfigInterface } from '../../src/types/Config';

const CONFIG_KEY: keyof ConfigInterface = 'version';
const CONFIG_DEFAULT_VALUE: string = '1.0.0';
const CONFIG_NEW_VALUE: string = '1.0.1';

beforeAll(() => {
  configReset();
});

test('Get default value', () => {
  expect(configGet(CONFIG_KEY)).toEqual(CONFIG_DEFAULT_VALUE);
});

test('Set new value', () => {
  expect(configSet(CONFIG_KEY, CONFIG_NEW_VALUE)).toEqual(CONFIG_NEW_VALUE);
});

test('Get new value', () => {
  expect(configGet(CONFIG_KEY)).toEqual(CONFIG_NEW_VALUE);
});

afterAll(() => {
  configSet(CONFIG_KEY, CONFIG_DEFAULT_VALUE);
});

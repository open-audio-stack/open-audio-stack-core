import { expect, test } from 'vitest';
import Config from '../src/Config.js';
import { architectures, ArchitectureId } from '../src/types/Architecture.js';
import { PlatformId, platforms } from '../src/types/Platform.js';
import { SystemId, systems } from '../src/types/System.js';

test('Create new Config', () => {
  const config: Config = new Config({});
  expect(config.getConfig()).toEqual({});
});

test('Get architecture by id', () => {
  const config: Config = new Config({});
  expect(config.getArchitecture(ArchitectureId.Bit32)).toEqual(architectures[2]);
});

test('Get architectures', () => {
  const config: Config = new Config({});
  expect(config.getArchitectures()).toEqual(architectures);
});

test('Get platform by id', () => {
  const config: Config = new Config({});
  expect(config.getPlatform(PlatformId.Linux)).toEqual(platforms[1]);
});

test('Get platforms', () => {
  const config: Config = new Config({});
  expect(config.getPlatforms()).toEqual(platforms);
});

test('Get system by id', () => {
  const config: Config = new Config({});
  expect(config.getSystem(SystemId.LinuxArm32)).toEqual(systems[0]);
});

test('Get systems', () => {
  const config: Config = new Config({});
  expect(config.getSystems()).toEqual(systems);
});

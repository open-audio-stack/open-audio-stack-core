import { expect, test } from 'vitest';
import { getArchitecture, getSystem, isTests } from '../../src/helpers/utilsLocal';

test('Get Architecture', () => {
  if (process.arch === 'arm') {
    expect(getArchitecture()).toEqual('arm32');
  } else if (process.arch === 'arm64') {
    expect(getArchitecture()).toEqual('arm64');
  } else if (process.arch === 'ia32') {
    expect(getArchitecture()).toEqual('x32');
  } else {
    expect(getArchitecture()).toEqual('x64');
  }
});

test('Get System', () => {
  if (process.platform === 'win32') {
    expect(getSystem()).toEqual('win');
  } else if (process.platform === 'darwin') {
    expect(getSystem()).toEqual('mac');
  } else {
    expect(getSystem()).toEqual('linux');
  }
});

test('Is tests', () => {
  expect(isTests()).toEqual(true);
});

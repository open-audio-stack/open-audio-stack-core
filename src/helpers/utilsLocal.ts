import { SystemType } from '../types/SystemType.js';
import { Architecture } from '../types/Architecture.js';

export function getArchitecture() {
  if (process.arch === 'arm') return Architecture.Arm32;
  if (process.arch === 'arm64') return Architecture.Arm64;
  if (process.arch === 'ia32') return Architecture.X32;
  return Architecture.X64;
}

export function getSystem() {
  if (process.platform === 'win32') return SystemType.Windows;
  else if (process.platform === 'darwin') return SystemType.Macintosh;
  return SystemType.Linux;
}

export function isTests() {
  const jest: boolean = process.env.JEST_WORKER_ID !== undefined;
  const vitest: boolean = process.env.VITEST_WORKER_ID !== undefined;
  return jest || vitest;
}

import { execFile } from 'child_process';
import { SystemType } from '../types/SystemType.js';
import { Architecture } from '../types/Architecture.js';

export function getArchitecture() {
  if (process.arch === 'arm') return Architecture.Arm32;
  if (process.arch === 'arm64') return Architecture.Arm64;
  if (process.arch === 'ia32') return Architecture.X32;
  return Architecture.X64;
}

export function getSystem() {
  if (process.platform === 'win32') return SystemType.Win;
  else if (process.platform === 'darwin') return SystemType.Mac;
  return SystemType.Linux;
}

export function isTests() {
  const jest: boolean = process.env.JEST_WORKER_ID !== undefined;
  const vitest: boolean = process.env.VITEST_WORKER_ID !== undefined;
  return jest || vitest;
}

// Only ever called with literal values today ('dpkg'/'rpm' in ManagerLocal.install()'s Linux
// branch), but uses execFile (no shell) rather than exec with a shell string on principle -
// every other command execution in this codebase avoids building shell strings from values that
// could someday trace back to registry/package metadata, and this should be no exception for
// whoever calls it next.
export function commandExists(cmd: string): Promise<boolean> {
  return new Promise(resolve => {
    execFile('which', [cmd], (error, stdout) => {
      resolve(Boolean(stdout.trim()) && !error);
    });
  });
}

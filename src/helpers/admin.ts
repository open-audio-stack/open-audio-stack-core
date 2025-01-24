// Run when Electron needs elevated privileges
// npm run build && node ./build/helpers/admin.js --operation install --type plugins --id surge-synthesizer/surge
// npm run build && node ./build/helpers/admin.js --operation uninstall --type plugins --id surge-synthesizer/surge

import path from 'path';
import { RegistryType } from '../types/Registry.js';
import { ManagerLocal } from '../classes/ManagerLocal.js';
import { dirApp } from './file.js';

const appDir: string = path.join(dirApp(), 'open-audio-stack');

export interface Arguments {
  operation: string;
  type: RegistryType;
  id: string;
  ver: string;
}

export function adminArguments(): Arguments {
  return {
    operation: process.argv[3],
    type: process.argv[5] as RegistryType,
    id: process.argv[7],
    ver: process.argv[9],
  };
}

export async function adminInit() {
  const argv: Arguments = adminArguments();
  const manager = new ManagerLocal(argv.type, { appDir });
  manager.sync();
  if (argv.operation === 'install') {
    await manager.install(argv.id, argv.ver);
  } else if (argv.operation === 'uninstall') {
    await manager.uninstall(argv.id, argv.ver);
  } else {
    console.log('Missing --operation argument');
  }
}

adminInit();

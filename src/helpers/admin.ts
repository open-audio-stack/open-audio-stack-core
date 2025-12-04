// Run when Electron needs elevated privileges
// npm run build && node ./build/helpers/admin.js --operation install --type plugins --id surge-synthesizer/surge
// npm run build && node ./build/helpers/admin.js --operation uninstall --type plugins --id surge-synthesizer/surge

import { RegistryType } from '../types/Registry.js';
import { ManagerLocal } from '../classes/ManagerLocal.js';
import { dirApp } from './file.js';

export interface Arguments {
  appDir: string;
  operation: string;
  type: RegistryType;
  id: string;
  version?: string;
  log?: boolean;
}

export function adminArguments(): Arguments {
  const args: Arguments = {
    appDir: dirApp(),
    operation: 'install',
    type: RegistryType.Plugins,
    id: 'surge-synthesizer/surge',
  };
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--appDir') {
      args.appDir = process.argv[i + 1];
    } else if (arg === '--operation') {
      args.operation = process.argv[i + 1];
    } else if (arg === '--type') {
      args.type = process.argv[i + 1] as RegistryType;
    } else if (arg === '--id') {
      args.id = process.argv[i + 1];
    } else if (arg === '--ver') {
      args.version = process.argv[i + 1];
    } else if (arg === '--log') {
      args.log = true;
    }
  }
  return args;
}

export async function adminInit() {
  const args: Arguments = adminArguments();
  const manager = new ManagerLocal(args.type, { appDir: args.appDir });
  if (args.log) manager.logEnable();
  manager.log('adminInit', args);
  await manager.sync();
  manager.scan();
  try {
    if (args.operation === 'install') {
      await manager.install(args.id, args.version);
    } else if (args.operation === 'uninstall') {
      await manager.uninstall(args.id, args.version);
    } else if (args.operation === 'installAll') {
      await manager.installAll();
    }
    const result = { status: 'ok', code: 0 };
    process.stdout.write('\n');
    console.log(JSON.stringify(result));
    process.exit(0);
  } catch (err: any) {
    const message = err && err.message ? err.message : String(err);
    const errorResult = { status: 'error', code: err && err.code ? err.code : 1, message };
    process.stdout.write('\n');
    console.log(JSON.stringify(errorResult));
    process.exit(typeof errorResult.code === 'number' ? errorResult.code : 1);
  }
}

adminInit();

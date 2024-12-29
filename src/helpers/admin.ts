// Run when Electron needs elevated privileges
// npm run build && node ./build/helpers/admin.js --operation install --slug surge-synthesizer/surge
// npm run build && node ./build/helpers/admin.js --operation uninstall --slug surge-synthesizer/surge

// import { packageInstall, packageUninstall } from './package.js';

export interface Arguments {
  operation: string;
  slug: string;
  ver: string;
}

export function getArguments(): Arguments {
  return {
    operation: process.argv[3],
    slug: process.argv[5],
    ver: process.argv[7],
  };
}

export async function init() {
  const argv: Arguments = getArguments();
  // if (argv.operation === 'install') {
  //   await packageInstall(argv.slug, argv.ver);
  // } else if (argv.operation === 'uninstall') {
  //   await packageUninstall(argv.slug, argv.ver);
  // }
}

init();

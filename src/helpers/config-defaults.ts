import { ConfigInterface } from '../types/Config.js';

export function configDefaults(): ConfigInterface {
  return {
    registries: [
      {
        name: 'Open Audio Registry',
        url: 'https://open-audio-stack.github.io/open-audio-stack-registry',
      },
    ],
    version: '1.0.0',
  };
}

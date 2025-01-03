import { RegistryInterface } from '../types/Registry.js';

export function registryDefaults(): RegistryInterface {
  return {
    name: 'Open Audio Registry',
    plugins: {},
    presets: {},
    projects: {},
    url: 'https://open-audio-stack.github.io/open-audio-stack-registry',
    version: '1.0.0',
  };
}

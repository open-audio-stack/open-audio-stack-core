import { ConfigRegistry } from '../types/Config.js';
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

// See specification.md "Registry versioning (optional)" - appends the version segment to the
// registry root when one is configured. Unversioned registries (the common case) are untouched,
// resolving to whatever the registry serves as its latest version.
export function registryUrl(registry: ConfigRegistry): string {
  return registry.version ? `${registry.url.replace(/\/$/, '')}/${registry.version}` : registry.url;
}

export interface ConfigInterface {
  appDir?: string;
  pluginDir?: string;
  presetDir?: string;
  projectDir?: string;
  registries?: ConfigRegistry[];
  version: string;
}

export interface ConfigRegistry {
  name: string;
  url: string;
}

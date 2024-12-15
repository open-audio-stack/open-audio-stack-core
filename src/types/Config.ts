export interface ConfigInterface {
  pluginDir?: string;
  presetDir?: string;
  projectDir?: string;
  registries?: ConfigRegistry[];
}

export interface ConfigRegistry {
  name: string;
  url: string;
}

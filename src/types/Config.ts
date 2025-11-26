export interface ConfigInterface {
  appDir?: string;
  appsDir?: string;
  pluginsDir?: string;
  presetsDir?: string;
  projectsDir?: string;
  registries?: ConfigRegistry[];
  version?: string;
}

export interface ConfigRegistry {
  name: string;
  url: string;
}

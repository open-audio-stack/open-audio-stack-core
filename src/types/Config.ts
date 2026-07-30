export interface ConfigInterface {
  appDir?: string;
  appsDir?: string;
  pluginsDir?: string;
  presetsDir?: string;
  projectsDir?: string;
  templatesDir?: string;
  registries?: ConfigRegistry[];
  version?: string;
}

export interface ConfigRegistry {
  name: string;
  url: string;
}

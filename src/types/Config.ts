import { Architecture } from './Architecture.js';
import { SystemType } from './SystemType.js';

export interface ConfigInterface {
  appDir?: string;
  appsDir?: string;
  // Desired Platform override (see specification.md "Platform and Architecture Detection") -
  // takes precedence over the runtime's auto-detected architecture/system when set. Needed
  // because the runtime platform a manager is compiled/running as doesn't always match the
  // platform its target DAW is actually running as (e.g. a native ARM64 manager next to a DAW
  // running under x64 emulation on Windows 11 ARM).
  architecture?: Architecture;
  system?: SystemType;
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

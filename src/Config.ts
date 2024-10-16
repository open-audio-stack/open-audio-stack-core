import { architectures, ArchitectureId } from './types/Architecture.js';
import { ConfigType } from './types/Config.js';
import { PlatformId, platforms } from './types/Platform.js';
import { SystemId, systems } from './types/System.js';

export default class Config {
  config: ConfigType;

  constructor(config: ConfigType) {
    this.config = config;
  }

  getArchitecture(id: ArchitectureId) {
    return architectures.filter(architecture => id === architecture.id)[0];
  }

  getArchitectures() {
    return architectures;
  }

  getConfig() {
    return this.config;
  }

  getPlatform(id: PlatformId) {
    return platforms.filter(platform => id === platform.id)[0];
  }

  getPlatforms() {
    return platforms;
  }

  getSystem(id: SystemId) {
    return systems.filter(system => id === system.id)[0];
  }

  getSystems() {
    return systems;
  }
}

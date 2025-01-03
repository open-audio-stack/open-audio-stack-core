import { architectures, Architecture } from './types/Architecture.js';
import { configDefaults } from './helpers/config.js';
import { ConfigInterface } from './types/Config.js';
import { FileFormat, fileFormats } from './types/FileFormat.js';
import { FileType, fileTypes } from './types/FileType.js';
import { License, licenses } from './types/License.js';
import { PluginFormat, pluginFormats } from './types/PluginFormat.js';
import { PluginType, pluginTypes } from './types/PluginType.js';
import { PresetFormat, presetFormats } from './types/PresetFormat.js';
import { PresetType, presetTypes } from './types/PresetType.js';
import { ProjectFormat, projectFormats } from './types/ProjectFormat.js';
import { ProjectType, projectTypes } from './types/ProjectType.js';
import { SystemType, systemTypes } from './types/SystemType.js';

export class Config {
  config: ConfigInterface;

  constructor(config?: ConfigInterface) {
    this.config = { ...configDefaults(), ...config };
  }

  get(key: keyof ConfigInterface) {
    return this.config[key];
  }

  getAll() {
    return this.config;
  }

  set(key: keyof ConfigInterface, val: any) {
    this.config[key] = val;
  }

  // Architectures.

  architecture(type: Architecture) {
    return architectures.filter(architecture => type === architecture.value)[0];
  }

  architectures() {
    return architectures;
  }

  // File formats and types.

  fileFormat(format: FileFormat) {
    return fileFormats.filter(fileFormat => format === fileFormat.value)[0];
  }

  fileFormats() {
    return fileFormats;
  }

  fileType(type: FileType) {
    return fileTypes.filter(fileType => type === fileType.value)[0];
  }

  fileTypes() {
    return fileTypes;
  }

  // Licenses

  license(type: License) {
    return licenses.filter(license => type === license.value)[0];
  }

  licenses() {
    return licenses;
  }

  // Plugin formats and types.

  pluginFormat(format: PluginFormat) {
    return pluginFormats.filter(pluginFormat => format === pluginFormat.value)[0];
  }

  pluginFormats() {
    return pluginFormats;
  }

  pluginType(type: PluginType) {
    return pluginTypes.filter(pluginType => type === pluginType.value)[0];
  }

  pluginTypes() {
    return pluginTypes;
  }

  // Preset formats and types.

  presetFormat(format: PresetFormat) {
    return presetFormats.filter(presetFormat => format === presetFormat.value)[0];
  }

  presetFormats() {
    return presetFormats;
  }

  presetType(type: PresetType) {
    return presetTypes.filter(presetType => type === presetType.value)[0];
  }

  presetTypes() {
    return presetTypes;
  }

  // Project formats and types.

  projectFormat(format: ProjectFormat) {
    return projectFormats.filter(projectFormat => format === projectFormat.value)[0];
  }

  projectFormats() {
    return projectFormats;
  }

  projectType(type: ProjectType) {
    return projectTypes.filter(projectType => type === projectType.value)[0];
  }

  projectTypes() {
    return projectTypes;
  }

  // Systems.

  system(type: SystemType) {
    return systemTypes.filter(system => type === system.value)[0];
  }

  systems() {
    return systemTypes;
  }
}

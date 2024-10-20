import { architectures, Architecture } from './types/Architecture.js';
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

export default class Config {
  config: ConfigInterface;

  constructor(config: ConfigInterface) {
    this.config = config;
  }

  getConfig() {
    return this.config;
  }

  // Architectures.

  getArchitecture(type: Architecture) {
    return architectures.filter(architecture => type === architecture.value)[0];
  }

  getArchitectures() {
    return architectures;
  }

  // File formats and types.

  getFileFormat(format: FileFormat) {
    return fileFormats.filter(fileFormat => format === fileFormat.value)[0];
  }

  getFileFormats() {
    return fileFormats;
  }

  getFileType(type: FileType) {
    return fileTypes.filter(fileType => type === fileType.value)[0];
  }

  getFileTypes() {
    return fileTypes;
  }

  // Licenses

  getLicense(type: License) {
    return licenses.filter(license => type === license.value)[0];
  }

  getLicenses() {
    return licenses;
  }

  // Plugin formats and types.

  getPluginFormat(format: PluginFormat) {
    return pluginFormats.filter(pluginFormat => format === pluginFormat.value)[0];
  }

  getPluginFormats() {
    return pluginFormats;
  }

  getPluginType(type: PluginType) {
    return pluginTypes.filter(pluginType => type === pluginType.value)[0];
  }

  getPluginTypes() {
    return pluginTypes;
  }

  // Preset formats and types.

  getPresetFormat(format: PresetFormat) {
    return presetFormats.filter(presetFormat => format === presetFormat.value)[0];
  }

  getPresetFormats() {
    return presetFormats;
  }

  getPresetType(type: PresetType) {
    return presetTypes.filter(presetType => type === presetType.value)[0];
  }

  getPresetTypes() {
    return presetTypes;
  }

  // Project formats and types.

  getProjectFormat(format: ProjectFormat) {
    return projectFormats.filter(projectFormat => format === projectFormat.value)[0];
  }

  getProjectFormats() {
    return projectFormats;
  }

  getProjectType(type: ProjectType) {
    return projectTypes.filter(projectType => type === projectType.value)[0];
  }

  getProjectTypes() {
    return projectTypes;
  }

  // Systems.

  getSystem(type: SystemType) {
    return systemTypes.filter(system => type === system.value)[0];
  }

  getSystems() {
    return systemTypes;
  }
}

import { FileInterface } from './File.js';
import { PackageBase } from './Package.js';
import { PluginFormat } from './PluginFormat.js';
import { PluginType } from './PluginType.js';

export interface PluginInterface extends PackageBase {
  files: PluginFile[];
  type: PluginType;
}

export interface PluginFile extends FileInterface {
  contains: PluginFormat[];
}

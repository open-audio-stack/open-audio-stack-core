import { FileInterface } from './File.js';
import { PackageBase } from './Package.js';
import { ProjectFormat } from './ProjectFormat.js';
import { ProjectType } from './ProjectType.js';
import { RegistryType } from './Registry.js';

export interface ProjectInterface extends PackageBase {
  files: ProjectFile[];
  [RegistryType.Plugins]: ProjectPlugins;
  type: ProjectType;
}

export interface ProjectFile extends FileInterface {
  contains: ProjectFormat[];
}

export interface ProjectFileMap {
  [key: string]: ProjectFile[];
}

export interface ProjectPlugins {
  [slug: string]: string;
}

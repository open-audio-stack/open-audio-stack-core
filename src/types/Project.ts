import { FileInterface } from './File.js';
import { PackageVersion } from './Package.js';
import { ProjectFormat } from './ProjectFormat.js';
import { ProjectType } from './ProjectType.js';

export interface ProjectInterface extends PackageVersion {
  files: ProjectFile[];
  plugins: ProjectPlugins;
  type: ProjectType;
}

export interface ProjectFile extends FileInterface {
  contains: ProjectFormat[];
}

export interface ProjectPlugins {
  [slug: string]: string;
}

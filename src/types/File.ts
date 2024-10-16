import { SystemId } from './System.js';

export interface FileType {
  format: FileFormat;
  hash: string;
  systems: Array<SystemId>;
  size: number;
  type: FileId;
  url: string;
}

export enum FileFormat {
  DebianPackage = 'deb',
  AppleDiskImage = 'dmg',
  ExecutableInstaller = 'exe',
  Tarball = 'tar.gz',
  TarballLegacy = 'tgz',
  WindowsInstaller = 'msi',
  Zip = 'zip',
}

export enum FileId {
  Archive = 'archive',
  Installer = 'installer',
}

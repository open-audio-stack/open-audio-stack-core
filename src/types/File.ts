import { System } from './Config.js';

export interface File {
  format: FileFormat;
  hash: string;
  systems: Array<System>;
  size: number;
  type: FileType;
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

export enum FileType {
  Archive = 'archive',
  Installer = 'installer',
}

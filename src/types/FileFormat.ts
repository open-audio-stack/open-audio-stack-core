export enum FileFormat {
  AppleDiskImage = 'dmg',
  DebianPackage = 'deb',
  ExecutableInstaller = 'exe',
  Tarball = 'tar.gz',
  TarballLegacy = 'tgz',
  WindowsInstaller = 'msi',
  Zip = 'zip',
}

export interface FileFormatOption {
  description: string;
  value: FileFormat;
  name: string;
}

export const fileFormats: FileFormatOption[] = [
  {
    description: 'Disk image format used on macOS.',
    value: FileFormat.AppleDiskImage,
    name: 'Apple Disk Image',
  },
  {
    description: 'Package for Debian-based Linux such as Ubuntu.',
    value: FileFormat.DebianPackage,
    name: 'Debian package',
  },
  {
    description: 'Executable file format used by Windows.',
    value: FileFormat.ExecutableInstaller,
    name: 'Executable Installer',
  },
  {
    description: 'Compressed archive format common on Linux and Unix systems.',
    value: FileFormat.Tarball,
    name: 'Tarball (.tar.gz)',
  },
  {
    description: 'Legacy compressed archive format similar to .tar.gz.',
    value: FileFormat.TarballLegacy,
    name: 'Tarball Legacy (.tgz)',
  },
  {
    description: 'Installer format for Windows.',
    value: FileFormat.WindowsInstaller,
    name: 'Windows Installer (.msi)',
  },
  {
    description: 'Widely-used compressed file format compatible with many operating systems.',
    value: FileFormat.Zip,
    name: 'Zip Archive (.zip)',
  },
];

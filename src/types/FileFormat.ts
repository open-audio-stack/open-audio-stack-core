export enum FileFormat {
  AppImage = 'appimage',
  AppleDiskImage = 'dmg',
  DebianPackage = 'deb',
  ExecutableInstaller = 'exe',
  RedHatPackage = 'rpm',
  Tarball = 'tar.gz',
  TarballLegacy = 'tgz',
  WindowsInstaller = 'msi',
  Zip = 'zip',
  Zip7 = '7z',
}

export interface FileFormatOption {
  description: string;
  value: FileFormat;
  name: string;
}

export const fileFormats: FileFormatOption[] = [
  {
    description: 'App package for Linux systems.',
    value: FileFormat.AppImage,
    name: 'AppImage',
  },
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
    name: 'Executable installer',
  },
  {
    description: 'Originally developed for Red Hat, but is now used in many other Linux distributions.',
    value: FileFormat.RedHatPackage,
    name: 'Red Hat package',
  },
  {
    description: 'Compressed archive format common on Linux and Unix systems.',
    value: FileFormat.Tarball,
    name: 'Tarball',
  },
  {
    description: 'Legacy compressed archive format similar to .tar.gz.',
    value: FileFormat.TarballLegacy,
    name: 'Tarball (alt)',
  },
  {
    description: 'Installer format for Windows.',
    value: FileFormat.WindowsInstaller,
    name: 'Windows installer',
  },
  {
    description: 'Widely-used compressed file format compatible with many operating systems.',
    value: FileFormat.Zip,
    name: 'Zip',
  },
  {
    description: 'Archive file format which compresses files and folders into a single file.',
    value: FileFormat.Zip7,
    name: '7-Zip',
  },
];

export enum FileType {
  Archive = 'archive',
  Installer = 'installer',
}

export interface FileTypeOption {
  description: string;
  value: FileType;
  name: string;
}

export const fileTypes: FileTypeOption[] = [
  {
    description: 'Compressed file format containing multiple files.',
    value: FileType.Archive,
    name: 'Archive',
  },
  {
    description: 'Installer extracts and copies files into the correct locations.',
    value: FileType.Installer,
    name: 'Installer',
  },
];

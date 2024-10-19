import { FileFormat } from './FileFormat.js';
import { FileType } from './FileType.js';
import { System } from './System.js';

export interface FileInterface {
  format: FileFormat;
  hash: string;
  systems: System[];
  size: number;
  type: FileType;
  url: string;
}

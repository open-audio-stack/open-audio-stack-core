import { Architecture } from './Architecture.js';
import { FileType } from './FileType.js';
import { System } from './System.js';

export interface FileInterface {
  architectures: Architecture[];
  sha256: string;
  size: number;
  systems: System[];
  type: FileType;
  url: string;
}

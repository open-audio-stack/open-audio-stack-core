import { FileType } from './File.js';
import { PackageVersion } from './Package.js';

export interface ProjectType extends PackageVersion {
  files: Array<ProjectFile>;
  plugins: ProjectPlugins;
  type: ProjectId;
}

export interface ProjectFile extends FileType {
  formats: Array<ProjectFormat>;
}

export enum ProjectFormat {
  AbletonLive = 'als',
  Bitwig = 'bwproject',
  Cubase = 'cpr',
  DAWproject = 'dawproject',
  FLStudio = 'flp',
  Logic = 'logic',
  ProTools = 'ptx',
  Reaper = 'rpp',
  Sonar = 'cwp',
}

export interface ProjectPlugins {
  [slug: string]: string;
}

export enum ProjectId {
  Audiobook = 'audiobook',
  DJSet = 'dj',
  Performance = 'performance',
  Podcast = 'podcast',
  Remix = 'remix',
  Song = 'song',
  Score = 'score',
}

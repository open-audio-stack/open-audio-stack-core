import { File } from './File.js';
import { PackageVersion } from './Package.js';

export interface Project extends PackageVersion {
  files: Array<ProjectFile>;
  plugins: ProjectPlugins;
  type: ProjectType;
}

export interface ProjectFile extends File {
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

export enum ProjectType {
  Audiobook = 'audiobook',
  DJSet = 'dj',
  Performance = 'performance',
  Podcast = 'podcast',
  Remix = 'remix',
  Song = 'song',
  Score = 'score',
}

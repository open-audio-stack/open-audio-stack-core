export enum ProjectFormat {
  AbletonLive = 'als',
  Bitwig = 'bwproject',
  Cubase = 'cpr',
  DAWproject = 'dawproject',
  FLStudio = 'flp',
  Garageband = 'band',
  Lmms = 'lmms',
  Logic = 'logic',
  Musescore = 'mscz',
  ProTools = 'ptx',
  Reaper = 'rpp',
  Sonar = 'cwp',
}

export type ProjectFormatDir = {
  [format in ProjectFormat]: string;
};

export const projectFormatDir: ProjectFormatDir = {
  [ProjectFormat.AbletonLive]: 'Ableton',
  [ProjectFormat.Bitwig]: 'Bitwig',
  [ProjectFormat.Cubase]: 'Cubase',
  [ProjectFormat.DAWproject]: 'DAWproject',
  [ProjectFormat.FLStudio]: 'FLStudio',
  [ProjectFormat.Garageband]: 'Garageband',
  [ProjectFormat.Lmms]: 'Lmms',
  [ProjectFormat.Logic]: 'Logic',
  [ProjectFormat.Musescore]: 'Musescore',
  [ProjectFormat.ProTools]: 'ProTools',
  [ProjectFormat.Reaper]: 'Reaper',
  [ProjectFormat.Sonar]: 'Sonar',
};

export interface ProjectFormatOption {
  description: string;
  value: ProjectFormat;
  name: string;
}

export const projectFormats: ProjectFormatOption[] = [
  {
    description: 'Used to store all information about a Live set.',
    value: ProjectFormat.AbletonLive,
    name: 'Ableton Live',
  },
  {
    description: 'Containing all Bitwig project-related information.',
    value: ProjectFormat.Bitwig,
    name: 'Bitwig',
  },
  {
    description: 'Used to save Steinberg Cubase arrangements and settings.',
    value: ProjectFormat.Cubase,
    name: 'Cubase',
  },
  {
    description: 'Open standard for storing various audio project settings.',
    value: ProjectFormat.DAWproject,
    name: 'DAWproject',
  },
  {
    description: 'Used for saving FL Studio compositions and arrangements.',
    value: ProjectFormat.FLStudio,
    name: 'FL Studio',
  },
  {
    description: 'A package containing audio files and Garageband timeline and settings.',
    value: ProjectFormat.Garageband,
    name: 'Garageband',
  },
  {
    description: 'Music project for open-source, cross-platform software.',
    value: ProjectFormat.Lmms,
    name: 'LMMS',
  },
  {
    description: "Containing all Apple's Logic Pro audio, MIDI, and arrangement data.",
    value: ProjectFormat.Logic,
    name: 'Logic Pro',
  },
  {
    description: 'Compressed Musescore project along with metadata and image preview.',
    value: ProjectFormat.Musescore,
    name: 'Musescore',
  },
  {
    description: 'Used for Avid Pro Tools audio recording and production.',
    value: ProjectFormat.ProTools,
    name: 'Pro Tools',
  },
  {
    description: 'Containing Reaper tracks, arrangements, and settings.',
    value: ProjectFormat.Reaper,
    name: 'Reaper',
  },
  {
    description: 'Used for Cakewalk Sonar music production and audio editing.',
    value: ProjectFormat.Sonar,
    name: 'Sonar',
  },
];

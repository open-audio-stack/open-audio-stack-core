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

export interface ProjectFormatOption {
  description: string;
  value: ProjectFormat;
  name: string;
}

export const projectFormats: ProjectFormatOption[] = [
  {
    description: 'Used to store all information about a Live set.',
    value: ProjectFormat.AbletonLive,
    name: 'Ableton Live Set',
  },
  {
    description: 'Containing all Bitwig project-related information.',
    value: ProjectFormat.Bitwig,
    name: 'Bitwig Project',
  },
  {
    description: 'Used to save Steinberg Cubase arrangements and settings.',
    value: ProjectFormat.Cubase,
    name: 'Cubase Project',
  },
  {
    description: 'Open standard for storing various audio project settings.',
    value: ProjectFormat.DAWproject,
    name: 'Generic DAW Project',
  },
  {
    description: 'Used for saving FL Studio compositions and arrangements.',
    value: ProjectFormat.FLStudio,
    name: 'FL Studio Project',
  },
  {
    description: "Containing all Apple's Logic Pro audio, MIDI, and arrangement data.",
    value: ProjectFormat.Logic,
    name: 'Logic Pro Project',
  },
  {
    description: 'Used for Avid Pro Tools audio recording and production.',
    value: ProjectFormat.ProTools,
    name: 'Pro Tools Project',
  },
  {
    description: 'Containing Reaper tracks, arrangements, and settings.',
    value: ProjectFormat.Reaper,
    name: 'Reaper Project',
  },
  {
    description: 'Used for Cakewalk Sonar music production and audio editing.',
    value: ProjectFormat.Sonar,
    name: 'Sonar Project',
  },
];

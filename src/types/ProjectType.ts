export enum ProjectType {
  Audiobook = 'audiobook',
  DJSet = 'dj',
  Performance = 'performance',
  Podcast = 'podcast',
  Remix = 'remix',
  Song = 'song',
  Score = 'score',
}

export interface ProjectTypeOption {
  description: string;
  value: ProjectType;
  name: string;
}

export const projectTypes: ProjectTypeOption[] = [
  {
    description: 'Spoken audio for books or literature.',
    value: ProjectType.Audiobook,
    name: 'Audiobook',
  },
  {
    description: 'Live DJ performances, often including mixes of various tracks.',
    value: ProjectType.DJSet,
    name: 'DJ Set',
  },
  {
    description: 'Solo or ensemble musical performance, showcasing artistic expression.',
    value: ProjectType.Performance,
    name: 'Performance',
  },
  {
    description: 'Discussions, interviews, or other content for audio broadcast.',
    value: ProjectType.Podcast,
    name: 'Podcast',
  },
  {
    description: 'Reworking or improving an existing song or track to create a new version.',
    value: ProjectType.Remix,
    name: 'Remix',
  },
  {
    description: 'Composing, recording, and producing original songs with multiple instruments and vocals.',
    value: ProjectType.Song,
    name: 'Song',
  },
  {
    description: 'Composing and producing music for film, TV, video games, or other visual media.',
    value: ProjectType.Score,
    name: 'Score',
  },
];

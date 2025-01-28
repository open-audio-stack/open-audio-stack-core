export enum PluginCategoryEffect {
  Chorus = 'chorus',
  Compression = 'compression',
  Eq = 'eq',
  Filter = 'filter',
  Reverb = 'reverb',
}

export enum PluginCategoryInstrument {
  Drums = 'drums',
  Guitar = 'guitar',
  Keys = 'keys',
  Orchestral = 'orchestral',
  Samplers = 'samplers',
  Synths = 'synths',
  Vocals = 'vocals',
}

export interface PluginCategoryOption {
  description: string;
  value: PluginCategoryEffect | PluginCategoryInstrument;
  name: string;
  tags: string[];
}

export const pluginCategoryEffects: PluginCategoryOption[] = [
  {
    description: 'Spatial movement and modulation.',
    value: PluginCategoryEffect.Chorus,
    name: 'Chorus/Phaser',
    tags: ['Chorus', 'Phaser'],
  },
  {
    description: 'Shape dynamics, grit and amplification.',
    value: PluginCategoryEffect.Compression,
    name: 'Compression/Distortion',
    tags: ['Compression', 'Distortion', 'Amplifier', 'Amp'],
  },
  {
    description: 'Balance frequencies and position sounds in the stereo field.',
    value: PluginCategoryEffect.Eq,
    name: 'EQ/Pan',
    tags: ['EQ', 'Equalizer', 'Pan'],
  },
  {
    description: 'Adjust tone and sculpt frequencies.',
    value: PluginCategoryEffect.Filter,
    name: 'Filter',
    tags: ['Filter'],
  },
  {
    description: 'Create depth with echoes, ambience, and space.',
    value: PluginCategoryEffect.Reverb,
    name: 'Reverb/Delay',
    tags: ['Reverb', 'Delay'],
  },
];

export const pluginCategoryInstruments: PluginCategoryOption[] = [
  {
    description: '',
    value: PluginCategoryInstrument.Drums,
    name: 'Drums',
    tags: ['Drums', 'Percussion'],
  },
  {
    description: '',
    value: PluginCategoryInstrument.Guitar,
    name: 'Guitar',
    tags: ['Guitar', 'String'],
  },
  {
    description: '',
    value: PluginCategoryInstrument.Keys,
    name: 'Keys',
    tags: ['Keys', 'Piano'],
  },
  {
    description: '',
    value: PluginCategoryInstrument.Orchestral,
    name: 'Orchestral',
    tags: ['Orchestral', 'Orchestra', 'Strings', 'Woodwind', 'Brass'],
  },
  {
    description: '',
    value: PluginCategoryInstrument.Samplers,
    name: 'Samplers',
    tags: ['Samplers', 'Sampler', 'Sample'],
  },
  {
    description: '',
    value: PluginCategoryInstrument.Synths,
    name: 'Synths',
    tags: ['Synths', 'Synth', 'Synthesizer'],
  },
  {
    description: '',
    value: PluginCategoryInstrument.Vocals,
    name: 'Vocals',
    tags: ['Vocals'],
  },
];

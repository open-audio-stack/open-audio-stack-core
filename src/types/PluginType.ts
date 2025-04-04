export enum PluginType {
  Effect = 'effect',
  Generator = 'generator',
  Instrument = 'instrument',
  Sampler = 'sampler',
  Tool = 'tool',
}

export interface PluginTypeOption {
  description: string;
  value: PluginType;
  name: string;
}

export const pluginTypes: PluginTypeOption[] = [
  {
    description: 'Digital signal processing based on an existing audio signal.',
    value: PluginType.Effect,
    name: 'Effect',
  },
  {
    description: 'Generates midi patterns or samples which can be fed into other instruments/effects.',
    value: PluginType.Generator,
    name: 'Generator',
  },
  {
    description: 'Sound synthesis or sample playback based on audio or midi input.',
    value: PluginType.Instrument,
    name: 'Instrument',
  },
  {
    description: 'Sample playback based on audio or midi input.',
    value: PluginType.Sampler,
    name: 'Sampler',
  },
  {
    description: 'Helper tool which provides automations and other useful functions for music.',
    value: PluginType.Tool,
    name: 'Tool',
  },
];

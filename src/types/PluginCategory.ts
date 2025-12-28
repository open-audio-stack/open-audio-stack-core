/**
 * Plugin categories are derived from the official Steinberg VST3 Plug-in
 * Type definitions (plugType) provided by the VST3 SDK.
 *
 * The VST3 SDK defines a large set of hierarchical category strings
 * (e.g. "Fx|Dynamics", "Fx|EQ", "Instrument|Synth") which serve multiple
 * purposes including host routing, UI grouping, and capability flags.
 *
 * This project intentionally normalizes and consolidates those categories
 * into a smaller, format-agnostic set suitable for a plugin registry and
 * tagging system. Not all VST3 plugType values map 1:1 to public categories.
 *
 * Authoritative source (VST3 SDK):
 * https://steinbergmedia.github.io/vst3_doc/vstinterfaces/group__plugType.html
 */

export enum PluginCategoryEffect {
  Delay = 'delay',
  Distortion = 'distortion',
  Dynamics = 'dynamics',
  Eq = 'eq',
  Filter = 'filter',
  Modulation = 'modulation',
  Pitch = 'pitch',
  Reverb = 'reverb',
  Spatial = 'spatial',
  Utility = 'utility',
}

export enum PluginCategoryInstrument {
  Bass = 'bass',
  Brass = 'brass',
  Drum = 'drum',
  Fx = 'fx',
  Guitar = 'guitar',
  Piano = 'piano',
  Sampler = 'sampler',
  Strings = 'strings',
  Synth = 'synth',
  Voice = 'voice',
  Woodwinds = 'woodwinds',
}

export interface PluginCategoryOption {
  description: string;
  value: PluginCategoryEffect | PluginCategoryInstrument;
  name: string;
  tags: string[];
}

export const pluginCategoryEffects: PluginCategoryOption[] = [
  {
    name: 'Delay',
    value: PluginCategoryEffect.Delay,
    description: 'Echoes and rhythmic repeats.',
    tags: ['Delay', 'Echo', 'Tape Delay', 'Ping Pong Delay', 'Multi-Tap Delay'],
  },
  {
    name: 'Distortion',
    value: PluginCategoryEffect.Distortion,
    description: 'Add saturation, grit, or harmonic color.',
    tags: ['Distortion', 'Saturation', 'Overdrive', 'Fuzz', 'Amp', 'Amplifier', 'Exciter', 'Waveshaper'],
  },
  {
    name: 'Dynamics',
    value: PluginCategoryEffect.Dynamics,
    description: 'Control dynamics and signal level.',
    tags: ['Dynamics', 'Compressor', 'Limiter', 'Expander', 'Gate', 'Noise Gate'],
  },
  {
    name: 'EQ',
    value: PluginCategoryEffect.Eq,
    description: 'Shape and balance frequency content.',
    tags: ['EQ', 'Equalizer', 'Parametric EQ', 'Graphic EQ', 'Tone Control'],
  },
  {
    name: 'Filter',
    value: PluginCategoryEffect.Filter,
    description: 'Sculpt sound using frequency filtering.',
    tags: ['Filter', 'Lowpass', 'Highpass', 'Bandpass', 'Notch', 'Resonant', 'Auto Filter'],
  },
  {
    name: 'Modulation',
    value: PluginCategoryEffect.Modulation,
    description: 'Create motion, width, and modulation.',
    tags: ['Modulation', 'Chorus', 'Flanger', 'Phaser', 'Tremolo', 'Vibrato', 'Rotary', 'Ensemble'],
  },
  {
    name: 'Pitch',
    value: PluginCategoryEffect.Pitch,
    description: 'Pitch shifting and harmonic processing.',
    tags: ['Pitch', 'Pitch Shifter', 'Harmonizer', 'Vocoder', 'Octaver', 'Formant'],
  },
  {
    name: 'Reverb',
    value: PluginCategoryEffect.Reverb,
    description: 'Simulate space, depth, and ambience.',
    tags: ['Reverb', 'Room', 'Hall', 'Plate', 'Spring', 'Convolution', 'Ambience'],
  },
  {
    name: 'Spatial',
    value: PluginCategoryEffect.Spatial,
    description: 'Stereo positioning and spatial control.',
    tags: ['Spatial', 'Stereo', 'Panner', 'Width', 'Imager', 'Mid/Side', 'Binaural'],
  },
  {
    name: 'Utility',
    value: PluginCategoryEffect.Utility,
    description: 'Analysis, routing, and signal tools.',
    tags: ['Utility', 'Gain', 'Trim', 'Analyzer', 'Meter', 'Phase', 'Mono', 'Polarity'],
  },
];

export const pluginCategoryInstruments: PluginCategoryOption[] = [
  {
    name: 'Bass',
    value: PluginCategoryInstrument.Bass,
    description: 'Bass instruments.',
    tags: ['Bass'],
  },
  {
    name: 'Brass',
    value: PluginCategoryInstrument.Brass,
    description: 'Brass instruments.',
    tags: ['Brass'],
  },
  {
    name: 'Drums',
    value: PluginCategoryInstrument.Drum,
    description: 'Drum and percussion instruments.',
    tags: ['Drums', 'Drum Kit', 'Percussion'],
  },
  {
    name: 'FX Instrument',
    value: PluginCategoryInstrument.Fx,
    description: 'Sound-effect or experimental instruments.',
    tags: ['FX', 'Sound Effects'],
  },
  {
    name: 'Guitar',
    value: PluginCategoryInstrument.Guitar,
    description: 'Guitar instruments.',
    tags: ['Guitar'],
  },
  {
    name: 'Piano / Keys',
    value: PluginCategoryInstrument.Piano,
    description: 'Piano and keyboard instruments.',
    tags: ['Piano', 'Keys', 'Keyboard'],
  },
  {
    name: 'Sampler',
    value: PluginCategoryInstrument.Sampler,
    description: 'Sample-based instruments.',
    tags: ['Sampler', 'Sample'],
  },
  {
    name: 'Strings',
    value: PluginCategoryInstrument.Strings,
    description: 'String instruments.',
    tags: ['Strings', 'String Ensemble'],
  },
  {
    name: 'Synth',
    value: PluginCategoryInstrument.Synth,
    description: 'Sound synthesis instruments.',
    tags: ['Synth', 'Synthesizer'],
  },
  {
    name: 'Voice',
    value: PluginCategoryInstrument.Voice,
    description: 'Vocal and choir instruments.',
    tags: ['Voice', 'Vocal', 'Choir'],
  },
  {
    name: 'Woodwinds',
    value: PluginCategoryInstrument.Woodwinds,
    description: 'Woodwind instruments.',
    tags: ['Woodwinds'],
  },
];

export enum PresetType {
  Chain = 'chain',
  Layout = 'layout',
  Mapping = 'mapping',
  Patch = 'patch',
  Pattern = 'pattern',
  Theme = 'theme',
}

export interface PresetTypeOption {
  description: string;
  value: PresetType;
  name: string;
}

// TODO define preset types.

export const presetTypes: PresetTypeOption[] = [
  {
    description:
      'Saved configurations of multiple plugins with specific routing, processing order, and parameter settings, often used in mixing and mastering plugins.',
    value: PresetType.Chain,
    name: 'Chain',
  },
  {
    description:
      'Saved configurations of a plugin’s overall layout or workspace, especially in modular plugins, which help streamline specific workflows or user preferences.',
    value: PresetType.Layout,
    name: 'Layout',
  },
  {
    description:
      'Preset mappings that assign plugin parameters to external MIDI controllers, making it easier to manipulate sounds in real-time or during live performances.',
    value: PresetType.Mapping,
    name: 'Mapping',
  },
  {
    description:
      'Sound presets containing saved parameter settings for synths or instruments, often focused on specific sounds or tonal qualities.',
    value: PresetType.Patch,
    name: 'Patch',
  },
  {
    description: 'Rhythmic and harmonic variations of MIDI data.',
    value: PresetType.Pattern,
    name: 'Pattern',
  },
  {
    description:
      'Visual customizations that change the interface design, colors, or style of a plugin, providing a personalized or visually enhanced experience.',
    value: PresetType.Theme,
    name: 'Theme',
  },
];

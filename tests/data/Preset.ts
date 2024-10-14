import { License, System } from '../../src/types/Config';
import { FileFormat, FileType } from '../../src/types/File';
import { Preset, PresetFormat, PresetType } from '../../src/types/Preset';

export const PRESET: Preset = {
  author: 'Audiotown',
  changes: '- Tweaked preset\n- New sound',
  date: '2024-03-02T00:00:00.000Z',
  description: 'Synthwave preset for Surge',
  files: [
    {
      format: FileFormat.Zip,
      formats: [PresetFormat.VST3],
      hash: '3af35f0212',
      systems: [System.MacBit32],
      size: 94448096,
      type: FileType.Archive,
      url: 'https://a.com/b/file.zip',
    },
  ],
  license: License.CreativeCommonsZerov1Universal,
  plugins: {
    'freepats/glasses': '1.0.0',
    'surge-synth/surge': '1.3.1',
  },
  name: 'Synthwave',
  tags: ['Synthwave', 'Synth', '80s'],
  type: PresetType.Sound,
  url: 'https://myproject.com',
};

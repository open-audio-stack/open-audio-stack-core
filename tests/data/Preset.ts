import { PresetInterface } from '../../src/index-browser';
import { FileFormat } from '../../src/types/FileFormat';
import { License } from '../../src/types/License';
import { PresetFormat } from '../../src/types/PresetFormat';
import { PresetType } from '../../src/types/PresetType';
import { System } from '../../src/types/System';

export const PRESET: PresetInterface = {
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
      type: FileId.Archive,
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

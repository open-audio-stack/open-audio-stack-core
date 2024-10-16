import { FileFormat, FileId } from '../../src/types/File';
import { LicenseId } from '../../src/types/License';
import { PresetType, PresetFormat, PresetId } from '../../src/types/Preset';
import { SystemId } from '../../src/types/System';

export const PRESET: PresetType = {
  author: 'Audiotown',
  changes: '- Tweaked preset\n- New sound',
  date: '2024-03-02T00:00:00.000Z',
  description: 'Synthwave preset for Surge',
  files: [
    {
      format: FileFormat.Zip,
      formats: [PresetFormat.VST3],
      hash: '3af35f0212',
      systems: [SystemId.MacBit32],
      size: 94448096,
      type: FileId.Archive,
      url: 'https://a.com/b/file.zip',
    },
  ],
  license: LicenseId.CreativeCommonsZerov1Universal,
  plugins: {
    'freepats/glasses': '1.0.0',
    'surge-synth/surge': '1.3.1',
  },
  name: 'Synthwave',
  tags: ['Synthwave', 'Synth', '80s'],
  type: PresetId.Sound,
  url: 'https://myproject.com',
};

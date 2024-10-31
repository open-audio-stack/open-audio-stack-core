import { Architecture } from '../../src/types/Architecture';
import { FileFormat } from '../../src/types/FileFormat';
import { FileType } from '../../src/types/FileType';
import { License } from '../../src/types/License';
import { PresetFormat } from '../../src/types/PresetFormat';
import { PresetInterface } from '../../src/types/Preset';
import { PresetType } from '../../src/types/PresetType';
import { SystemType } from '../../src/types/SystemType';

export const PRESET: PresetInterface = {
  audio: 'https://mypreset.com/audio.flac',
  author: 'Audiotown',
  changes: '- Tweaked preset\n- New sound',
  date: '2024-03-02T00:00:00.000Z',
  description: 'Synthwave preset for Surge',
  files: [
    {
      architectures: [Architecture.Bit32],
      contains: [PresetFormat.VST3],
      format: FileFormat.Zip,
      hash: '3af35f0212',
      systems: [{ min: 13.7, type: SystemType.Macintosh }],
      size: 94448096,
      type: FileType.Archive,
      url: 'https://a.com/b/file.zip',
    },
  ],
  image: 'https://mypreset.com/image.jpg',
  license: License.CreativeCommonsZerov1Universal,
  plugins: {
    'freepats/glasses': '1.0.0',
    'surge-synth/surge': '1.3.1',
  },
  name: 'Synthwave',
  tags: ['Synthwave', 'Synth', '80s'],
  type: PresetType.Patch,
  url: 'https://myproject.com',
};

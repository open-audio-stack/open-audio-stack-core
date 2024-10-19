import { ProjectInterface } from '../../src/index-browser';
import { FileFormat } from '../../src/types/FileFormat';
import { FileType } from '../../src/types/FileType';
import { License } from '../../src/types/License';
import { ProjectFormat } from '../../src/types/ProjectFormat';
import { ProjectType } from '../../src/types/ProjectType';
import { System } from '../../src/types/System';

export const PROJECT: ProjectInterface = {
  author: 'KMT',
  changes: '- Fixed levels\n- New instrument added',
  date: '2024-03-02T00:00:00.000Z',
  description: 'Song idea using synthesizers',
  files: [
    {
      format: FileFormat.Zip,
      formats: [ProjectFormat.AbletonLive],
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
  name: 'Banwer',
  tags: ['Idea', 'Synth', 'Rock'],
  type: ProjectType.Song,
  url: 'https://myproject.com',
};

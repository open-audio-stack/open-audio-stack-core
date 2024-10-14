import { License, System } from '../../src/types/Config';
import { FileFormat, FileType } from '../../src/types/File';
import { Project, ProjectFormat, ProjectType } from '../../src/types/Project';

export const PROJECT: Project = {
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

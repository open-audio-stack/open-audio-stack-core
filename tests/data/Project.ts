import { FileFormat, FileId } from '../../src/types/File';
import { LicenseId } from '../../src/types/License';
import { ProjectId, ProjectFormat, ProjectType } from '../../src/types/Project';
import { SystemId } from '../../src/types/System';

export const PROJECT: ProjectType = {
  author: 'KMT',
  changes: '- Fixed levels\n- New instrument added',
  date: '2024-03-02T00:00:00.000Z',
  description: 'Song idea using synthesizers',
  files: [
    {
      format: FileFormat.Zip,
      formats: [ProjectFormat.AbletonLive],
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
  name: 'Banwer',
  tags: ['Idea', 'Synth', 'Rock'],
  type: ProjectId.Song,
  url: 'https://myproject.com',
};

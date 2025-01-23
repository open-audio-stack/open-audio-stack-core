import { Architecture } from '../../src/types/Architecture';
import { FileFormat } from '../../src/types/FileFormat';
import { FileType } from '../../src/types/FileType';
import { License } from '../../src/types/License';
import { ProjectInterface } from '../../src/types/Project';
import { ProjectFormat } from '../../src/types/ProjectFormat';
import { ProjectType } from '../../src/types/ProjectType';
import { SystemType } from '../../src/types/SystemType';
import { PackageInterface } from '../../src/types/Package';

export const PROJECT: ProjectInterface = {
  audio: 'https://open-audio-stack.github.io/open-audio-stack-registry/projects/kmt/banwer/banwer.flac',
  author: 'KMT',
  changes: '- First version\n',
  date: '2024-03-02T00:00:00.000Z',
  description: 'Song idea using synthesizers.',
  files: [
    {
      architectures: [Architecture.Arm32, Architecture.Arm64, Architecture.X32, Architecture.X64],
      contains: [ProjectFormat.AbletonLive],
      format: FileFormat.Zip,
      sha256: '77e2d542235889b027f2ecbe66b753978a5232fabac9c97151a86173048e2eaf',
      systems: [{ type: SystemType.Linux }, { type: SystemType.Macintosh }, { type: SystemType.Windows }],
      size: 216863,
      type: FileType.Archive,
      url: 'https://open-audio-stack.github.io/open-audio-stack-registry/projects/kmt/banwer/1.0.1/banwer.zip',
    },
  ],
  image: 'https://open-audio-stack.github.io/open-audio-stack-registry/projects/kmt/banwer/banwer.jpg',
  license: License.GNUGeneralPublicLicensev3,
  plugins: {
    'surge-synth/surge': '1.3.1',
  },
  name: 'Banwer',
  tags: ['Idea', 'Synth', 'Modulation'],
  type: ProjectType.Song,
  url: 'https://soundcloud.com/kmt-london',
};

export const PROJECT_PACKAGE: PackageInterface = {
  slug: 'kmt/banwer',
  version: '1.0.1',
  versions: {
    '1.0.1': PROJECT,
  },
};

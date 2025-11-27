import path from 'path';
import { Architecture } from '../../src/types/Architecture';
import { FileType } from '../../src/types/FileType';
import { License } from '../../src/types/License';
import { ProjectInterface } from '../../src/types/Project';
import { ProjectFormat } from '../../src/types/ProjectFormat';
import { ProjectType } from '../../src/types/ProjectType';
import { SystemType } from '../../src/types/SystemType';
import { PackageInterface } from '../../src/types/Package';

export const PROJECT_PATH: string = path.join('test', 'installed', 'projects', 'kmt', 'banwer', '1.0.1', 'index.json');

export const PROJECT: ProjectInterface = {
  audio: 'https://open-audio-stack.github.io/open-audio-stack-registry/projects/kmt/banwer/banwer.flac',
  author: 'KMT',
  changes: '- Collect and save files\n',
  date: '2024-03-02T00:00:00.000Z',
  description: 'Song idea using synthesizers.',
  files: [
    {
      architectures: [Architecture.Arm32, Architecture.Arm64, Architecture.X32, Architecture.X64],
      contains: [ProjectFormat.AbletonLive],
      open: 'Banwer.als',
      sha256: 'e99fa24234d02814e3cb788d106b766876a065113c71d4855faf83cb9476ab98',
      systems: [{ type: SystemType.Linux }, { type: SystemType.Mac }, { type: SystemType.Win }],
      size: 3720765,
      type: FileType.Archive,
      url: 'https://github.com/kmturley/banwer/releases/download/v1.0.1/banwer.zip',
    },
  ],
  image: 'https://open-audio-stack.github.io/open-audio-stack-registry/projects/kmt/banwer/banwer.jpg',
  license: License.GNUGeneralPublicLicensev3,
  plugins: {
    'surge-synthesizer/surge': '1.3.1',
  },
  name: 'Banwer',
  tags: ['Idea', 'Synth', 'Modulation'],
  type: ProjectType.Song,
  url: 'https://github.com/kmturley/banwer',
  verified: false,
};

export const PROJECT_INSTALLED: ProjectInterface = structuredClone(PROJECT);
PROJECT_INSTALLED.installed = true;

export const PROJECT_DEPS: ProjectInterface = structuredClone(PROJECT);
PROJECT_DEPS.installed = true;
PROJECT_DEPS.plugins['surge-synthesizer/surge'] = '1.3.4';

export const PROJECT_NO_DEPS: ProjectInterface = structuredClone(PROJECT);
PROJECT_NO_DEPS.installed = true;
PROJECT_NO_DEPS.plugins = {};

export const PROJECT_PACKAGE: PackageInterface = {
  slug: 'kmt/banwer',
  version: '1.0.1',
  versions: {
    '1.0.1': PROJECT,
  },
};

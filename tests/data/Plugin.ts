import { Architecture } from '../../src/types/Architecture';
import { FileFormat } from '../../src/types/FileFormat';
import { FileType } from '../../src/types/FileType';
import { License } from '../../src/types/License';
import { PluginInterface } from '../../src/types/Plugin';
import { PluginFormat } from '../../src/types/PluginFormat';
import { PluginType } from '../../src/types/PluginType';
import { SystemType } from '../../src/types/SystemType';

export const PLUGIN: PluginInterface = {
  audio: 'https://open-audio-stack.github.io/open-audio-stack-registry/plugins/surge-synthesizer/surge/surge.flac',
  author: 'Surge Synth Team',
  changes: '- Fixed bug with audio\n- New feature added\n',
  date: '2024-03-02T00:00:00.000Z',
  description:
    'Hybrid synthesizer featuring many synthesis techniques, a great selection of filters, a flexible modulation engine, a smorgasbord of effects, and modern features like MPE and microtuning.',
  files: [
    {
      architectures: [Architecture.X64],
      contains: [
        PluginFormat.LinuxStandalone,
        PluginFormat.CleverAudioPlugin,
        PluginFormat.LADSPAVersion2,
        PluginFormat.VST3,
      ],
      format: FileFormat.Zip,
      sha256: '7b496b677da8fa6abf609e8a3d14d73ad1758cfeff42f1d41037e1e12ecb4be7',
      systems: [{ type: SystemType.Linux }],
      size: 94448096,
      type: FileType.Archive,
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-linux-1.3.1-pluginsonly.tar.gz',
    },
    {
      architectures: [Architecture.Arm64, Architecture.X64],
      contains: [
        PluginFormat.MacStandalone,
        PluginFormat.CleverAudioPlugin,
        PluginFormat.AudioUnits,
        PluginFormat.VST3,
      ],
      format: FileFormat.Zip,
      sha256: 'dd163c922bfcc4b14fa90184797846c1c07df73c7498cd47442c111c8552d6bc',
      systems: [{ type: SystemType.Macintosh }],
      size: 180726292,
      type: FileType.Archive,
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-macos-1.3.1-pluginsonly.zip',
    },
    {
      architectures: [Architecture.X64],
      contains: [PluginFormat.WinStandalone, PluginFormat.CleverAudioPlugin, PluginFormat.VST3],
      format: FileFormat.Zip,
      sha256: 'e6e1c7911127fa9e419f1c97551a00fc072246ac8b4a6b9493b835502c3a7288',
      systems: [{ type: SystemType.Windows }],
      size: 48165645,
      type: FileType.Archive,
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-win64-1.3.1-pluginsonly.zip',
    },
  ],
  image: 'https://open-audio-stack.github.io/open-audio-stack-registry/plugins/surge-synthesizer/surge/surge.jpg',
  license: License.GNUGeneralPublicLicensev3,
  name: 'Surge XT',
  tags: ['Instrument', 'Synth', 'Modulation'],
  type: PluginType.Instrument,
  url: 'https://github.com/surge-synthesizer/surge',
};

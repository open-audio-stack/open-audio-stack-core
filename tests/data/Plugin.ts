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
  changes: '- Fixed bug with audio\n- New feature added',
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
      format: FileFormat.Tarball,
      sha256: '8c2de75617e4e5b1051924d42b3b0306e5d1c3fea12c51c87d8505ba7857ca51',
      systems: [{ type: SystemType.Linux }],
      size: 97294804,
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
      sha256: 'b453e32c28594c20dcb059e2ca8ec3dc01c3f844500d5519680c15c3e7a262ea',
      systems: [{ type: SystemType.Macintosh }],
      size: 186958216,
      type: FileType.Archive,
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-macos-1.3.1-pluginsonly.zip',
    },
    {
      architectures: [Architecture.X64],
      contains: [PluginFormat.WinStandalone, PluginFormat.CleverAudioPlugin, PluginFormat.VST3],
      format: FileFormat.Zip,
      sha256: '9b9d3032985085dd662e06c4318c799919bcec0b4082a6afb2562c5538cf0853',
      systems: [{ type: SystemType.Windows }],
      size: 49093875,
      type: FileType.Archive,
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-win64-1.3.1-pluginsonly.zip',
    },
  ],
  image: 'https://open-audio-stack.github.io/open-audio-stack-registry/plugins/surge-synthesizer/surge/surge.jpg',
  license: License.GNUGeneralPublicLicensev3,
  name: 'Surge XT',
  tags: ['80s', 'Synth', 'Modulation'],
  type: PluginType.Instrument,
  url: 'https://github.com/surge-synthesizer/surge',
};

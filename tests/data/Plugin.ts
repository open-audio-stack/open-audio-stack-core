import { PackageInterface } from '../../src/types/Package';
import { Architecture } from '../../src/types/Architecture';
import { FileFormat } from '../../src/types/FileFormat';
import { FileType } from '../../src/types/FileType';
import { License } from '../../src/types/License';
import { PluginInterface } from '../../src/types/Plugin';
import { PluginFormat } from '../../src/types/PluginFormat';
import { PluginType } from '../../src/types/PluginType';
import { SystemType } from '../../src/types/SystemType';

const slug: string = 'surge-synthesizer/surge';
const version: string = '1.3.1';

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
      format: FileFormat.DebianPackage,
      sha256: '729d92b5a4288f4c22587b8e84244c26aef34e58312ab5b4f4d1f196699b802e',
      systems: [{ type: SystemType.Linux }],
      size: 220693484,
      type: FileType.Installer,
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-linux-x64-1.3.1.deb',
    },
    {
      architectures: [Architecture.Arm64, Architecture.X64],
      contains: [
        PluginFormat.MacStandalone,
        PluginFormat.CleverAudioPlugin,
        PluginFormat.AudioUnits,
        PluginFormat.VST3,
      ],
      format: FileFormat.AppleDiskImage,
      sha256: 'e30b218700d4067edb3a0eadb4128784e41f91f663cff19e3fbb38460883cf59',
      systems: [{ type: SystemType.Mac }],
      size: 411860016,
      type: FileType.Installer,
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-macOS-1.3.1.dmg',
    },
    {
      architectures: [Architecture.X64],
      contains: [PluginFormat.WinStandalone, PluginFormat.CleverAudioPlugin, PluginFormat.VST3],
      format: FileFormat.ExecutableInstaller,
      sha256: '3d766adb0d04b86f7aca8c136bc4c7b0727d316ec10895f679f1c01b0c236a00',
      systems: [{ type: SystemType.Win }],
      size: 180270273,
      type: FileType.Installer,
      url: 'https://github.com/surge-synthesizer/releases-xt/releases/download/1.3.1/surge-xt-win32-1.3.1-setup.exe',
    },
  ],
  image: 'https://open-audio-stack.github.io/open-audio-stack-registry/plugins/surge-synthesizer/surge/surge.jpg',
  license: License.GNUGeneralPublicLicensev3,
  name: 'Surge XT',
  tags: ['Instrument', 'Synth', 'Modulation'],
  type: PluginType.Instrument,
  url: 'https://github.com/surge-synthesizer/surge',
};

export const PLUGIN_INSTALLED: PluginInterface = structuredClone(PLUGIN);
PLUGIN_INSTALLED.installed = true;

export const PLUGIN_PACKAGE: PackageInterface = {
  slug,
  version,
  versions: {
    [version]: PLUGIN,
  },
};

export const PLUGIN_PACKAGE_EMPTY: PackageInterface = {
  slug,
  version: '0.0.0',
  versions: {},
};

export const PLUGIN_PACKAGE_MULTIPLE: PackageInterface = {
  slug,
  version: '1.3.2',
  versions: {
    [version]: PLUGIN,
    '1.3.2': PLUGIN,
  },
};

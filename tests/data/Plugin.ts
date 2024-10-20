import { Architecture } from '../../src/types/Architecture';
import { FileFormat } from '../../src/types/FileFormat';
import { FileType } from '../../src/types/FileType';
import { License } from '../../src/types/License';
import { PluginInterface } from '../../src/types/Plugin';
import { PluginFormat } from '../../src/types/PluginFormat';
import { PluginType } from '../../src/types/PluginType';
import { SystemType } from '../../src/types/SystemType';

export const PLUGIN: PluginInterface = {
  author: 'Surge Synth Team',
  changes: '- Fixed bug with audio\n- New feature added',
  date: '2024-03-02T00:00:00.000Z',
  description:
    'Hybrid synthesizer featuring many synthesis techniques, a great selection of filters, a flexible modulation engine, a smorgasbord of effects, and modern features like MPE and microtuning.',
  files: [
    {
      architectures: [Architecture.Bit32],
      format: FileFormat.Zip,
      formats: [PluginFormat.VST3],
      hash: '3af35f0212',
      systems: [{ min: 13.7, type: SystemType.Macintosh }],
      size: 94448096,
      type: FileType.Archive,
      url: 'https://a.com/b/file.zip',
    },
  ],
  license: License.GNUGeneralPublicLicensev3,
  name: 'Surge XT',
  tags: ['80s', 'Synth', 'Modulation'],
  type: PluginType.Instrument,
  url: 'https://github.com/surge-synthesizer/surge',
};

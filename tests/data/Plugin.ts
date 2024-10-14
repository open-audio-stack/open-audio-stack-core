import { License, System } from '../../src/types/Config';
import { FileFormat, FileType } from '../../src/types/File';
import { Plugin, PluginFormat, PluginType } from '../../src/types/Plugin';

export const PLUGIN: Plugin = {
  author: 'Surge Synth Team',
  changes: '- Fixed bug with audio\n- New feature added',
  date: '2024-03-02T00:00:00.000Z',
  description:
    'Hybrid synthesizer featuring many synthesis techniques, a great selection of filters, a flexible modulation engine, a smorgasbord of effects, and modern features like MPE and microtuning.',
  files: [
    {
      format: FileFormat.Zip,
      formats: [PluginFormat.VST3],
      hash: '3af35f0212',
      systems: [System.MacBit32],
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

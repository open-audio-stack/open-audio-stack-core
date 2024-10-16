import { FileFormat, FileId } from '../../src/types/File';
import { LicenseId } from '../../src/types/License';
import { PluginType, PluginFormat, PluginId } from '../../src/types/Plugin';
import { SystemId } from '../../src/types/System';

export const PLUGIN: PluginType = {
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
      systems: [SystemId.MacBit32],
      size: 94448096,
      type: FileId.Archive,
      url: 'https://a.com/b/file.zip',
    },
  ],
  license: LicenseId.GNUGeneralPublicLicensev3,
  name: 'Surge XT',
  tags: ['80s', 'Synth', 'Modulation'],
  type: PluginId.Instrument,
  url: 'https://github.com/surge-synthesizer/surge',
};

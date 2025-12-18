import { describe, expect, test } from 'vitest';
import { Package } from '../src/classes/Package.js';
import { License } from '../src/types/License.js';
import { Architecture } from '../src/types/Architecture.js';
import { SystemType } from '../src/types/SystemType.js';
import { FileType } from '../src/types/FileType.js';
import { PluginType } from '../src/types/PluginType.js';

describe('Package.addVersion', () => {
  test('throws when version is invalid', () => {
    const pkg = new Package('org/foo');
    // Pass an obviously invalid object
    expect(() => pkg.addVersion('1.0.0', {} as any)).toThrow();
  });

  test('adds a valid plugin version', () => {
    const pkg = new Package('org/bar');
    const version = {
      author: 'tester',
      changes: 'initial',
      date: new Date().toISOString(),
      description: 'desc',
      image: 'https://example.com/image.jpg',
      license: License.MITLicense,
      name: 'bar',
      tags: ['tag'],
      url: 'https://example.com',
      files: [
        {
          architectures: [Architecture.X64],
          sha256: 'a'.repeat(64),
          size: 1024,
          systems: [{ type: SystemType.Mac }],
          type: FileType.Archive,
          url: 'https://github.com/org/bar/releases/download/v1.2.3/file.7z',
          contains: [],
        },
      ],
      type: PluginType.Effect,
    } as any;

    pkg.addVersion('1.2.3', version);
    const stored = pkg.getVersion('1.2.3');
    expect(stored).toBeDefined();
    expect(pkg.latestVersion()).toBe('1.2.3');
  });
});

import { z } from 'zod';
import { Architecture } from '../types/Architecture.js';
import { FileFormat } from '../types/FileFormat.js';
import { FileType } from '../types/FileType.js';
import { License } from '../types/License.js';
import { PluginFile } from '../types/Plugin.js';
import { PluginType } from '../types/PluginType.js';
import { PresetFile } from '../types/Preset.js';
import { PresetType } from '../types/PresetType.js';
import { ProjectFile } from '../types/Project.js';
import { ProjectType } from '../types/ProjectType.js';
import { SystemType } from '../types/SystemType.js';
import { PackageValidationRec, PackageVersionType } from '../types/Package.js';

// This is a first version using zod library for validation.
// If it works well, consider updating all types to infer from Zod objects.
// This will remove duplicatation of code between types and validators.

export const PackageSystemValidator = z.object({
  max: z.number().min(0).max(99).optional(),
  min: z.number().min(0).max(99).optional(),
  type: z.nativeEnum(SystemType),
});

export const PackageFileValidator = z.object({
  architectures: z.nativeEnum(Architecture).array(),
  format: z.nativeEnum(FileFormat),
  sha256: z.string().length(64),
  size: z.number().min(0).max(9999999999),
  systems: PackageSystemValidator.array(),
  type: z.nativeEnum(FileType),
  url: z.string().min(0).max(256).startsWith('https://'),
});

export const PackageTypeObj = { ...PluginType, ...PresetType, ...ProjectType };
export const PackageVersionValidator = z.object({
  audio: z.string().min(0).max(256).startsWith('https://'),
  author: z.string().min(0).max(256),
  changes: z.string().min(0).max(256),
  date: z.string().datetime(),
  description: z.string().min(0).max(256),
  files: z.array(PackageFileValidator),
  image: z.string().min(0).max(256).startsWith('https://'),
  license: z.nativeEnum(License),
  name: z.string().min(0).max(256),
  tags: z.string().min(0).max(256).array(),
  type: z.nativeEnum(PackageTypeObj),
  url: z.string().min(0).max(256).startsWith('https://'),
});

// TODO refactor all this using a proper validation library.
export function packageRecommendations(pkgVersion: PackageVersionType) {
  const recs: PackageValidationRec[] = [];

  packageRecommendationsUrl(pkgVersion, recs, 'audio');
  packageRecommendationsUrl(pkgVersion, recs, 'image');
  packageRecommendationsUrl(pkgVersion, recs, 'url');

  // Image/audio previews
  if (pkgVersion.image && pkgVersion.image.endsWith('png')) {
    recs.push({
      field: 'image',
      rec: 'should use the jpg format',
    });
  }
  if (pkgVersion.audio && pkgVersion.audio.endsWith('wav')) {
    recs.push({
      field: 'audio',
      rec: 'should use the flac format',
    });
  }

  const supportedArchitectures: any = {};
  const supportedSystems: any = {};
  const supportedFileFormats: any = {};

  pkgVersion.files.forEach(file => {
    file.architectures.forEach(architecture => {
      supportedArchitectures[architecture] = true;
    });
    file.systems.forEach(system => {
      supportedSystems[system.type] = true;
    });
    supportedFileFormats[file.format] = true;
    packageRecommendationsUrl(file, recs, 'url');
  });

  // Architectures
  if (!supportedArchitectures.arm64) recs.push({ field: 'architectures', rec: 'should support arm64' });
  if (!supportedArchitectures.x64) recs.push({ field: 'architectures', rec: 'should support x64' });

  // Systems
  if (!supportedSystems.linux) recs.push({ field: 'systems', rec: 'should support Linux' });
  if (!supportedSystems.mac) recs.push({ field: 'systems', rec: 'should support Mac' });
  if (!supportedSystems.win) recs.push({ field: 'systems', rec: 'should support Windows' });

  // Formats
  if (supportedFileFormats.deb)
    recs.push({
      field: 'format',
      rec: 'should support all Linux distributions, consider using AppImage or Tarball instead',
    });
  if (supportedFileFormats.rpm)
    recs.push({
      field: 'format',
      rec: 'should support all Linux distributions, consider using AppImage or Tarball instead',
    });

  // Tags
  const pluginTags: string[] = pkgVersion.tags.map(tag => tag.toLowerCase());
  if (pluginTags.length < 2) recs.push({ field: 'tags', rec: 'should have more items' });

  // Licence
  if (!Object.values(License).includes(pkgVersion.license)) {
    recs.push({ field: 'license', rec: 'should be from the supported list' });
  } else if (pkgVersion.license === License.Other) {
    recs.push({ field: 'license', rec: 'should be more specific' });
  }
  return recs;
}

export function packageRecommendationsUrl(
  obj: PackageVersionType | PluginFile | PresetFile | ProjectFile,
  recs: PackageValidationRec[],
  field: string,
) {
  // @ts-expect-error indexing a field with multiple package types.
  const val = obj[field];
  if (typeof val !== 'string') return;
  if (!val.startsWith('https://')) {
    recs.push({
      field,
      rec: 'should use https url',
    });
  }
  if (!val.includes('github.com') && !val.includes('github.io')) {
    recs.push({
      field,
      rec: 'should point to GitHub',
    });
  }
}

import * as semver from 'semver';
import { z } from 'zod';
import { Architecture } from '../types/Architecture.js';
import { FileInterface } from '../types/File.js';
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
import { PackageFileMap, PackageInterface, PackageValidationRec, PackageVersion } from '../types/Package.js';
import { pathGetExt } from './utils.js';

export function packageCompatibleFiles(
  pkg: PackageVersion,
  arch: Architecture[],
  sys: SystemType[],
  excludedFormats?: FileFormat[],
) {
  return pkg.files.filter((file: FileInterface) => {
    const archMatches = file.architectures.filter(architecture => {
      return arch.includes(architecture);
    });
    const sysMatches = file.systems.filter(system => {
      return sys.includes(system.type);
    });
    const formatAllowed =
      excludedFormats && excludedFormats.includes(pathGetExt(file.url) as FileFormat) ? false : true;
    return archMatches.length && sysMatches.length && formatAllowed;
  });
}

export function packageErrors(pkgVersion: PackageVersion) {
  return PackageVersionValidator.safeParse(pkgVersion).error?.issues || [];
}

export function packageFileMap(pkgVersion: PackageVersion) {
  return pkgVersion.files.reduce((result: PackageFileMap, file) => {
    file.systems.forEach(system => {
      if (!result[system.type]) {
        result[system.type] = [];
      }
      (result as any)[system.type].push(file);
    });
    return result;
  }, {});
}

export function packageVersionLatest(pkg: PackageInterface) {
  return Array.from(Object.keys(pkg.versions)).sort(semver.rcompare)[0] || '0.0.0';
}

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
  donate: z.optional(z.string().min(0).max(256).startsWith('https://')),
  files: z.array(PackageFileValidator),
  image: z.string().min(0).max(256).startsWith('https://'),
  license: z.nativeEnum(License),
  name: z.string().min(0).max(256),
  tags: z.string().min(0).max(256).array(),
  type: z.nativeEnum(PackageTypeObj),
  url: z.string().min(0).max(256).startsWith('https://'),
});

// TODO refactor all this using a proper validation library.
export function packageRecommendations(pkgVersion: PackageVersion) {
  const recs: PackageValidationRec[] = [];

  packageRecommendationsUrl(pkgVersion, recs, 'audio', 'github');
  packageRecommendationsUrl(pkgVersion, recs, 'image', 'github');
  packageRecommendationsUrl(pkgVersion, recs, 'url', 'github');
  packageRecommendationsUrl(pkgVersion, recs, 'donate');

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

  // Files
  if (pkgVersion.files) {
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
      const ext: string = pathGetExt(file.url);
      supportedFileFormats[ext] = true;
      packageRecommendationsUrl(file, recs, 'url', 'github');

      // Formats which do not support headless installation.
      if (ext === FileFormat.AppImage)
        recs.push({ field: 'url', rec: 'requires manual installation steps, consider .deb and .rpm instead' });
      if (ext === FileFormat.AppleDiskImage)
        recs.push({ field: 'url', rec: 'requires mounting step, consider .pkg instead' });
      if (!Object.values(FileFormat).includes(ext as FileFormat))
        recs.push({ field: 'url', rec: 'not a supported format' });

      // Validate format is a supported installer format
      const installerFormats: FileFormat[] = [
        FileFormat.AppleDiskImage,
        FileFormat.ApplePackage,
        FileFormat.DebianPackage,
        FileFormat.ExecutableInstaller,
        FileFormat.RedHatPackage,
        FileFormat.WindowsInstaller,
      ];
      if (file.type === FileType.Installer && !installerFormats.includes(ext as FileFormat))
        recs.push({ field: 'type', rec: 'should match url field' });
    });

    // Architectures
    if (!supportedArchitectures.arm64) recs.push({ field: 'architectures', rec: 'should support arm64' });
    if (!supportedArchitectures.x64) recs.push({ field: 'architectures', rec: 'should support x64' });

    // Systems
    if (!supportedSystems.linux) recs.push({ field: 'systems', rec: 'should support Linux' });
    if (!supportedSystems.mac) recs.push({ field: 'systems', rec: 'should support Mac' });
    if (!supportedSystems.win) recs.push({ field: 'systems', rec: 'should support Windows' });
  } else {
    recs.push({
      field: 'files',
      rec: 'is missing',
    });
  }

  // Tags
  if (pkgVersion.tags) {
    const pluginTags: string[] = pkgVersion.tags.map(tag => tag.trim().toLowerCase());
    if (pluginTags.length < 2) recs.push({ field: 'tags', rec: 'should have more items' });
  } else {
    recs.push({
      field: 'tags',
      rec: 'is missing',
    });
  }

  // Licence
  if (pkgVersion.license) {
    if (!Object.values(License).includes(pkgVersion.license)) {
      recs.push({ field: 'license', rec: 'should be from the supported list' });
    } else if (pkgVersion.license === License.Other) {
      recs.push({ field: 'license', rec: 'should be more specific' });
    }
  } else {
    recs.push({
      field: 'license',
      rec: 'is missing',
    });
  }

  return recs;
}

export function packageRecommendationsUrl(
  obj: PackageVersion | PluginFile | PresetFile | ProjectFile,
  recs: PackageValidationRec[],
  field: string,
  domain?: string,
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
  if (domain && !val.includes(`${domain}.com`) && !val.includes(`${domain}.io`)) {
    recs.push({
      field,
      rec: 'should point to GitHub',
    });
  }
}

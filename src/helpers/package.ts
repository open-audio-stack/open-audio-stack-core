import { License } from '../types/License.js';
import {
  PackageValidation,
  PackageValidationError,
  PackageValidationField,
  PackageValidationRec,
  PackageVersionType,
} from '../types/Package.js';

// TODO refactor all this using a proper validation library.
export function packageRecommendations(pkgVersion: PackageVersionType) {
  const recs: PackageValidationRec[] = [];

  // Urls
  if (!pkgVersion.url.startsWith('https://')) {
    recs.push({
      field: 'url',
      rec: 'should use https url',
    });
  }
  if (!pkgVersion.url.includes('github.com') && !pkgVersion.url.includes('github.io')) {
    recs.push({
      field: 'url',
      rec: 'should point to GitHub',
    });
  }

  // Image/audio previews
  if (pkgVersion.image && pkgVersion.image.includes('png')) {
    recs.push({
      field: 'image',
      rec: 'should use the jpg format',
    });
  }
  if (pkgVersion.audio && pkgVersion.audio.includes('wav')) {
    recs.push({
      field: 'audio',
      rec: 'should use the flac format',
    });
  }

  // Architectures/systems
  const supportedArchitectures: any = {};
  const supportedSystems: any = {};
  pkgVersion.files.forEach(file => {
    file.architectures.forEach(architecture => {
      supportedArchitectures[architecture] = true;
    });
    file.systems.forEach(system => {
      supportedSystems[system.type] = true;
    });
  });
  if (!supportedArchitectures.arm64) recs.push({ field: 'architectures', rec: 'should support Arm64' });
  if (!supportedArchitectures.bit64) recs.push({ field: 'architectures', rec: 'should support Bit64' });
  if (!supportedSystems.linux) recs.push({ field: 'systems', rec: 'should support Linux' });
  if (!supportedSystems.mac) recs.push({ field: 'systems', rec: 'should support Mac' });
  if (!supportedSystems.win) recs.push({ field: 'systems', rec: 'should support Windows' });

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

export function packageValidate(pkgVersion: PackageVersionType) {
  const fields: PackageValidationField[] = [
    { name: 'audio', type: 'string' },
    { name: 'author', type: 'string' },
    { name: 'changes', type: 'string' },
    { name: 'date', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'files', type: 'object' },
    { name: 'image', type: 'string' },
    { name: 'license', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'tags', type: 'object' },
    { name: 'type', type: 'string' },
    { name: 'url', type: 'string' },
  ];
  const errors: PackageValidationError[] = [];
  fields.forEach((field: PackageValidationField) => {
    const versionField = pkgVersion[field.name as keyof PackageVersionType];
    if (versionField === undefined) {
      errors.push({
        field: field.name,
        error: PackageValidation.MISSING_FIELD,
        valueExpected: field.type,
        valueReceived: 'undefined',
      });
    } else if (typeof versionField !== field.type) {
      errors.push({
        field: field.name,
        error: PackageValidation.INVALID_TYPE,
        valueExpected: field.type,
        valueReceived: typeof versionField,
      });
    }
  });
  return errors;
}

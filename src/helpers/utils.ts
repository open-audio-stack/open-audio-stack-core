import chalk from 'chalk';
import { PackageValidationError, PackageValidationRec } from '../types/Package.js';

export function logReport(info: string, errors?: PackageValidationError[], recs?: PackageValidationRec[]) {
  if (errors && errors.length > 0) {
    console.log(chalk.red(`X ${info}`));
    logErrors(errors);
  } else {
    console.log(chalk.green(`✓ ${info}`));
  }
  if (recs) logRecommendations(recs);
}

export function logErrors(errors: PackageValidationError[]) {
  errors.forEach(error => {
    console.log(
      chalk.red(
        `- ${error.field} (${error.error}) received '${error.valueReceived}' expected '${error.valueExpected}'`,
      ),
    );
  });
}

export function logRecommendations(recs: PackageValidationRec[]) {
  recs.forEach(rec => {
    console.log(chalk.yellow(`- ${rec.field} ${rec.rec}`));
  });
}

export function pathGetExt(path: string, sep: string = '.') {
  return path.substring(path.lastIndexOf(sep) + 1);
}

export function pathGetDirectory(path: string, sep: string = '/') {
  return path.substring(0, path.lastIndexOf(sep));
}

export function pathGetFilename(path: string, sep: string = '/') {
  return path.substring(path.lastIndexOf(sep) + 1);
}

export function pathGetSlug(path: string, sep: string = '/') {
  const parts: string[] = path.split(sep);
  return parts[0] + '/' + parts[1];
}

export function pathGetVersion(path: string, sep: string = '/') {
  const parts: string[] = path.split(sep);
  return parts[parts.length - 2];
}

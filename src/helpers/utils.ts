import chalk from 'chalk';
import { PackageValidationRec } from '../types/Package.js';
import { ZodIssue } from 'zod';

export function logReport(info: string, errors?: ZodIssue[], recs?: PackageValidationRec[]) {
  if (errors && errors.length > 0) {
    console.log(chalk.red(`X ${info}`));
    logErrors(errors);
  } else {
    console.log(chalk.green(`✓ ${info}`));
  }
  if (recs) logRecommendations(recs);
}

export function logErrors(errors: ZodIssue[]) {
  errors.forEach(error => {
    // @ts-expect-error need to filter by code.
    if (error.received) {
      console.log(
        chalk.red(
          // @ts-expect-error need to filter by code.
          `- ${error.path} (${error.message}) received '${error.received}' expected '${error.expected}'`,
        ),
      );
    } else {
      console.log(chalk.red(`- ${error.path} (${error.message})`));
    }
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

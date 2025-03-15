import chalk from 'chalk';
import { PackageValidationRec } from '../types/Package.js';
import { ZodIssue } from 'zod';
import { logEnable, logDisable } from '../helpers/utils.js';

export class Logger {
  static debug: boolean = false;

  static log(...args: any) {
    if (this.debug) console.log(...args);
  }

  static logEnable() {
    logEnable();
    return (this.debug = true);
  }

  static logDisable() {
    logDisable();
    return (this.debug = false);
  }

  static logErrors(errors: ZodIssue[]) {
    errors.forEach(error => {
      // @ts-expect-error need to filter by code.
      if (error.received) {
        this.log(
          chalk.red(
            // @ts-expect-error need to filter by code.
            `- ${error.path} (${error.message}) received '${error.received}' expected '${error.expected}'`,
          ),
        );
      } else {
        this.log(chalk.red(`- ${error.path} (${error.message})`));
      }
    });
  }

  static logRecommendations(recs: PackageValidationRec[]) {
    recs.forEach(rec => {
      this.log(chalk.yellow(`- ${rec.field} ${rec.rec}`));
    });
  }

  static logReport(info: string, errors?: ZodIssue[], recs?: PackageValidationRec[]) {
    if (errors && errors.length > 0) {
      this.log(chalk.red(`X ${info}`));
      this.logErrors(errors);
    } else {
      this.log(chalk.green(`✓ ${info}`));
    }
    if (recs) this.logRecommendations(recs);
  }
}

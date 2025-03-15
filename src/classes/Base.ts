import { Logger } from './Logger.js';
import { PackageValidationRec } from '../types/Package.js';
import { ZodIssue } from 'zod';

export class Base {
  get debug(): boolean {
    return Logger.debug;
  }

  log(...args: any) {
    Logger.log(...args);
  }

  logEnable() {
    Logger.logEnable();
  }

  logDisable() {
    Logger.logDisable();
  }

  logErrors(errors: ZodIssue[]) {
    Logger.logErrors(errors);
  }

  logRecommendations(recs: PackageValidationRec[]) {
    Logger.logRecommendations(recs);
  }

  logReport(info: string, errors?: ZodIssue[], recs?: PackageValidationRec[]) {
    Logger.logReport(info, errors, recs);
  }
}

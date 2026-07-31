import os from 'os';
import path from 'path';
import { PackageInterface } from '../types/Package.js';
import { SystemType } from '../types/SystemType.js';
import { getSystem } from './utilsLocal.js';

// Default per-platform install directories (see specification.md's "App directory"/"Apps
// directory"/"Plugins directory"/"Presets directory"/"Projects directory"/"Templates directory"
// sections) plus package-relative path construction. Deliberately separate from fs.ts's generic
// primitives - this module is entirely about *which* path to use, never about touching the
// filesystem.

export function dirApp(dirName = 'open-audio-stack') {
  if (getSystem() === SystemType.Win) return process.env.APPDATA || path.join(os.homedir(), dirName);
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Library', 'Preferences', dirName);
  return path.join(os.homedir(), '.local', 'share', dirName);
}

export function dirApps() {
  if (getSystem() === SystemType.Win) return path.join(os.homedir(), 'AppData', 'Local', 'Programs');
  else if (getSystem() === SystemType.Mac) return path.join('/Applications');
  return path.join('/usr', 'local', 'bin');
}

export function dirPackage(pkg: PackageInterface) {
  const parts: string[] = pkg.slug.split('/');
  parts.push(pkg.version);
  return path.join(...parts);
}

export function dirPlugins() {
  if (getSystem() === SystemType.Win)
    return process.env['ProgramFiles(x86)'] || path.join('C:', 'Program Files (x86)', 'Common Files');
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Library', 'Audio', 'Plug-ins');
  // Under $HOME rather than the system-wide /usr/local/lib, matching the spec - this keeps the
  // default writable without elevation, consistent with the unprivileged archive-install path
  // (see ManagerLocal.install()).
  return path.join(os.homedir(), 'usr', 'local', 'lib');
}

export function dirPresets() {
  if (getSystem() === SystemType.Win) return path.join(os.homedir(), 'Documents', 'VST3 Presets');
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Library', 'Audio', 'Presets');
  return path.join(os.homedir(), '.vst3', 'presets');
}

export function dirProjects() {
  // Windows throws permissions errors if you scan hidden folders
  // Therefore set to a more specific path than Documents
  if (getSystem() === SystemType.Win) return path.join(os.homedir(), 'Documents', 'Audio');
  else if (getSystem() === SystemType.Mac) return path.join(os.homedir(), 'Documents', 'Audio');
  return path.join(os.homedir(), 'Documents', 'Audio');
}

export function dirTemplates() {
  return path.join(os.homedir(), 'Documents', 'Audio Templates');
}

export function getPlatform() {
  if (getSystem() === SystemType.Win) return SystemType.Win;
  else if (getSystem() === SystemType.Mac) return SystemType.Mac;
  return SystemType.Linux;
}

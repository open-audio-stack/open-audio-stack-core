import { isValidVersion, toSlug } from './utils.js';
import { licenses } from '../types/License.js';
import { PluginTypeOption, pluginTypes } from '../types/PluginType.js';
import { PresetTypeOption, presetTypes } from '../types/PresetType.js';
import { ProjectTypeOption, projectTypes } from '../types/ProjectType.js';
import { RegistryType } from '../types/Registry.js';

// Deliberately not the `inquirer` package's own Question type - core has no interactive-prompt
// dependency (previously it depended on `inquirer` directly, which pulled a CLI/UX concern into
// this isomorphic browser/server library - see review.md item 5). This shape happens to line up
// with what most JS prompt libraries (inquirer included) expect for a single question, so a CLI
// can typically pass these straight through, but it's defined here independently.
export interface CreateQuestion {
  name: string;
  type: 'input' | 'list';
  message: string;
  default?: string;
  choices?: readonly { name: string; value: string; description?: string }[];
  validate?: (value: string) => boolean;
  filter?: (value: string) => unknown;
}

// The org/package/version questions needed to identify a new package before anything else can be
// asked (e.g. `packageVersionQuestions()` below needs `org`/`pkg` to compute its own defaults).
export function createPackageQuestions(): CreateQuestion[] {
  return [
    {
      name: 'org',
      type: 'input',
      message: 'Org id',
      default: 'org-name',
      validate: (value: string) => value === toSlug(value),
    },
    {
      name: 'package',
      type: 'input',
      message: 'Package id',
      default: 'package-name',
      validate: (value: string) => value === toSlug(value),
    },
    {
      name: 'version',
      type: 'input',
      message: 'Package version',
      default: '1.0.0',
      validate: (value: string) => isValidVersion(value),
    },
  ];
}

// The remaining package version fields (see specification.md "Packages fields to populate") -
// parameterized by registry type and the org/package answered via createPackageQuestions() above,
// since several defaults (url/audio/image) are derived from them.
export function createPackageVersionQuestions(type: RegistryType, org: string, pkg: string): CreateQuestion[] {
  let types: PluginTypeOption[] | PresetTypeOption[] | ProjectTypeOption[] = pluginTypes;
  if (type === RegistryType.Presets) {
    types = presetTypes;
  } else if (type === RegistryType.Projects) {
    types = projectTypes;
  }
  return [
    { name: 'name', type: 'input', message: 'Package name' },
    { name: 'author', type: 'input', message: 'Author name' },
    { name: 'description', type: 'input', message: 'Description' },
    { name: 'license', type: 'list', message: 'License', choices: licenses },
    { name: 'type', type: 'list', message: 'Type', choices: types },
    {
      name: 'tags',
      type: 'input',
      message: 'Tags (comma-separated)',
      filter: (input: string) =>
        input
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
    },
    {
      name: 'url',
      type: 'input',
      message: 'Website url',
      default: `https://github.com/${org}/${pkg}`,
    },
    {
      name: 'donate',
      type: 'input',
      message: 'Donation url',
    },
    {
      name: 'audio',
      type: 'input',
      message: 'Audio preview url',
      default: `https://open-audio-stack.github.io/open-audio-stack-registry/${type}/${org}/${pkg}/${pkg}.flac`,
    },
    {
      name: 'image',
      type: 'input',
      message: 'Image preview url',
      default: `https://open-audio-stack.github.io/open-audio-stack-registry/${type}/${org}/${pkg}/${pkg}.jpg`,
    },
    { name: 'date', type: 'input', message: 'Date released', default: new Date().toISOString() },
    { name: 'changes', type: 'input', message: 'List of changes' },
  ];
}

import { expect, test } from 'vitest';
import { createPackageQuestions, createPackageVersionQuestions } from '../../src/helpers/createQuestions';
import { RegistryType } from '../../src/types/Registry';
import { toSlug, isValidVersion } from '../../src/helpers/utils';

test('createPackageQuestions validates org/package as slugs and version as semver', () => {
  const questions = createPackageQuestions();
  const org = questions.find(q => q.name === 'org');
  const pkg = questions.find(q => q.name === 'package');
  const version = questions.find(q => q.name === 'version');

  expect(org?.validate?.('my-org')).toEqual(true);
  expect(org?.validate?.('My Org')).toEqual(false);
  expect(pkg?.validate?.('my-package')).toEqual(true);
  expect(pkg?.validate?.('My Package')).toEqual(false);
  expect(version?.validate?.('1.0.0')).toEqual(true);
  expect(version?.validate?.('not-a-version')).toEqual(false);

  // Sanity check against the underlying helpers directly, so this test fails if their behavior
  // ever diverges from what these questions assume.
  expect(org?.validate?.('my-org')).toEqual('my-org' === toSlug('my-org'));
  expect(version?.validate?.('1.0.0')).toEqual(isValidVersion('1.0.0'));
});

test('createPackageQuestions tags filter splits and trims a comma-separated string', () => {
  // Tags live on createPackageVersionQuestions, not createPackageQuestions - covered below.
  const questions = createPackageVersionQuestions(RegistryType.Plugins, 'test-org', 'test-plugin');
  const tags = questions.find(q => q.name === 'tags');
  expect(tags?.filter?.('Synth, Modulation,  Effect ,')).toEqual(['Synth', 'Modulation', 'Effect']);
});

test('createPackageVersionQuestions derives url/audio/image defaults from type/org/package', () => {
  const questions = createPackageVersionQuestions(RegistryType.Plugins, 'surge-synthesizer', 'surge');
  expect(questions.find(q => q.name === 'url')?.default).toEqual('https://github.com/surge-synthesizer/surge');
  expect(questions.find(q => q.name === 'audio')?.default).toEqual(
    'https://open-audio-stack.github.io/open-audio-stack-registry/plugins/surge-synthesizer/surge/surge.flac',
  );
  expect(questions.find(q => q.name === 'image')?.default).toEqual(
    'https://open-audio-stack.github.io/open-audio-stack-registry/plugins/surge-synthesizer/surge/surge.jpg',
  );
});

test('createPackageVersionQuestions offers type-specific choices per registry type', () => {
  const pluginChoices = createPackageVersionQuestions(RegistryType.Plugins, 'org', 'pkg').find(
    q => q.name === 'type',
  )?.choices;
  const presetChoices = createPackageVersionQuestions(RegistryType.Presets, 'org', 'pkg').find(
    q => q.name === 'type',
  )?.choices;
  const projectChoices = createPackageVersionQuestions(RegistryType.Projects, 'org', 'pkg').find(
    q => q.name === 'type',
  )?.choices;

  expect(pluginChoices?.length).toBeGreaterThan(0);
  expect(presetChoices?.length).toBeGreaterThan(0);
  expect(projectChoices?.length).toBeGreaterThan(0);
  expect(pluginChoices).not.toEqual(presetChoices);
  expect(presetChoices).not.toEqual(projectChoices);
});

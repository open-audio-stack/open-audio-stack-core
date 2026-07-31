// This module used to hold every filesystem-adjacent helper in one 670+ line file, conflating
// generic fs primitives, archive extraction/creation, OS-default path resolution, and privileged
// installer execution - impossible to reason about (or import) one concern without the others.
// Split into fs.ts / archive.ts / paths.ts / installer.ts along those seams; this file now only
// re-exports all four, so every existing import of '../helpers/file.js' keeps working unchanged.
// New code should prefer importing directly from whichever of the four actually matches what it
// needs.
export * from './fs.js';
export * from './archive.js';
export * from './paths.js';
export * from './installer.js';

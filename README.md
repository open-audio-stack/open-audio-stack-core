# open-audio-stack-core

![Test](https://github.com/open-audio-stack/open-audio-stack-core/workflows/Test/badge.svg)
![Release](https://github.com/open-audio-stack/open-audio-stack-core/workflows/Release/badge.svg)

Common package shared across Open Audio Stack compatible registries, command-line tools, apps and websites for handling installing DAW VST plugin dependencies.

## Features

High-level classes enable use without writing business-logic:

- Config - Set and get common configuration types, formats, values, paths and urls.
- ConfigLocal - All the Config functionality including ability to load and save configuration to a json file.
- Package - Create a new package to add to a registry.
- PackageManager - Search, filter and get packages from a registry.
- PluginManager - Plugin-specific version of PackageManager.
- PluginManagerLocal - Plugin-specific install/uninstall locally and scan directories for existing plugins.
- PresetManager - Preset-specific version of PackageManager.
- ProjectManager - Project-specific version of PackageManager.
- Registry - Create an audio package registry with packages and files.

Low-level methods/utilities for more custom/advanced implementations:

- api - get different types of data using web requests
- config - default config options
- file - directory and file helper functions
- package - validation and recommendation functions
- registry - default registry config
- utils - various other utilities

## Installation

To install the common package, run the command:

    npm install @open-audio-stack/core

Import the package using:

    import { Registry } from '@open-audio-stack/core';

Then use the available methods as normal.

## Developer information

Open Audio Stack Core was built using:

- NodeJS 20.x
- TypeScript 5.x
- eslint 9.x
- prettier 3.x
- vitest 1.x

## Developer installation

To install, build and run code locally, first install dependencies:

    npm install

## Developer usage

Run dev commands using:

    npm run lint
    npm run format
    npm run dev
    npm test

Create a production build using:

    npm run build

## Developer deployment

This package is versioned using git tags:

    npm version patch
    git push && git push origin --tags

GitHub Actions will automatically publish the package to npm:

    https://www.npmjs.com/package/@open-audio-stack/core

## Contact

For more information please contact kmturley

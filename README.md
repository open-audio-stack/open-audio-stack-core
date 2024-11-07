# open-audio-stack-core

![Test](https://github.com/open-audio-stack/open-audio-stack-core/workflows/Test/badge.svg)
![Release](https://github.com/open-audio-stack/open-audio-stack-core/workflows/Release/badge.svg)

Common methods package shared across Open Audio Stack compatible registries, command-line tools, apps and websites for handling installing DAW VST plugin dependencies.

## Features

- Config - Get types, formats, values, paths and urls.
- FileSystem - Perform operations on directories and files.
- Registry - Create an audio registry with packages and files.

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

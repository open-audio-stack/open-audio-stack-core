# open-audio-stack-core

Open-source audio plugin management software using:

- NodeJS 20.x
- TypeScript 5.x
- eslint 9.x
- prettier 3.x
- vitest 1.x

## Installation

Install dependencies using:

    npm install

## Usage

Run dev commands using:

    npm run lint
    npm run format
    npm run dev
    npm test

Create a build using:

    npm run build

## Deployment

This package is versioned using git tags:

    npm version patch
    git push && git push origin --tags

GitHub Actions will automatically publish the package to npm:

    https://www.npmjs.com/package/@open-audio-stack/core

## Contact

For more information please contact kmturley

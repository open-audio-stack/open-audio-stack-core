# Instructions for Agents: Contributing to Open Audio Stack Registry via Command Line

## Fork the Repository

Use GitHub CLI to fork the repository:

```bash
gh repo fork open-audio-stack/open-audio-stack-core --clone
cd open-audio-stack-core
```

## Setup

Install dependencies:

```bash
npm install
```

## Create a Branch

Create and switch to a new branch for your contribution. Use descriptive branch names following these conventions:

- `feature/feature-name` for new features
- `fix/fix-name` for bug fixes

Example:

```bash
git checkout -b feature/feature-name
```

## Contributing functional changes

Edit TypeScript/JavaScript files in the codebase using your tools. Ensure changes follow the project's coding standards, enforced by Prettier (.prettierrc.json) for code formatting, ESLint (eslint.config.js) for linting, and Vitest (vitest.config.ts) for the test suite.

Then proceed to the Validate Changes, Commit Changes, Push Changes, and Submit Pull Request sections below.

## Validate Changes

Run formatting, linting, tests and build commands to validate your changes:

```bash
npm run format
npm run lint
npm test
npm run build
```

Verify that all tests pass and there are no linting errors.

Return a summary of the changes to the user for them to read/review.

Ask user for [Y/N] approval to proceed to Commit Changes, Push Changes and Submit Pull Request.

- If the user answers Yes or Y, continue to Commit Changes, Push Changes and Submit Pull Request steps below.
- If the user answers No or N, ask them what changes they would like to make, and iterate until they are happy with the result, each time asking for approval to continue to next steps.

## Commit Changes

Stage and commit your changes. Use descriptive commit messages with prefixes following these conventions:

- `[feature]` for new features
- `[fix]` for bug fixes

Example:

```bash
git add .
git commit -m "[feature] Feature name. Add descriptive commit message for your changes"
```

## Push Changes

Push the branch to your forked repository:

```bash
git push origin feature/feature-name
```

## Submit Pull Request

Create a pull request using GitHub CLI:

```bash
gh pr create --title "Your PR Title" --body "Description of your changes"
```

## Conclusion

Respond to the user that the contribution has been submitted for review, with the url to the PR for them to monitor updates.

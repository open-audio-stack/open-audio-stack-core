# Open Audio Stack \- Manager \- Specification 1.0.0

**Date**: 15th November 2024  
**Status:** Review  
**Authors:**

- Kim T, StudioRack
- Arthur P, OwlPlug

This document is licensed under a [Creative Commons 4.0](https://creativecommons.org/licenses/by/4.0/) license.

## Introduction

This document describes an open specification for audio package managers. The goal is to enable interoperability between multiple audio platforms and the software installed locally on users computers.

![Open Audio Stack - Manager - Specification 1.0.0](https://raw.githubusercontent.com/open-audio-stack/open-audio-stack-registry/refs/heads/main/src/assets/open-audio-stack-diagram-manager.svg)

This dotted line in the diagram indicates the scope of this specification. A separate specification focuses on the upper area of the diagram: audio package metadata stored in a registry: [Open Audio Stack - Registry - Specification 1.0.0](https://github.com/open-audio-stack/open-audio-stack-registry/blob/main/specification.md)

### Definitions

- **Developer** \- Audio plugin developer who releases audio plugins.
- **Package** \- Collection of files to be distributed along with metadata about those files:
  - **Plugin** \- File which adds digital signal processing or sound synthesis to audio software.
  - **Preset** \- File containing predefined settings for an audio plugin.
  - **Project** \- File which contains song data, in a format only for a specific DAW(s).
- **Registry** \- Database containing audio package metadata with an API for read access.
- **Audio plugin manager** \- Search, view, download and install audio plugins, using one of:
  - **App \-** Via a native application.
  - **Cli \-** Via a command-line tool.
  - **Website \-** Via a web page within a web browser.
  - **Plugin** \- Via an existing audio plugin, install additional features/presets.
- **User \-** Musician using a computer to run audio software.
  - **Digital Audio Workstation (DAW)** \- software that allows users to record, edit, and produce audio.

### Problems solved

Musicians install Digital Audio Workstation (DAW) software on computers to record and arrange music. They add audio plugins such as instruments and effects to extend their DAW functionality. The method of downloading and installing audio plugins differs depending on the company or individual distributing the software. The result is:

1. Manual installation of audio plugins.
2. Broken links.
3. Unsupported systems/versions.
4. Different audio plugin formats.
5. Insecure binaries.
6. Multiple audio plugin manager accounts.
7. Multiple audio plugin managers with different interfaces and settings.
8. No version control.
9. No portability to other systems or collaborators.
10. Difficulty expanding plugins with new presets.

This specification aims to solve these issues by applying established conventions and best practices from other well-known software package managers such as [npm](https://docs.npmjs.com), [pip](https://pip.pypa.io/en/stable/), [maven](https://maven.apache.org), [gems](https://guides.rubygems.org) and [composer](https://getcomposer.org). Audio plugin managers adopting this specification will be compatible and interoperable with each other. Musicians using compatible audio plugin managers will benefit from well-established package management features.

### Use cases

1. Search for audio plugins and filter by metadata attributes such as platform or license.
2. View audio plugin details such as description and size and preview image and audio.
3. Download and install audio plugins, including specific versions.
4. Install plugin versions automatically choosing the best version of each for your system.
5. Download and extract files into configured directories.
6. Extend existing plugin functionality by installing additional presets.

## Manager

Package managers are usually applications or command-line tools, which connect to a Registry API to search/download and install packages. Package managers can be built in any technology or language, but they must be able to run on a Users machine (Linux, Mac, Win) and call the Registry API (as defined in[Open Audio Stack - Registry - Specification 1.0.0](https://docs.google.com/document/d/14ljz4XNXr02xgdDHksPMl2vaM-Jn-YnJ_VzI1WsvSKQ/edit)).

Package managers can be implemented as full applications with user interfaces, command-line tools or scripts. Websites can choose to implement part of this specification to make packages discoverable and easy-to-download. This specification includes examples demonstrating how it could be implemented as a command-line tool..

### Global features

| Field   | Type   | Description                                                                                        | Example                      |
| :------ | :----- | :------------------------------------------------------------------------------------------------- | :--------------------------- |
| name    | string | Manager name brand-specific                                                                        | `"Open Audio Stack Manager"` |
| version | string | [Semantic Version](https://semver.org) which is different from the Registry specification version. | `"1.0.0"`                    |

#### Get help

```
$ manager --help
Usage: manager [options] [command]
Options:
  -V, --version              output the version number
  -h, --help                 display help for command
```

#### Get version

```
$ manager --version
1.0.0
```

#### Log output

`$ manager <command> --log`

#### JSON output

`$ manager <command> --json`

## Config

A configuration should be populated by default when the manager first runs, but the user can override the config when needed. Config is stored in memory, ConfigLocal can be used to persist config as a file. Access to config is important for debugging issues with the manager. Configuration could be stored in any format, `JSON` format is preferred for simple read/write operations with structured data.

Config should be versioned separately from the manager program, so the manager can check if an old version exists and upgrade it to match a new configuration format.

```
$ manager config get version
1.0.0
```

All config values can be set/get by the manager interface. For example:

```
$ manager config set <key> <value>
$ manager config get <key>
```

### Registries

List of registries which will be searched for packages. This allows brands/companies to each own a package list, but registries are combined for the user consuming the list.

| Field   | Type   | Description                                                         | Example                                                          |
| :------ | :----- | :------------------------------------------------------------------ | :--------------------------------------------------------------- |
| name    | string | Registry name                                                       | `"Open Audio Registry"`                                          |
| url     | string | Registry url                                                        | `"https://open-audio-stack.github.io/open-audio-stack-registry"` |
| version | string | Optional - see [Registry versioning](#registry-versioning-optional) | `"v1"`                                                           |

#### Get registries

```
$ manager config get registries
[
  { "name": "Open Audio Registry", "url": "https://open-audio-stack.github.io/open-audio-stack-registry"}
]
```

#### Registry versioning (optional)

Registries can expose versioned endpoints to avoid breaking changes when introducing new features. When a registry is versioned, managers should append the version segment to the registry root when requesting resources.

Example: Registry root `https://example.com/registry` with version `v1` → fetch plugin list at `https://example.com/registry/v1/plugins`.

Versioning is optional — if Managers call the root url, they will get the latest version by default.

### App directory

Defaults to manager installation directory.

| Platform         | Path                                                           |
| :--------------- | :------------------------------------------------------------- |
| Linux platform   | `$HOME/.local/share/$manager`                                  |
| Mac platform     | `$HOME/Library/Preferences/$manager`                           |
| Windows platform | `%AppData%\$manager` (falls back to `$HOME\$manager` if unset) |

The Windows path uses the `%AppData%` environment variable (typically `$HOME\AppData\Roaming`) rather than `$HOME` directly, matching the platform-idiomatic location for per-user application data on Windows.

### Apps directory

Defaults to manager installation directory.

| Platform         | Path                           |
| :--------------- | :----------------------------- |
| Linux platform   | `/usr/local/bin`               |
| Mac platform     | `/Applications`                |
| Windows platform | `$HOME\AppData\Local\Programs` |

### Plugins directory

Default plugin installation path per platform. Users are able to change the path via settings.

| Platform         | Path                                          |
| :--------------- | :-------------------------------------------- |
| Linux platform   | `$HOME/usr/local/lib/$format`                 |
| Mac platform     | `$HOME/Library/Audio/Plug-ins/$format`        |
| Windows platform | `C:\Program Files (x86)\Common Files\$format` |

Recommended sub-directory hierarchy to keep installed plugins separate and easier to manage:  
`$plugin_dir/$plugin_slug/$plugin_version/`

For example:  
`$plugin_dir/surge-synthesizer/surge/1.3.1/surge.vst3`

#### Get plugin directory

```
$ manager config get pluginsDir
/Users/username/Library/Audio/Plug-ins
```

### Presets directory

Default preset installation path per platform. Users are able to change the path via settings.

| Platform         | Path                           |
| :--------------- | :----------------------------- |
| Linux platform   | `$HOME/.vst3/presets`          |
| Mac platform     | `$HOME/Library/Audio/Presets`  |
| Windows platform | `$HOME/Documents/VST3 Presets` |

Recommended sub-directory hierarchy to keep installed plugins separate and easier to manage:  
`$preset_dir/$preset_slug/$preset_version/`

For example:  
`$preset_dir/jh/floating-rhodes/1.0.0/`

#### Get preset directory

```
$ manager config get presetsDir
/Users/username/Library/Audio/Presets
```

### Projects directory

Default project installation path per platform. Users are able to change the path via settings.

| Platform         | Path                    |
| :--------------- | :---------------------- |
| Mac platform     | `$HOME/Documents/Audio` |
| Linux platform   | `$HOME/Documents/Audio` |
| Windows platform | `$HOME\Documents\Audio` |

Recommended sub-directory hierarchy to keep installed plugins separate and easier to manage:  
`$project_dir/$project_slug/$project_version/`

For example:  
`$project_dir/kmt/banwer/1.0.1/Banwer.als`

#### Get project directory

```
$ manager config get projectsDir
/Users/username/Documents/Audio
```

### Templates directory

Default destination for packages cloned from a template via the `clone` command (see [Clone](#clone)). Same path across all platforms. Users are able to change the path via settings.

| Platform         | Path                              |
| :--------------- | :-------------------------------- |
| Mac platform     | `$HOME/Documents/Audio Templates` |
| Linux platform   | `$HOME/Documents/Audio Templates` |
| Windows platform | `$HOME\Documents\Audio Templates` |

Recommended sub-directory hierarchy to keep cloned packages separate and easier to manage:  
`$templates_dir/$registryType/$package_slug/`

For example:  
`$templates_dir/plugins/kmt/banwer/`

#### Get templates directory

```
$ manager config get templatesDir
/Users/username/Documents/Audio Templates
```

### Desired platform

Overrides the manager's auto-detected architecture and/or system, so users can install packages for a different platform than the one the manager is actually running as (see [Platform and Architecture Detection](#platform-and-architecture-detection)). Unset by default — the manager falls back to auto-detection. An unrecognized value is treated the same as unset, rather than causing every package to be filtered out as incompatible.

| Field        | Type   | Description                              | Example |
| :----------- | :----- | :--------------------------------------- | :------ |
| architecture | string | Overrides the auto-detected architecture | `"x64"` |
| system       | string | Overrides the auto-detected system       | `"win"` |

#### Set and get desired platform

```
$ manager config set architecture x64
$ manager config set system win
$ manager config get architecture
x64
```

## Manager

These functions can be run in a browser as part of a website or app. They do not rely on access to the local machine. ManagerLocal extends this with methods to install and manage plugins locally.

### Registry type

Registries can contain different types of packages, more could be added in the future. We recommend limiting user-facing features to a single registry type for each operation. This ensures the operation is performed quickly as the registry scales.

| Name     | Value      |
| :------- | :--------- |
| Apps     | `apps`     |
| Plugins  | `plugins`  |
| Presets  | `presets`  |
| Projects | `projects` |

### Computed package fields

In addition to the author-supplied fields (see [Packages fields to populate](#packages-fields-to-populate)), managers add the following read-only fields to package version metadata. These are computed by the manager or registry build process, not authored by the package developer, and should not be included when creating or cloning a new package.

| Field       | Type    | Description                                                                                                                                                                                                                                                         |
| :---------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `installed` | boolean | Set by [Manager Local](#manager-local) commands (install/uninstall/scan) to indicate whether this version is currently installed. Omitted rather than `false` when not installed.                                                                                   |
| `verified`  | boolean | Set when every one of the version's `files[].url` entries resolves to a domain matching the package's org (e.g. `github.com/<org>/...` or `<org>.<tld>`), as a signal that the files are actually published by the package's own author rather than a third party.  |
| `downloads` | number  | Rollup of `files[].downloads` (itself sourced from the hosting platform's download counts, e.g. GitHub Releases), recomputed at registry build time. Omitted when zero/not yet fetched, rather than `0`, so it doesn't need to be confused with "no downloads yet." |

### Platform and Architecture Detection

Managers should detect the current architecture as the default platform for installing plugins. However, users should be allowed to override this to install plugins from another architecture when necessary.

The compatibility rules for plugin architectures depend entirely on the Host (DAW). Plugin Managers cannot always rely on the system's "Runtime Platform" (which would be ARM64 for a native app) because the user's DAW might be running in a different mode.

For example, on Windows 11 on Arm devices supporting ARM64EC (Emulation Compatible), if the Plugin Manager is running natively as ARM64, but the DAW is running in emulated x64 mode, installing a native ARM64 plugin will result in the DAW failing to see or load the plugin. In this case, the user should set the Desired Platform to x64 to install x64-compatible plugins.

The best practice is to allow users to manually set a Desired Platform in the manager's configuration, overriding the auto-detected architecture — see [Desired platform](#desired-platform).

### Network requests

Every network request a manager makes — syncing a registry, downloading a package file, downloading a clone template — should apply a request timeout and a limited retry policy, rather than waiting indefinitely for a response:

1. Apply a timeout (a default in the 10-30 second range is reasonable) to each request. If it elapses, abort the request and treat it as a failed attempt.
2. Retry failed attempts a small, bounded number of times (once is sufficient) with a short backoff between attempts, but only for failures that are plausibly transient: the request couldn't be sent/receive a response at all (including a timeout as in step 1), or the server responded with a 5xx status.
3. Do not retry a 4xx response — it will fail identically on every attempt (e.g. a template repository that doesn't exist, or a malformed registry URL), so retrying only delays surfacing a real, permanent error to the caller.
4. Once retries are exhausted, treat the request as failed for the purposes of the calling operation's own error handling — e.g. a registry that never responds within its retry budget is "unreachable" for [Sync logic](#sync-logic) step 2.1 just as if the connection had been refused immediately.

### Sync

The purpose of remote syncing is to call multiple registries and aggregate remote packages into a precalculated index/cache, which speeds up any subsequent operations performed by the app. In most cases the manager will use this feature internally and the user will not need to use it directly.

#### Sync logic

1. For each Registry in the configuration
2. Call the API to load the list of package metadata
   1. If the registry cannot be reached, or its response is invalid, record the failure and continue with the remaining registries rather than aborting the whole sync
3. Combine packages from multiple registries into a single index
   1. Run Package Validation (see [Scan logic](#scan-logic)) on each package version; if a version is invalid, record the failure and skip just that version, rather than aborting the rest of the sync
4. Store package metadata in-memory as a read-only cache to speed up the app instead of making API requests constantly. Manager Local can store the aggregated registry on disk.

#### Sync example

`$ manager <registryType> sync`

### Filter

Filter the registry package index by field and matching value. Returns an array of matching packages.  
`$ manager <registryType> filter <field> <value>`

### Search

Search the registry package index for lazy matching query. Returns an array of matching packages. Default query searches slug, `name`, `description` and `tags` fields.  
`$ manager <registryType> search <query>`

### List

Returns all the packages cached in the registry.
`$ manager <registryType> list`
`$ manager <registryType> list --installed`

### Get by slug

Get a package metadata and list of versions.  
`$ manager <registryType> get <slug>`

### Get by slug and version

Get a specific package version metadata.  
`$ manager <registryType> get <slug>@<version>`

### Reset

Resets/clears the synced package list.  
`$ manager <registryType> reset`

## Manager Local

These functions have to have access to the local machine. They cannot be run inside a browser.

### Scan

The purpose of directory scanning is to aggregate all locally installed packages into a precalculated index/cache, which speeds up any subsequent operations performed by the app. In most cases the manager will use this feature internally and the user will not need to use it directly.

#### Scan logic

1. Load package directories: any directory under the type directory (e.g. `$plugin_dir`) whose name is a valid semantic version, regardless of the format-specific subdirectory nesting above it. For example, both of the following are discovered as version directories for `surge-synthesizer/surge` `1.3.1`:
   1. `$plugin_dir/VST/surge-synthesizer/surge/1.3.1`
   2. `$plugin_dir/VST3/surge-synthesizer/surge/1.3.1`
2. For each directory check to see if an `index.json` metadata file exists.
   1. If `index.json` does not exist, look up the package in the manager's already-synced registry index (populated by a prior [Sync](#sync) call — scan does not itself call the Registry API)
      1. If the package/version is not found in the synced index, add the directory to the list of unsupported packages
      2. If found, write its metadata to `index.json` in that directory and add it to the list of supported packages
   2. If `index.json` does exist, run Package Validation to ensure it is a valid package file. This checks the json is in the correct structure, with the required attributes and valid values.
      1. If not valid, add the directory to the list of unsupported packages (this does not abort scanning the remaining directories)
      2. If valid, add to list of supported packages
3. Store package metadata either in-memory or on disk. For example a file can serve as a read-only cache to speed up the app, instead of syncing the files/folders constantly. The list of unsupported package directories is available separately (not persisted as part of the package index).

Package Validation has two tiers: structural errors (missing/invalid required fields - these determine supported vs unsupported, as above) and non-fatal recommendations (e.g. "should support arm64", "should use the jpg format", "requires manual installation steps, consider .deb and .rpm instead"). Recommendations don't affect whether a package is treated as supported - they're surfaced to package authors (e.g. via a report/lint command) as suggestions for improving a package's compatibility and metadata quality.

#### Scan example

`$ manager <registryType> scan`

### Install package

Install a package by slug. Optionally including a version.

#### Install logic

1. Get package version metadata from package index/cache:
   1. If package not found, return error
   2. If package version not found return error
2. Check to see if package is already installed:
   1. If installed, return package information
3. Filter package files that match the current architecture and system:
   1. If Linux, check whether `dpkg` or `rpm` command is supported
   2. If the system does not support the command, filter out those file formats
   3. If no files match, return error
4. Check to see program has Admin privileges:
   1. If a compatible archive-type file is available, elevated privileges are not required - archives can be extracted into a user-owned plugin directory. Skip to step 5.
   2. Otherwise (only installer-type files are available), if the program does not have Admin privileges, ask for elevated privileges to the filesystem before continuing
5. Download each matching file to a temporary directory.
6. Check the hash against the metadata sha256.
   1. If hash and sha256 do not match, return error
7. Check if the file type is installer
   1. Run the installer process and wait for it to complete before continuing
   2. When the process ends, run a local package scan to see if the installation finished correctly.
8. Check if the file type is archive:
   1. Extract the archive to a temporary directory
   2. Move files into the final directory e.g.
   3. `$plugin_dir/VST/surge-synthesizer/surge/1.3.1`
   4. `$plugin_dir/VST3/surge-synthesizer/surge/1.3.1`
9. For each moved file, save the package metadata into the same directory as `index.json`, which speeds up local scanning.
10. Return package information with `installed = true`
11. Optionally re-run the scan feature to update the package index/cache.

#### Install example

`$ manager <registryType> install <slug>@<version>`

### Uninstall package

Uninstall a package by slug. Optionally including a version.

#### Uninstall logic

1. Get package version metadata from package index/cache:
   1. If package not found, return error
   2. If package version not found return error
2. Check to see if package is installed:
   1. If not installed, return error
3. Check to see program has Admin privileges:
   1. If not ask for elevated privileges to filesystem
4. Remove the specific package version directory and files
   1. `$plugin_dir/VST/surge-synthesizer/surge/1.3.1`
   2. `$plugin_dir/VST3/surge-synthesizer/surge/1.3.1`
5. If the package directory does not contain other versions then remove it
   1. `$plugin_dir/VST/surge-synthesizer/surge`
   2. `$plugin_dir/VST3/surge-synthesizer/surge`
6. If the org directory does not contain other packages then remove it
   1. `$plugin_dir/VST/surge-synthesizer`
   2. `$plugin_dir/VST3/surge-synthesizer`
7. Return package information with `installed = false` or the attribute removed.
8. Optionally re-run the scan feature to update the package index/cache.

#### Uninstall example

`$ manager <registryType> uninstall <slug>@<version>`

### Clone

Clone a new package from a template hosted as a GitHub repository. This is intended for local plugin/preset/project development: starting a new package from a template, customizing an existing plugin's build, or packaging a plugin whose binaries require manual installation.

Any public `owner/repo` on GitHub can be used as a template — there is no curated template registry. This keeps the feature generic: it works for official Open Audio Stack starter templates as well as a developer's own fork or an unrelated repository they want a local working copy of.

#### Clone logic

1. Check to see if the package target directory already exists (`$templates_dir/$registryType/$slug`, see [Templates directory](#templates-directory))
   1. If it exists, return a "package already exists" error
   2. If not, proceed to next step
2. Resolve the template repository's default branch, download it as an archive to a temporary directory, and extract its contents
   1. If the template repository cannot be found, return an error
3. Move the extracted template contents into the package target directory

#### Clone example

`$ manager <registryType> clone <slug> <template>`

- `<slug>` — the org/package slug for the new package being created, e.g. `kmt/banwer`
- `<template>` — a GitHub `owner/repo` slug identifying the template repository to clone, e.g. `open-audio-stack/open-audio-stack-template-plugin`

#### Packages fields to populate

Once cloned, the following fields should be populated by hand in the package's own metadata file:

- `audio`
- `author`
- `changes`
- `date`
- `description`
- `donate`
- `image`
- `files`
- `license`
- `name`
- `tags`
- `type`
- `url`

### Create

Create new package metadata. Prompts the developer for package details, then writes them to `<path>/index.json`.

`<path>` is optional:

- `<path>` — write `index.json` into this directory
- None — use the current directory

#### Create logic

1. Prompt for and collect the package fields listed below.
2. `files` (and, for Presets/Projects, `plugins`) start empty — there is no built/published release yet for a package that's just been created. Populating them is a separate, later step, once a release has been built (see [Install package](#install-package) for the metadata shape a release's `files` entries must have).
3. Validate the collected fields and report any errors/recommendations to the developer (e.g. missing `files`) — these are informational, not fatal. A newly created package is expected to be incomplete.
4. Write the metadata to `<path>/index.json`, creating `<path>` if it doesn't already exist.

#### Create example

`$ manager <registryType> create <path>`

#### Project fields to populate

- `audio`
- `author`
- `changes`
- `date`
- `description`
- `donate`
- `image`
- `files`
- `license`
- `plugins`
- `name`
- `tags`
- `type`
- `url`

### Open

#### Open logic

- Get package version metadata from package index/cache:
  - If package not found, return error
  - If package version not found return error
- Check to see if package is installed:
  - If not installed, return error
- Filter package `files` entries that match the current architecture and system
- Find a `files` entry that includes an `open` field and matches the system/architecture:
  - If no compatible `files` entry with an `open` field is found, return error
- Execute the file/command specified in that `files` entry's `open` field.

Note: The manager will use the `open` field defined in the package metadata (per-file) to determine the correct entry point for the target system.

Open any package by slug and version:
`$ manager <registryType> open <slug>@<version>`

## Project

For all project commands the \<`path`\> option is optional:

- \<`path`\> \- Will use this project file
- None \- Will use the current directory and filename `index.json`

### Install and add dependency

#### Install and add dependency logic

- Get dependency package version metadata from package index/cache:
  - If package not found, return error
  - If package version not found return error
- If the local project path is not supplied use the current directory, then load and parse as json.
  - If not valid json, return error.
- Validate local package json file structure, fields and values.
  - If not validate structure, fields or values, return error.
- Check whether the dependency has already been added at the requested version.
  - If already added, the requested end state already holds - return the local package file as-is without error (idempotent success), rather than re-installing or re-adding it.
- Install dependency using same logic as package install
- Add dependency to the local package file and save.

#### Install and add dependency example

`$ manager project install <plugin-slug>@<plugin-version> <path>`

### Install existing dependencies

Install existing dependencies listed inside a package json file.

#### Install dependencies logic

- If path is not supplied use the current directory, then load and parse as json.
  - If not valid json, return error.
- Validate package json file structure, fields and values.
  - If not validate structure, fields or values, return error.
- Loop through dependency packages and install each one.
  - Return any errors following package installation logic.
- If all dependencies are installed successfully, return parsed json data.

#### Install dependencies example

`$ manager project install <registryType> <path>`  
`$ manager project install plugins`

### Uninstall and remove dependency

#### Uninstall and remove dependency logic

- If the local project path is not supplied use the current directory, then load and parse as json.
  - If not valid json, return error.
- Validate local package json file structure, fields and values.
  - If not validate structure, fields or values, return error.
- Check whether the dependency exists in the local package json file.
  - If not a dependency, the requested end state already holds - return the local package file as-is without error (idempotent success, mirroring [Install and add dependency logic](#install-and-add-dependency-logic)), rather than treating it as a failure.
- Uninstall dependency using same logic as package uninstall
- Remove dependency from the local package file and save.

#### Uninstall and remove dependency example

`$ manager project uninstall <plugin-slug>@<plugin-version> <path>`

### Uninstall dependencies

Uninstall dependencies listed inside a package json file.

#### Uninstall dependencies logic

- If path is not supplied use the current directory, then load and parse as json.
  - If not valid json, return error.
- Validate package json file structure, fields and values.
  - If not validate structure, fields or values, return error.
- Loop through dependency packages and uninstall each one.
  - Return any errors following package uninstall logic.
- If all dependencies are uninstalled successfully, return parsed json data.

#### Uninstall dependencies example

`$ manager project uninstall <registryType> <path>`  
`$ manager project uninstall plugins`

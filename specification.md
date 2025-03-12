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

#### Debug output

`$ manager <command> --debug`

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

| Field | Type   | Description   | Example                                                          |
| :---- | :----- | :------------ | :--------------------------------------------------------------- |
| name  | string | Registry name | `"Open Audio Registry"`                                          |
| url   | string | Registry url  | `"https://open-audio-stack.github.io/open-audio-stack-registry"` |

#### Get registries

```
$ manager config get registries
[
  { "name": "Open Audio Registry", "url": "https://open-audio-stack.github.io/open-audio-stack-registry"}
]
```

### App directory

Defaults to manager installation directory.

| Platform         | Path                                 |
| :--------------- | :----------------------------------- |
| Linux platform   | `$HOME/.local/share/$manager`        |
| Mac platform     | `$HOME/Library/Preferences/$manager` |
| Windows platform | `$HOME\$manager`                     |

### Plugins directory

Default plugin installation path per platform. Users are able to change the path via settings.

| Platform         | Path                                                                                |
| :--------------- | :---------------------------------------------------------------------------------- |
| Linux platform   | `$HOME/usr/local/lib/$format`                                                       |
| Mac platform     | `$HOME/Library/Audio/Plug-ins/$format`                                              |
| Windows platform | `C:\Program Files\Common Files\$format C:\Program Files (x86)\Common Files\$format` |

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

## Manager

These functions can be run in a browser as part of a website or app. They do not rely on access to the local machine. ManagerLocal extends this with methods to install and manage plugins locally.

### Registry type

Registries can contain different types of packages, more could be added in the future. We recommend limiting user-facing features to a single registry type for each operation. This ensures the operation is performed quickly as the registry scales.

| Name     | Value      |
| :------- | :--------- |
| Plugins  | `plugins`  |
| Presets  | `presets`  |
| Projects | `projects` |

### Sync

The purpose of remote syncing is to call multiple registries and aggregate remote packages into a precalculated index/cache, which speeds up any subsequent operations performed by the app. In most cases the manager will use this feature internally and the user will not need to use it directly.

#### Sync logic

1. For each Registry in the configuration
2. Call the API to load the list of package metadata
3. Combine packages from multiple registries into a single index
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

1. Load package directories which match the following patterns:
   1. `$plugin_dir/VST/surge-synthesizer/surge/1.3.1`
   2. `$plugin_dir/VST3/surge-synthesizer/surge/1.3.1`
2. For each directory check to see if an `index.json` metadata file exists.
   1. If `index.json` does not exist, search for package in Registry API
      1. If package not found in Registry, add to list of unsupported packages
      2. If package found in Registry, download metadata.json as `index.json` file and add to list of supported packages
   2. If `index.json` does exist, run Package Validation to ensure it is a valid package file. This checks the json is in the correct structure, with the required attributes and valid values.
      1. If not valid, add to list of unsupported packages
      2. If valid, add to list of supported packages
3. Store package metadata either in-memory or on disk. For example a file can serve as a read-only cache to speed up the app, instead of syncing the files/folders constantly.

#### Sync example

`$ manager <registryType> scan`

### Install package

Install a package by slug. Optionally including a version.

#### Install logic

1. Get package version metadata from package index/cache:
   1. If package not found, return error
   2. If package version not found return error
2. Check to see if package is already installed:
   1. If installed, return package information
3. Check to see program has Admin privileges:
   1. If not ask for elevated privileges to filesystem
4. Filter package files that match the current architecture and system:
   1. If Linux, check whether `dpkg` or `rpm` command is supported
   2. If the system does not support the command, filter out those file formats
   3. If no files match, return error
5. Download each matching file to a temporary directory.
6. Check the hash against the metadata sha256.
   1. If hash and sha256 do not match, return error
7. Check if the file type is installer
   1. Run the process in a separate thread
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

Clone a new package from a template.

#### Clone logic

1. Check to see if package is already installed
   1. If installed, return package already installed message
   2. If not installed, proceed to next step
2. Download package template to temporary directory and extract contents
3. Clone package target directory, move template contents into package directory.

#### Clone example

`$ manager <registryType> clone <slug> <template>`

#### Packages fields to populate

- `audio`
- `author`
- `changes`
- `date`
- `description`
- `image`
- `files`
- `license`
- `name`
- `tags`
- `type`
- `url`

### Create

Create new package metadata:  
`$ manager <registryType> create <path>`

#### Project fields to populate

- `audio`
- `author`
- `changes`
- `date`
- `description`
- `image`
- `files`
- `license`
- `plugins`
- `name`
- `tags`
- `type`
- `url`

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
- Check whether the dependency has already been added.
  - If already added, then return error.
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
  - If not a dependency, then return error.
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

### Open project

#### Open project logic

- If path is not supplied use the current directory, then load and parse as json.
  - If not valid json, return error.
- Validate package json file structure, fields and values.
  - If not validate structure, fields or values, return error.
- If the package.open field is set, then open the file from the command line.
  - If not set, return missing field error.

Open project by slug:  
`$ manager project open <path>`

## Tools

Provide the ability to run other tools, scripts on a package and make the output useful/readable.

#### Types

- Clapinfo: [https://github.com/free-audio/clap-info](https://github.com/free-audio/clap-info)
- Pluginval: [https://github.com/Tracktion/pluginval](https://github.com/Tracktion/pluginval)
- Steinberg validator: [built within the VST3 SDK](https://steinbergmedia.github.io/vst3_dev_portal/pages/What+is+the+VST+3+SDK/Validator.html)

### Install

`$ manager tool install <type>`

### Uninstall

`$ manager tool uninstall <type>`

### Run

`$ manager tool run <type> <tool-specific-options>`

# Contributing Guide

## Prerequisites

- Install the latest version of [Bun](https://github.com/oven-sh/bun/releases)
- It is recommended to use VS Code with the [Prettier](https://prettier.io/docs/en/editors) extension

## Local Setup

### Setup

Clone this repository and cd into it, then set up a package by running one of
the following commands:

- `bun setup <repo>` to set up a motivationisdead repository
- `bun setup <user>/<repo>` to set up another user's repository

After that, all following commands must be run from the root of the package, so
don't forget to cd into `packages/<pkg>`.

### Run

- `bun dev` to run the main example
- `bun examples/<file>` to run a specific example

### Lint

- `bun lint` to lint the changed files (i.e. `git diff origin/main`)
- `bun lint -a` to lint **all** tracked files (i.e. `git ls-files`)
- `bun lint -f` to **fix** linting errors that can be fixed automatically
- `bun lint -fa` to **fix all** tracked files

### Test

- `bun test` to run all tests
- `bun test tests/<file>` to run a specific test

### Release

- `bun release` to simulate a release (dry run)
- `bun release -p` to build the production version and release it on GitHub, npm
  and JSR (not recommended to run locally)

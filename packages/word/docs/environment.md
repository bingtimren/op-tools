# Development Environment

Development environment setups.

## Run scripts

See `npm run info` for run scripts information.

## Version Control (git)

Commitizen is used for drafting commit messages in proper format ([conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). 

Commitlint is used to enforce the commit message format.

Package 'husky' is used to install git hooks. `husky install` is run as a npm postinstall hook. Hook scripts are put under /.husky and /config/git-hooks directory.

The following hooks is set:

- pre-commit:
  - Prevent direct commit into certain branches, including "main", "production", "staging", etc.
  - Run tests
- commit-msg:
  - Invoke commitlint to check commit message

## Documentation

markdown-folder-to-html is used to build mark-downs in the /doc dir into HTML. 

dependency-cruiser is used to build a dependency graph. See /config/.dependency-cruiser.js for configuration details. Tsconfig still needs to point to the tsconfig.json under root (otherwise not work). Path to tests shall be excluded in "options.exclude.path". 

typedoc is used for API documentation. See /config/typedoc.json for configurations. Point tsconfig to /config/tsconfig-build.json to exclude tests. See [here](https://tsdoc.org/pages/tags/packagedocumentation/) for tag references.

Coverage document is generated by "cov" run script.

Run script 'doc:gh-fix' is to create an empty file to allow dependency-cruiser properly publish to github-page.

Run `npm run doc` to build documents.

Run `npm run doc:publish` to publish to github page.

## Building Setups

"tsconfig.json" is the base configuration for the project. It sets up the follows:

- "include", "rootDir", "outDor" - from "src" to "build"
- "target" - es5 for browser compatibility
- "incremental" - for faster build
- "strict" - always

"config/tsconfig-build.json" is the configuration for actual building:

- it excludes "**/*.test.ts" from building
  
The reason for separating out the configuration for building, is that the 'tsconfig.json' is used by VS Code. If tests are excluded in the root tsconfig.json, VS Code would not syntax check the tests, which is not convenient.

Additional tools for Typescript building includes:

- [ts-purity]: used to clean up build dir when source file is removed - not currently supported out-of-box from typescript.

## Debug & Testing

See [./debug-testing.md] for details

## Linting and Prettier

Use eslint and typescript-eslint for Typescript code linting. See [here](https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md) for initial setup. See [here](https://eslint.org/docs/user-guide/configuring/) for eslint configuration reference. See [here](https://eslint.org/docs/rules/) for standard eslint rules.

Use both esline and prettier for code formatting. In addition, use eslint-plugin-prettier and eslint-config-prettier to integrate prettier into eslint, make eslint invoke prettier for test and fixing (so no need to run prettier separately).

## Releasing

standard-version is used 




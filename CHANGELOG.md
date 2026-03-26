# Changelog

All notable changes to the RootSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-03-26

### Fixed
*   **NPM Pipeline Conflict:** Fixed an `EPUBLISHCONFLICT` in the `npm-publish.yml` CI workflow by explicitly bumping the `package.json` version and aligning the workspace scopes. The `@johnvteixido/rootspace` package now successfully traverses the GitHub Packages registry.

## [1.2.0] - 2026-03-26

### Added
*   **Dual License Model**: Ratified the AGPLv3 and Commercial Licensing separation, codifying the rules in `LICENSE` and `COMMERCIAL_LICENSE.md`.
*   **Wiki Architecture:** Massively expanded the GitHub Wiki with official documentation for `Architecture`, `API-Reference`, `Deployment-Guide`, and `Development-Setup`.
*   **Branch Protection**: `main` is now locked down with PR requirements, CI Status Check gates, and mandatory signed commits.
*   **Projects**: Integrated a GitHub Projects backlog to manage roadmap features.

### Security
*   **CVE-2026-32314**: Upgraded `yamux` multiplexer in the Rust core from `0.13.3` to `0.13.10` to mitigate a critical remote panic vulnerability via malformed SYN+Data frames.
*   **CVE-2026-33672**: Upgraded `picomatch` in the Node.js API to `4.0.3` to prevent POSIX Character Class method injection.

### Fixed
*   **Docker Pipeline Builder**: Bumped target Rust builder image to `rust:bookworm` to resolve failing glibc / `time` crate Minimum Supported Rust Version (MSRV) errors.
*   **GitHub Actions Outdates**: Replaced deprecated `actions/checkout@v6` placeholders with the supported `v4` to restore functionality across all workflows.

## [1.0.0] - Genesis Swarm

*   Initial release of the RootSpace Rust daemon.
*   Implementation of the experimental `wasmtime` agent executor.
*   Vite + React 3D Dashboard preview.

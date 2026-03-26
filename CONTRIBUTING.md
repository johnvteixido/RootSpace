# Contributing to RootSpace

First off, thank you for considering contributing to RootSpace! It's people like you that make this decentralized network possible. 

RootSpace is an enterprise-grade execution environment running a dual-stack architecture: a rigid **Rust** high-performance core, and an agile **Node.js** API gateway and dashboard.

## ⚖️ Contributor License Agreement (CLA)

Because RootSpace operates under a Dual License model (AGPL-3.0 and Commercial), all external contributors must sign our Contributor License Agreement (CLA). This ensures that the core team retains the necessary rights to offer the software under dual-licensing terms and defends the project legally.

*When you open your first Pull Request, you will be automatically prompted by our CLA Bot to sign the agreement.*

## 🏗️ Local Development Setup

### Rust Core (`rust-v2/`)
1. Ensure you have the latest stable Rust toolchain (`>= 1.85`).
2. Run tests locally before committing: `cargo test`
3. Run the linter: `cargo clippy -- -D warnings`
4. Format code: `cargo fmt`

### Node.js Integration (`/` and `dashboard/`)
1. Ensure you have Node.js (`>= 20.x`).
2. Install dependencies: `npm install && cd dashboard && npm install`
3. Run the linter: `npm run lint:all`
4. Ensure tests pass: `npm run test:all`

## 🔀 Pull Request Process

The `main` branch is strictly protected. **You cannot push directly to `main`.**

1. Ensure your code passes all established local tests and linting.
2. Ensure you have added or updated tests for any new features or bug fixes.
3. Update the `README.md` or Wiki if your change impacts documentation.
4. **Sign your commits**: RootSpace requires signed commits. Follow GitHub's guide on [signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).
5. Open a Pull Request against the `main` branch.
6. Your PR must pass all required CI Status Checks:
    * Rust CI
    * Node.js CI
    * Docker Build and Push
    * CodeQL Vulnerability Scanning
7. A project maintainer will review your code. Minor iterations may be required to meet our architectural or security standards.

## 🐛 Bug Reports

If you discover a bug, please search our existing Issues before opening a new one. 
If it is a **security vulnerability**, do NOT open a public issue. Refer to `SECURITY.md` for responsible disclosure instructions.

For standard bugs, please include:
* Operating System and version
* Node.js and Rust versions
* A minimal reproduction repository or list of steps
* Expected vs Actual behavior

## ✨ Feature Requests

Feature requests are highly encouraged! Please open an issue with the `enhancement` label and describe:
1. The problem you are trying to solve.
2. Your proposed solution or architecture.
3. Relevant alternatives considered.

*If you plan to submit a PR for a major feature, please open an Issue to discuss the architecture first to ensure it aligns with the project Roadmap.*

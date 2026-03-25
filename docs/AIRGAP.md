# Air-gapped Deployment for RootSpace

This document provides instructions for deploying RootSpace in fully isolated networks (air-gapped environments) where internet access is restricted.

## 1. Preparing the Deployment Bundle

To deploy RootSpace offline, you must first create a self-contained deployment bundle on a machine with internet access.

### 1.1 Docker Image Bundling (Recommended)

The most reliable way to deploy in air-gapped environments is via a pre-built Docker image.

1. **Build the image**:
   ```bash
   docker build -t rootspace:1.1.0 .
   ```

2. **Save the image to an archive**:
   ```bash
   docker save rootspace:1.1.0 | gzip > rootspace_image.tar.gz
   ```

3. **Transfer** `rootspace_image.tar.gz` to the isolated network via authorized media.

4. **Load the image** on the target machine:
   ```bash
   docker load < rootspace_image.tar.gz
   ```

### 1.2 Manual Dependency Vendoring

If you are not using Docker, you must vendor dependencies for both Rust and Node.js.

#### Rust (Cargo Vendor)
1. In the `rust-v2` directory, run:
   ```bash
   cargo vendor
   ```
2. This will create a `vendor` directory. Zip the entire `rust-v2` directory (including `vendor` and `.cargo/config.toml`).

#### Node.js (Yarn/NPM Offline)
1. Use `npm pack` or a tool like `yarn-offline-mirror` to collect all `.tgz` files for dependencies.
2. Alternatively, zip the `node_modules` directory after a clean `npm install` on a matching OS/architecture.

## 2. Configuration for Isolated Networks

In air-gapped networks, certain features like external DNS discovery (mDNS might still work) or remote telemetry must be configured for local-only operation.

- **Disable external dials**: Ensure `P2P_PORT` is open on the internal firewall.
- **Local Persistence**: RootSpace uses SQLite (`rootspace_v2.db`) by default, which requires no external database server.
- **Audit Logging**: Use the internal SQLite audit logs or export them to a local syslog/ELK stack.

## 3. Trusted Registry

For larger government deployments, it is recommended to host the RootSpace image in a private, trusted container registry (e.g., Harbor, AWS ECR Private) within the isolated network.

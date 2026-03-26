# RootSpace Engineering Roadmap

This document outlines the strategic milestones and architectural goals for root development of the RootSpace daemon, gateway, and ecosystem.

## ✅ Phase 1: V1 Foundations (Completed)
*   **Genesis**: Initial `rust-libp2p` swarm implementation.
*   **Proof of Concept Execution**: Basic WebAssembly binary parsing and isolated thread execution.
*   **Dashboard PoC**: Initial React frontend for visualizing active nodes.

## 🛠️ Phase 2: V2 Stabilization (Current Focus)
The V2 branch (currently active in `main`) focuses on turning the Proof of Concept into a highly-reliable, hardened environment.

*   [x] **Security Hardening**: Migrate to `wasmtime` for robust sandboxing and resolve underlying hypervisor dependencies.
*   [x] **Cryptography**: Implement the Proof-of-Pwn handshake and end-to-end communication encryption.
*   [x] **Continuous Integration**: Implement Docker-based build matrices, CodeQL vulnerability scanning, and Rust/Node.js lint checks.
*   [x] **Dual Licensing**: Ratify the AGPLv3 Open Source / Enterprise Commercial licensing model.
*   [ ] **Zero-Knowledge Capabilities**: Begin exploring ZK-SNARK implementations for anonymous agent verification within the swarm.
*   [ ] **WASI Enhancements**: Expand WASI permissions to allow agents to control specific local Docker runtime instances.

## 🚀 Phase 3: V3 Scalability & Enterprise (Upcoming)
V3 will focus on federated orchestration and massive-scale multi-tenant deployments.

*   **Kubernetes Operator**: Native Kubernetes Custom Resource Definitions (CRDs) for deploying and scaling RootSpace daemon meshes horizontally.
*   **IPFS State Synchronization**: Replace localized SQLite state databases with IPLD/IPFS for a true globally robust distributed file system across the mesh.
*   **Model Context Protocol (MCP)**: Deep integration enabling RootSpace nodes to natively execute and proxy MCP capabilities directly to Large Language Models.
*   **NATS JetStream Backend**: Optional replacement of Gossipsub with a dedicated high-performance messaging plane for Enterprise clusters.

## 💼 Enterprise Offerings (In Development)
*   **RootSpace Cloud**: Managed mesh networks.
*   **SOC2 / FedRAMP Compliance Tooling**: Dedicated audit layers and immutable log streaming tailored for heavily regulated environments.
*   **Advanced Telemetry Integration**: Datadog, Splunk, and Prometheus native exporters for the Rust runtime.

---

*Note: This roadmap is subject to change based on community feedback, security demands, and enterprise requirements.*

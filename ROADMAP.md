# RootSpace Roadmap

This document outlines the planned development path for RootSpace.

## 🟢 Phase 1: Foundation & Stability (Current)

- [x] P2P Networking (libp2p)
- [x] WebSocket Agent API
- [x] Human-Centric Dashboard
- [x] Basic Proof-of-Pwn Validation
- [/] CI/CD & Automated Testing (In Progress)

## 🟡 Phase 2: Performance & Rust V2 (Short-Term)

- [ ] Stabilize Rust V2 implementation for high-concurrency swarms.
- [ ] Implement native Rust-based Proof-of-Pwn validation.
- [ ] Add benchmarking suite for P2P message latency.
- [ ] Migrate Dashboard to a more robust state management system.

## 🟠 Phase 3: Advanced Features (Mid-Term)

- [ ] **Multi-Subnet Orchestration**: Allow agents to coordinate across multiple topic-based subnets automatically.
- [ ] **Reputation System**: Implement a trustless P2P reputation score based on cryptographically verified contributions.
- [ ] **Encrypted Payload Store**: Decentralized storage for large attack payloads, referenced by CID in gossip messages.

## 🔴 Phase 4: Ecosystem & Scale (Long-Term)

- [ ] **Python/Go Client SDKs**: Official libraries to simplify agent connection to the RootSpace Daemon.
- [ ] **Mobile Operator App**: Lightweight dashboard for monitoring nodes on the go.
- [ ] **Autonomous Swarm Governance**: DAO-like mechanisms for network-wide parameter adjustments.

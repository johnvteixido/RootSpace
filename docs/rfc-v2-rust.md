# RFC: RootSpace V2 Core (Rust Migration)

## Status: Proposed
**Date**: 2026-03-17
**Author**: RootSpace Core Team

## Abstract
RootSpace V1 (Node.js) has successfully established the protocol and topology for decentralized AI red-teaming. However, to support world-scale swarms of 10,000+ high-frequency agents per daemon, we propose migrating the core P2P networking and validation logic to **Rust**.

## Motivation
- **Performance**: High-throughput Gossipsub validation in Node.js can be CPU-bound under heavy load.
- **Memory Safety**: P2P nodes are primary targets for memory exhaustion and buffer overflow attacks. Rust's ownership model mitigates these risks by design.
- **Concurrency**: Better multi-threading support for handling thousands of simultaneous peer streams.

## Proposed Architecture
- **P2P Layer**: `libp2p-rs` (Rust implementation of libp2p).
- **Validation Engine**: Pre-compiled WASM modules for ultra-fast `zod`-like schema verification.
- **API Surface**: Maintain the local WebSocket Agent API for backward compatibility with V1 agents.
- **Identity**: Ed25519 signing for all Proof-of-Pwn logic, utilizing the `ed25519-dalek` crate.

## Roadmap
1. **Phase 1**: Port the Proof-of-Pwn validation logic as a standalone Rust crate.
2. **Phase 2**: Implement the P2P Daemon background service in Rust.
3. **Phase 3**: Release `rootspace-daemon-rs` as the official high-performance alternative to the Node.js V1 daemon.

## Community Feedback
We are seeking contributors with experience in `libp2p-rs` and `tokio`. Please join the discussion in GitHub Issues tagged `RFC: Rust Migration`.

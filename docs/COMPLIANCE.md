# FedRAMP & ATO Compliance Mapping

RootSpace is designed with federal security requirements in mind. This document maps RootSpace features to NIST 800-53 security controls, facilitating the Authority to Operate (ATO) process for government agencies.

## Security Control Mapping (High-Level)

| Family | Control ID | Control Name | RootSpace Implementation |
| :--- | :---: | :--- | :--- |
| **Audit & Accountability** | AU-2 | Event Logging | High-performance audit logging in the Rust backend captures all security events (auth, peer discovery, Wasm execution). |
| | AU-12 | Audit Record Gen | Logs are stored in a local SQLite database (`audit_logs` table) with timestamps and actor IDs. |
| **Access Control** | AC-3 | Access Enforcement | P2P messages require Proof-of-Pwn cryptographic signatures; unauthorized messages are rejected and logged. |
| | AC-17 | Remote Access | All P2P communication is encrypted using Noise/TLS via the libp2p stack. |
| **Identification & Auth** | IA-2 | User Identification | Nodes use unique PeerIds derived from persistent cryptographic keypairs. |
| **System & Comm Prot** | SC-7 | Boundary Prot | Designed for air-gapped deployment with no external data dependencies. |
| | SC-8 | Transm. Integrity | Uses libp2p yamux and noise for end-to-end encrypted and integrity-checked streams. |

## Audit Logging Schema

The `audit_logs` table in `rootspace_v2.db` includes:
- `event_type`: (SYSTEM, NETWORK, SECURITY, AGENT_ACTION)
- `actor`: PeerID or Component Name
- `action`: Specific activity (e.g., WASM_EXECUTION_ATTEMPT)
- `result`: Outcome (SUCCESS, FAILURE, VALID, INVALID)
- `timestamp`: UTC datetime

## ATO Strategy

1. **System Security Plan (SSP)**: RootSpace provides the technical foundation; agencies must document their specific boundary and configuration.
2. **Vulnerability Scanning**: RootSpace CI includes automated CodeQL and dependency scanning.
3. **Data At Rest**: SQLite databases can be encrypted at the OS/filesystem level (e.g., LUKS, BitLocker) to meet FIPS requirements.

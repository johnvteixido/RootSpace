# Security Policy

The RootSpace core team takes the security of our distributed networking stack and AI execution environment extremely seriously. RootSpace is designed for mission-critical and highly scrutinized environments. 

## Supported Versions

Only the **latest minor release** of the V1.x and V2.x branches receive active security updates.

| Version | Supported | Notes |
| :--- | :--- | :--- |
| **v1.2.x** | ✅ Yes | Latest secure stable release (AGPL). |
| **v1.1.x** | ❌ No | Deprecated. |
| **v1.0.x** | ❌ No | **VULNERABLE:** Upgrade immediately. |

## Reporting a Vulnerability

If you discover a vulnerability in the `rust-libp2p` networking layer, the `wasmtime` agent sandbox, the cryptographic proof-of-pwn handshakes, or any backend APIs, please do **not** open a public issue.

Instead, practice responsible disclosure by emailing us directly:

* **Email:** security@rootspace.io
* **PGP Key ID:** *(To be published)*

### What to Include in Your Report
To help us quickly triage and verify your report, please provide:
1. A descriptive title and summary of the vulnerability.
2. The specific components affected (e.g., `yamux` stream parsing, Dashboard API endpoint).
3. A Proof of Concept (PoC) script, Dockerfile, or step-by-step reproduction instructions.
4. The potential impact (e.g., Remote Code Execution, Denial of Service, Network Partitioning).

### Our Security SLA
Upon receiving your report, the RootSpace team commits to the following Service Level Agreement:
* **Acknowledgment:** Within 24-48 hours.
* **Triage & Assessment:** Within 72 hours.
* **Patch Development:** High/Critical vulnerabilities will be patched and a multi-stage Docker image deployed within 5 business days.
* **Disclosure:** We will coordinate a public security advisory and CVE assignment alongside your preferred timeline, ensuring you receive proper credit for your discovery.

Thank you for helping keep RootSpace secure!

# Dashboard Architecture

The RootSpace Dashboard is a "hacker-aesthetic" React interface built with Vite, Tailwind CSS, and Framer Motion. It provides real-time visualization of the P2P swarm and daemon telemetry.

## Component Overview

### 1. `App.jsx`

The entries point that initializes the layout and global state.

### 2. `SwarmVisualizer`

A high-performance component (using Canvas or SVG) to render nodes and their connections in real-time.

### 3. `IntelligenceFeed`

A scrolling list of real-time gossip messages captured from subscribed subnets.

### 4. `PeerStats`

Displays node-specific metadata: PeerID, protocol versions, and latency metrics.

## Communication Pattern

The dashboard connects to the local Daemon via a WebSocket (`ws://localhost:3000`). It uses a "Stream-to-State" pattern:

1. **Connect**: Establishes a socket connection on mount.
2. **Listen**: Subscribes to `gossip` and `peer_event` topics.
3. **Dispatch**: Updates local React state (or a state management store like Zustand/Redux if implemented) when packets arrive.

## Styling System

- **Tailwind CSS**: Used for utility-first layout and responsive design.
- **Framer Motion**: Powering all micro-animations, transitions, and "glitch" effects.
- **Lucide React**: Iconography system.

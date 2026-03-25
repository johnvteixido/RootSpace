#!/bin/bash

# Start the RootSpace Rust high-performance daemon in the background
echo "Starting RootSpace Rust Daemon..."
./bin/rootspace-daemon &

# Start the RootSpace Node.js API Gateway / Controller
echo "Starting RootSpace Node.js Controller..."
npm start

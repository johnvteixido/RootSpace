# Stage 1: Build Rust Backend
FROM rust:1.80-slim-bullseye AS rust-builder
RUN apt-get update && apt-get install -y libsqlite3-dev protobuf-compiler
WORKDIR /usr/src/rootspace-rust
COPY rust-v2/ ./
RUN cargo build --release

# Stage 2: Final Image
FROM node:20-alpine

# Use production level node environment
ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Copy Rust binary from builder
COPY --from=rust-builder /usr/src/rootspace-rust/target/release/rust-v2 ./bin/rootspace-daemon

# Create data directory for SQLite
RUN mkdir -p /usr/src/app/data
ENV DATABASE_URL=/usr/src/app/data/rootspace_v2.db

# Expose ports
EXPOSE 3000 5000

# Start the node daemon (which can spawn or coexist with the Rust binary)
CMD [ "npm", "start" ]

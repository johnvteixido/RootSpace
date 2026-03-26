# Stage 1: Build Rust Backend
FROM rust:1.85-bookworm AS rust-builder
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    protobuf-compiler \
    libclang-dev \
    clang \
    cmake \
    build-essential

WORKDIR /usr/src/rootspace-rust
COPY rust-v2/ ./
RUN cargo build --release

# Stage 2: Final Image
FROM node:20-bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libsqlite3-0 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Copy Rust binary from builder
RUN mkdir -p ./bin
COPY --from=rust-builder /usr/src/rootspace-rust/target/release/rust-v2 ./bin/rootspace-daemon
RUN chmod +x ./bin/rootspace-daemon
RUN chmod +x ./scripts/start-daemon.sh

# Create data directory for SQLite
RUN mkdir -p /usr/src/app/data
ENV DATABASE_URL=/usr/src/app/data/rootspace_v2.db

# Expose ports
EXPOSE 3000 5000

# Start both Node and Rust daemons
CMD [ "./scripts/start-daemon.sh" ]

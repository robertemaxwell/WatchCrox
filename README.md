# WatchCrox - Luxury Watch Marketplace with Blockchain Escrow

WatchCrox is a peer-to-peer marketplace for luxury watches that uses blockchain-based escrow to ensure secure transactions between buyers and sellers.

## Monorepo Structure

This project is set up as a monorepo using pnpm workspaces. The repository contains the following packages:

1. **packages/smart-contracts**: Ethereum/Polygon-based escrow service for handling transactions
2. **packages/backend**: Rails API server for the marketplace functionality
3. **packages/frontend**: React application for the user interface

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- pnpm (v8+)
- Ruby 3.0+ and Rails 7.0+
- PostgreSQL
- MetaMask Browser Extension

### Install Dependencies

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install all dependencies
pnpm install
```

### Development

You can run each project individually:

```bash
# Frontend
pnpm frontend dev

# Smart Contracts
pnpm smart-contracts dev

# Backend (uses regular Rails commands)
cd packages/backend
bundle install
rails db:create db:migrate db:seed
rails s -p 3000
```

Or run all projects in parallel:

```bash
pnpm dev
```

### Building

```bash
# Build everything
pnpm build

# Build specific package
pnpm frontend build
```

### Testing

```bash
# Test everything
pnpm test

# Test specific package
pnpm smart-contracts test
```

## Features

- User authentication via MetaMask wallet
- Browse and search luxury watch listings
- Create listings with multiple images
- Secure transactions via blockchain escrow
- Dispute resolution system
- Transaction history and status tracking

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
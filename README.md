# Tick It

Tick It is a decentralized event ticketing platform designed to remove intermediaries, reduce fraud, and give users full ownership of their tickets. Built as a dApp on the Aptos blockchain, Tick It uses wallet-based authentication and on-chain logic to make event creation and ticket purchases transparent and trustless.

The platform allows anyone to log in using their Petra wallet, explore ongoing and upcoming events, purchase tickets securely, or create and manage their own events without relying on centralized ticketing providers.

---

## Overview

Tick It focuses on three core ideas:

* Wallet-first authentication instead of traditional accounts
* On-chain ownership of tickets
* Simple, creator-friendly event management

All interactions are tied directly to the user’s wallet, ensuring authenticity and verifiable ownership.

---

## Features

* Wallet-based login using Petra Wallet
* View and explore available events
* Buy tickets directly through the connected wallet
* Create events with custom pricing, limits, and metadata
* Organizer control over event visibility and capacity
* Decentralized flow backed by Aptos smart contracts

---

## Tech Stack

* Frontend: React, TypeScript, Vite
* UI: shadcn/ui, Tailwind CSS
* Wallet Integration: Petra Wallet (Aptos)
* Blockchain: Aptos
* Backend: Node.js (API, indexing, orchestration)
* Networking: Axios + REST APIs

---

## Wallet Support

Supported wallets:

* Petra Wallet

If Petra is not installed, users are redirected to the official installation page.

---

## Project Structure (Simplified)

```
/src
 ├─ pages/        # Auth, dashboard, events
 ├─ components/   # UI and wallet components
 ├─ api/          # Backend API helpers
 ├─ utils/        # LocalStorage and shared utilities
 └─ main.tsx
```

---

## Environment Setup

Create a `.env` file in the root directory:

```
VITE_PUBLIC_BACKEND_URL=<your-backend-url>
```

---

## Running Locally

Install dependencies:

```bash
bun install
# or
npm install
```

Start the website locally:

```bash
bun dev
# or
npm run dev
```

---

## User Flow

1. User connects their Petra wallet
2. Wallet signature authenticates the session
3. User browses or creates events
4. Tickets are purchased through the wallet
5. Ticket ownership is tied to the wallet address

---

## Project Status

* Core authentication flow complete
* Event creation and ticket purchasing functional
* UI and on-chain optimizations ongoing

---

## Contributing

Built by Rupam Ghosh and Debasmit Bose
---

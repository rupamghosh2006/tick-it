Here’s a tightened, more technical README with clearer positioning, less repetition, and stronger protocol-level framing. You can drop it in directly.

---

# Tick It

**Tick It** is a decentralized event ticketing platform that eliminates intermediaries, prevents ticket fraud, and enforces fair resale rules using on-chain logic. Built as a dApp on the **Aptos blockchain**, it replaces fragile Web2 ticketing systems with verifiable ownership, deterministic rules, and wallet-native identity.

Tickets are issued as on-chain assets, owned and controlled directly by users’ wallets. No duplicated tickets, no opaque resales, no platform-level trust assumptions.

---

## Why Tick It

Traditional ticketing platforms fail at the protocol level:

* Tickets are duplicated or forged
* Scalping and black-market resales are unenforceable
* Ownership is opaque and platform-controlled
* Single points of failure compromise entire events

Tick It fixes this by moving **ownership, transfers, and rules on-chain**.

---

## Core Principles

* **Wallet-first identity**: No accounts, passwords, or fake users
* **On-chain ticket ownership**: Verifiable, non-duplicable tickets
* **Deterministic rules**: Transfers, pricing, and limits enforced by smart contracts
* **Web2-grade UX**: Familiar frontend backed by Web3 guarantees

---

## Features

* Petra wallet authentication
* Browse live and upcoming events
* Purchase tickets directly from the connected wallet
* Create events with:

  * Custom pricing
  * Supply limits
  * Metadata
* Organizer-controlled visibility and capacity
* Backend indexing for fast queries
* Aptos smart contracts as the single source of truth

---

## Architecture Overview

* **Frontend**
  Handles UX, wallet connection, and transaction initiation.

* **Blockchain (Aptos)**
  Mints tickets as unique on-chain assets and enforces ownership and transfer rules.

* **Backend (Express.js)**
  Indexes on-chain data, manages metadata, and orchestrates non-critical flows without custody or authority.

There are **no critical trust assumptions** placed on the backend.

---

## Tech Stack

### Frontend

* React + TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Axios
* Petra Wallet Adapter

### Blockchain

* Aptos
* Aptos TypeScript SDK

### Backend

* Node.js + Express
* MongoDB
* JWT-based session handling
* Nodemailer (email / OTP flows)
* QR code generation

---

## Wallet Support

* **Petra Wallet**

If Petra is not installed, users are redirected to the official installation page automatically.

---

## Environment Setup

Create a `.env` file in the frontend directory:

```env
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

Start the frontend:

```bash
bun dev
# or
npm run dev
```

Start the backend:

```bash
npm run start
```

---

## User Flow

1. User connects Petra wallet
2. Wallet signature authenticates the session
3. User browses or creates events
4. Ticket purchase is executed on-chain
5. Ticket ownership is permanently tied to the wallet address

---

## Project Status

* Wallet-based authentication complete
* Event creation and ticket purchasing live
* Backend indexing functional
* UI, contract hardening, and resale logic optimizations ongoing

---

## Contributors

**Rupam Ghosh** and **Debasmit Bose**

---

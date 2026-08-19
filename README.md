# stellar-pay

A high-performance payment terminal and account management interface for the Stellar blockchain network. Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, and the official Stellar Horizon SDK + Freighter wallet integration.

---

## Overview

stellar-pay is a specialized decentralized finance interface built for the Stellar White Belt Challenge. It connects to the Stellar Testnet (and Mainnet) via the Freighter wallet extension and provides real-time telemetry, address book registry, payment presets, balance verification, and on-chain transaction audits.

---

## Features

- **Wallet Orchestration**: Connect, disconnect, and auto-detect Freighter wallet identity with state persistence.
- **Horizon Network Telemetry**: Live network monitoring tracking the latest ledger sequence, base fee (stroops), and RPC latency.
- **Address Book Registry**: Local identity book allowing saved recipient aliases with quick-select transfer triggers.
- **Transmission Presets & Memo Templates**: Save and load reusable transaction memos and notes.
- **Safety Validations**: Client-side and on-chain balance checks, account activation checks, and insufficient funds prevention.
- **Smart History & Ledger Audit**: Real-time transaction history fetching from Horizon, automatically categorizing operations into DEBIT, CREDIT, and INTERNAL transfers.
- **Block Explorer Integration**: Direct links to Stellar Expert for on-chain verification and transaction hash validation.

---

## Technical Showcase

### Dashboard and Network Telemetry
Live network status, ledger updates, and available XLM balance:
![Dashboard](./images/dashboard.png)

### Transmission Execution Unit
Payment interface with destination address validation and quick-select presets:
![Payment Form](./images/payment-form.png)

### Transaction Confirmation
Execution feedback displaying ledger inclusion and transaction hash:
![Transaction Confirmation](./images/paymentconformation.png)

### Immutable Audit Log
Transaction history ledger with debits, credits, and timestamps:
![Ledger Audit](./images/payment-logs.png)

### Block Explorer Verification
On-chain confirmation and ledger inspection via Stellar Expert:
![Block Explorer](./images/payment-blockexplorer.png)

---

## Architecture and Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Blockchain Integration**:
  - `@stellar/stellar-sdk` (Horizon client & TransactionBuilder)
  - `@stellar/freighter-api` (Wallet authentication & signing)
- **Icons**: React Icons

---

## Prerequisites

- Node.js 18.18+ or later
- npm, pnpm, or yarn
- [Freighter Wallet](https://www.freighter.app/) browser extension configured for Stellar Testnet

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/prashilthul/stellar-pay.git
cd stellar-pay
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Build for production

```bash
npm run build
npm start
```

---

## Operational Guide

1. **Connect Wallet**: Click Connect Wallet to authenticate with the Freighter browser extension on Testnet.
2. **Fund Testnet Account**: If using a newly generated testnet account, fund it via Friendbot or the SDF Laboratory faucet.
3. **Send Payments**:
   - Provide a valid Stellar public key (`G...`) or select an entry from your Address Book.
   - Enter the XLM transfer amount and an optional text memo.
   - Submit and sign the transaction popup in Freighter.
4. **Inspect Transactions**: Review the transaction outcome and open the Stellar Expert link to view block confirmations.

---

## Project Structure

```
stellar-pay/
├── app/
│   ├── favicon.ico
│   ├── globals.css           # Tailwind CSS imports and custom utility classes
│   ├── layout.tsx            # Root layout with metadata and font configurations
│   └── page.tsx              # Main dashboard terminal combining all units
├── components/
│   ├── AccountInfo.tsx       # Signers, thresholds, and sequence number panel
│   ├── AddressBook.tsx       # Recipient alias manager with local persistence
│   ├── BalanceDisplay.tsx    # Live XLM balance card and currency formatting
│   ├── FeeEstimator.tsx      # Base fee calculation and network fee breakdown
│   ├── MemoTemplates.tsx     # Reusable memo selector and custom preset manager
│   ├── NetworkStatus.tsx     # Horizon RPC latency and ledger tracker
│   ├── PaymentForm.tsx       # Main transaction composer with Freighter signing
│   ├── QuickSend.tsx         # Fast transfer trigger component
│   ├── TransactionHistory.tsx# Horizon ledger audit log
│   └── WalletConnection.tsx  # Freighter connection modal and state toggle
├── lib/
│   └── stellar-helper.ts     # Horizon SDK wrapper, transaction builder, and network helpers
├── images/                   # Documentation screenshots and UI showcases
├── package.json
└── tsconfig.json
```

---

## License

MIT License

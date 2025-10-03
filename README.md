# Kana Perps CopyVault: Social Copy-Trading on Aptos

**Kana Perps CopyVault** is a decentralized social copy-trading platform built on the **Aptos Blockchain**, leveraging the **Kana Perps Central Limit Order Book (CLOB)** for superior trade execution. Users can securely allocate collateral into a smart contract "Vault" to automatically replicate the perpetual futures trades of successful, community-verified traders on the Kana Perps exchange.

## Features

* **Secure Vaults:** Users deposit $APT collateral into a non-custodial Move smart contract vault.
* **Automated Copy-Trading:** Real-time replication of a chosen trader's perpetual positions via an off-chain keeper service.
* **CLOB Superiority:** Trades are executed directly on the **Kana Perps CLOB**, ensuring minimal slippage and optimal pricing.
* **Trader Leaderboard:** Transparent performance metrics for all registered traders (Win Rate, Total Volume, Realized PnL).
* **Risk Management:** Users can set a `max_leverage` limit (1-20x) for their vault, overriding the trader's setting.

---

## Architecture

The application is a full-stack dApp, separating the presentation layer, on-chain logic, and off-chain market integration.

### Component Diagram

```mermaid
graph TD
    A[Frontend: Next.js] --> B(Aptos Wallet: Petra);
    A --> C(Kana Perps SDK);
    B --> D(Vault Contract);
    C --> D;
    subgraph Off-Chain Services
        E[Keeper/Backend Service] --> C;
        E --> D;
        F[Kana Perps REST/WS API] -- Data & Tx Payloads --> E;
    end
    D -- Events --> E;
    D[Vault Contract] --> H[Aptos Blockchain];
````

| Component | Description | Technologies |
| :--- | :--- | :--- |
| **Frontend** | User interface for wallet connection, leaderboards, Vault management, and real-time market data display. | Next.js, TypeScript, Recharts, Lucide-React |
| **Aptos Wallet** | User authentication and transaction signing. | Petra Wallet, `@aptos-labs/ts-sdk` |
| **Kana Perps SDK** | TypeScript integration (`lib/kana.ts`) for fetching market data and generating transaction payloads for the CLOB. | Custom Kana Perps Integration |
| **Vault Contract** | The core Move smart contract (`move/sources/vault.move`). Manages collateral, tracks following, and records copied positions. | Move (on Aptos) |
| **Keeper Service** | (Conceptual) An off-chain service that monitors the followed trader's positions on Kana Perps and executes corresponding trades for the Vault by submitting transactions via the Aptos SDK. | Custom Backend (not fully specified) |

-----

## Smart Contract: `copyvault::perps_vault`

The core logic is managed by the Move module located at `move/sources/vault.move`. It implements secure collateral management and position tracking.

### Key Structures

| Structure | Purpose |
| :--- | :--- |
| `PerpsVault` | The main resource storing a user's copy-trading parameters, including `owner`, `trader_following`, `collateral` (in $APT), and `max_leverage`. |
| `TraderProfile` | Tracks a registered trader's public performance metrics like `total_followers`, `realized_pnl`, and `win_rate`. |
| `Position` | An individual entry recording a mirrored perpetual trade: `market`, `side`, `size`, and `entry_price`. |
| `VaultPositions` | Stores the vector of all currently open `Position` structs for a specific vault owner. |

### Entry Functions

| Function | Description | Access |
| :--- | :--- | :--- |
| `create_vault` | Initializes a new `PerpsVault` for a user, validates `max_leverage`, and transfers initial $APT collateral. | `public entry` |
| `register_as_trader` | Allows an account to create a `TraderProfile` resource to enable public performance tracking. | `public entry` |
| `add_collateral` | Deposits additional $APT into the user's vault, increasing the size available for copying trades. | `public entry` |
| `withdraw_collateral` | Withdraws $APT from the vault. **Requires the vault to have no open positions.** | `public entry` |
| `record_position_copy` | **Called by the off-chain Keeper** to formally record a newly opened position in the Vault's state on-chain. | `public entry` |
| `close_position` | **Called by the off-chain Keeper** to remove a closed/settled position from the `VaultPositions` vector. | `public entry` |
| `toggle_vault_status` | Allows the user to pause/unpause the copy-trading automation for their vault. | `public entry` |

-----

## Implementation Guide

### Smart Contracts & Core Infrastructure

#### Setup & Dependencies

```bash
# Initialize Next.js project
npx create-next-app@latest kana-perps-copyvault
cd kana-perps-copyvault

# Install frontend dependencies
npm install @aptos-labs/ts-sdk @pontem/liquidswap-sdk recharts lucide-react

# Install Aptos CLI (for Move development)
# Visit: [https://aptos.dev/tools/install-cli/](https://aptos.dev/tools/install-cli/)
```

#### Contract Deployment

1.  Configure `move/Move.toml` with the `[addresses]` section.
2.  Run the deployment steps:

<!-- end list -->

```bash
# Initialize Aptos account
aptos init

# Compile the Move contract
aptos move compile --named-addresses copyvault=default

# Deploy to testnet/devnet
aptos move publish --named-addresses copyvault=default
```

### Frontend Core & Kana Perps Integration

#### Project Structure

The project follows the standard Next.js App Router structure:

```
src/
├── app/                  # Application Routes
│   ├── page.tsx          # Landing page
│   ├── traders/page.tsx  # Trader leaderboard
│   ├── vault/page.tsx    # User's vault dashboard
│   └── layout.tsx
├── components/           # UI Components (e.g., WalletConnect, OrderBook)
├── lib/                  # Aptos & External SDK Logic
│   ├── aptos.ts          # Aptos SDK configuration
│   └── kana.ts           # Kana Perps REST/WS integration
└── types/                # TypeScript types
```

#### Kana Perps SDK Integration (`lib/kana.ts`)

This file contains the full TypeScript implementation for interacting with the Kana Perps API, which is crucial for the Keeper Service and frontend data display.

**Key SDK Functions:**

  * **`OrderBookClient`**: WebSocket class for real-time order book data streaming (`wss://perps-sdk-ws.kanalabs.io/wsOrderBook`).
  * **Data Retrieval**: Functions like `getMarketInfo`, `getPositions`, and `getTradeHistory` use the authenticated `kanaRequest` helper.
  * **Transaction Payloads**: Functions like `buildPlaceMarketOrderPayload` and `buildCollapsePositionPayload` generate the raw transaction inputs needed by the Keeper to execute trades on behalf of the user's Vault.

<!-- end list -->
-----


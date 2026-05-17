# Neon Frogger — Base Standard Web App

Mobile-first cyberpunk Frogger with swipe controls, level progression, and daily on-chain check-in on Base mainnet.

## Structure

- `contracts/` — Foundry `DailyCheckIn.sol`
- `web/` — Next.js app (Vercel root directory)

## Setup

```bash
# Contracts
cd contracts && forge test

# Web
cd web && cp ../.env.example .env.local
npm install && npm run dev
```

## Env

See [.env.example](.env.example). Register on [base.dev](https://base.dev) for `NEXT_PUBLIC_BASE_APP_ID` and `NEXT_PUBLIC_BUILDER_CODE`.

## Deploy contract

```bash
cd contracts
forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast
```

Set `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` to the deployed address.

## Vercel

Root Directory: `web`. Add all `NEXT_PUBLIC_*` variables from `.env.example`.

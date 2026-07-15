# Synex: VCG Markets Level and Deriv API Gap Assessment

Synex is roughly **30% of the way to a credible VCG-style, Deriv-powered web platform**, but only about **20% production-ready end to end**.

The design and API scaffolding are further ahead than the real customer journey. The backend test suite passes, but the complete flow has not yet been proven using real authentication, PostgreSQL, a linked Deriv demo account, streaming prices, trade execution, settlement, and notifications.

## Current capability assessment

| Area | Current state | Estimate |
| --- | --- | ---: |
| Landing page and dashboard shell | Strong visual foundation and responsive navigation | 65% |
| Auth and customer sessions | Auth0 integration exists but is currently bypassed and not proven end to end | 30% |
| Deriv account connection | OAuth linking, encrypted token storage and multiple accounts exist in code | 45% |
| Markets and charting | Symbols, ticks and candles exist; charts are basic and mostly request/poll driven | 30% |
| Trading | Proposal, buy, sell, cancel and contract updates exist | 35% |
| Portfolio and transaction history | Open positions, statement and profit-table routes exist | 45% |
| Watchlists and alerts | Persistence exists; actual background alert monitoring and delivery do not | 35% |
| Customer onboarding | Profile, suitability and risk acknowledgement exist; identity/KYC verification does not | 35% |
| Support and notifications | Customer-facing CRUD exists; no support/admin operations console | 35% |
| Deposits and withdrawals | Explicitly disabled gateway boundary | 5% |
| Copy/social trading | No working customer functionality | 5% |
| Education and research | Static educational content only | 15% |
| Affiliate/VIP/partner system | Not implemented | 0% |
| Production operations | No complete deployment, reconciliation, load testing or monitoring proof | 10–15% |

The implemented client methods cover a useful core—markets, trading, portfolio, activity, onboarding, alerts and support—in [`src/features/platform/services/synexApi.ts`](src/features/platform/services/synexApi.ts). The Go router exposes corresponding routes in the Wanderlog backend's `internal/api/router.go`.

However:

- Funding is deliberately disabled in [`src/pages/dashboard/FundingPage.tsx`](src/pages/dashboard/FundingPage.tsx).
- Alert delivery workers are explicitly unfinished in [`src/pages/dashboard/MarketToolsPage.tsx`](src/pages/dashboard/MarketToolsPage.tsx).
- Previous leader, follower and billing tables are currently removed by the backend's `internal/store/migrations/000002_synex_product.up.sql`.
- The backend still points at the older Deriv OAuth/WebSocket endpoint family in its `.env.example`.

## Exact VCG parity is not possible through Deriv alone

VCG’s core terminal uses MT5 and advertises hedging, market depth, expanded timeframes and advanced indicators. It also advertises thousands of stocks alongside forex, indices and commodities.

- [VCG MT5 platform](https://vcgmarkets.com/en/platforms)
- [VCG instruments](https://vcgmarkets.com/en/instrument)

Deriv’s current developer platform focuses on Options, Multipliers, Accumulators, derived markets, live market streams and contract-based execution.

- [Deriv API overview](https://developers.deriv.com/docs/intro/api-overview/)

Therefore, Synex can provide:

- A VCG-quality customer experience.
- Real and demo Deriv account onboarding.
- Streaming charts and price feeds.
- Deriv-native trade tickets.
- Proposal, purchase, resale, cancellation and risk controls.
- Portfolio, statements and performance analytics.
- Social/copy trading.
- Funding through the separate payment gateway.
- Education, alerts, support, referrals and premium tiers.

However, Synex cannot claim exact equivalence to VCG’s MT5 CFD execution, ECN account structure, market depth or instrument catalogue.

The honest target is:

> **VCG-level product maturity and customer journey, implemented around Deriv-native products.**

## Biggest work remaining

### 1. Move to the current Deriv architecture

Current Deriv documentation uses OAuth 2.0 through `auth.deriv.com`, REST account management, an OTP-generated authenticated WebSocket URL, and separate demo/real streaming endpoints.

- [Deriv complete workflows](https://developers.deriv.com/docs/workflows/)

### 2. Finish the real-time trading terminal

Implement persistent WebSocket sessions, streaming ticks, candlesticks, proposals, balance changes, transactions and contract updates. Add proper charts, indicators, timeframes, order confirmation, error recovery and reconnection.

### 3. Prove the complete customer flow

The required journey is:

1. Auth0 login.
2. Customer onboarding.
3. Deriv consent.
4. Demo or real account connection.
5. Live quote request.
6. Contract purchase.
7. Live position monitoring.
8. Position closure or settlement.
9. Statement and transaction reconciliation.

### 4. Build copy and social trading

Implement leader profiles, verified performance, follower allocation, exposure limits, pause/stop controls, execution reconciliation and disclosures.

Deriv provides a beta bulk-purchase endpoint for up to 100 accounts, but Synex must still own follower consent, position sizing, retries and reconciliation.

- [Deriv bulk purchase](https://developers.deriv.com/docs/trading/bulk-purchase/)

### 5. Connect funding

Implement gateway checkout, deposit reconciliation, withdrawals, approval states, idempotency, webhooks, ledgering and failure recovery.

### 6. Add customer and operational infrastructure

Implement identity verification, compliance review, an admin portal, support queues, email/SMS/push delivery, an economic calendar, content management, audit reporting, observability and incident controls.

## Realistic delivery range

### With one strong full-stack engineer

- Credible Deriv demo-account beta: **3–5 months**
- Real-money production candidate: **6–9 months**
- Broad VCG-like customer functionality: **9–15 months**

### With a focused team of 3–5 engineers plus product, design and compliance support

- Demo beta: **6–10 weeks**
- Real-money production candidate: **4–7 months**
- Social trading, operations and broader VCG-level maturity: **6–12 months**

## Recommended immediate priority

Fix and verify Auth0, then migrate and prove the current Deriv integration before building additional dashboard screens. The first milestone should be a real end-to-end demo-account journey covering authentication, account connection, live streaming, trade execution, position monitoring and settlement.

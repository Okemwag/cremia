# Synex Execution Tracker

This document is the working source of truth for taking Synex from its current dashboard and API scaffold to a trusted, profitable Deriv-native trading platform, with a later path toward VCG-level CFD capabilities.

Related strategy documents:

- [`VCG_DERIV_GAP_ASSESSMENT.md`](VCG_DERIV_GAP_ASSESSMENT.md)
- [`VCG_CAPABILITIES_NOT_IN_DERIV_API.md`](VCG_CAPABILITIES_NOT_IN_DERIV_API.md)
- [`SYNEX_DERIV_GROWTH_AND_PROFITABILITY.md`](SYNEX_DERIV_GROWTH_AND_PROFITABILITY.md)
- [`DERIV_API_ARCHITECTURE.md`](DERIV_API_ARCHITECTURE.md)
- [`TRADE_RECONCILIATION_RUNBOOK.md`](TRADE_RECONCILIATION_RUNBOOK.md)

## Status legend

| Symbol | Meaning |
| --- | --- |
| ✅ | Completed and verified |
| 🟡 | In progress or partially implemented |
| ⬜ | Not started |
| ⛔ | Blocked by an external decision, provider or approval |

Checkboxes may only be marked complete when the linked evidence or exit criterion has been satisfied.

## Programme objective

Build Synex as a reliable Deriv-native platform that provides:

- Secure customer authentication and account onboarding.
- Deriv demo and real-account connection.
- Real-time market data and contract execution.
- Portfolio, risk, activity and performance views.
- Funding through the separate payment gateway.
- Alerts, notifications, education and customer support.
- Sustainable revenue through approved partner commissions, low markup and premium subscriptions.
- A later cTrader integration if customer demand validates CFD expansion.

The product must not claim MT5, ECN, CFD, regulatory or client-money capabilities that Synex does not legally and technically provide.

## Current baseline

| Area | Status | Current evidence | Next requirement |
| --- | --- | --- | --- |
| Landing page | ✅ | Responsive Synex landing experience exists | Conversion analytics and final content review |
| Dashboard shell | ✅ | Responsive application navigation and overview exist | Validate all routes with real data |
| Authentication bypass | ✅ | Frontend dashboard fails closed and requires Auth0 | Keep preview credentials and bypasses out of every build |
| Frontend structure | ✅ | Landing, dashboard, auth and platform code are separated | Maintain boundaries as features grow |
| Frontend validation | ✅ | Lint and production build pass | Add automated CI checks |
| Auth0 customer login | 🟡 | Login and callback routes exist | Resolve configuration and prove real login/logout |
| Go API | 🟡 | Trading, portfolio, onboarding, support and market routes exist | Run the complete stack and prove contracts |
| Deriv integration | 🟡 | Current OAuth2 code exchange, account discovery and OTP WebSocket path are implemented | Configure a new Deriv app and prove a live practice-account journey |
| Live market streaming | 🟡 | Public ticks plus authenticated balance, transaction and position SSE paths are implemented | Prove the authenticated stream against a registered Deriv practice account |
| Trade execution | 🟡 | Short-lived proposals and idempotent buy instructions are persisted before execution | Reconcile uncertain outcomes and prove the complete demo journey |
| Funding | ⬜ | Stable placeholder boundary exists | Connect the payment gateway and reconciliation |
| Price-alert delivery | ⬜ | Alerts can be stored | Background monitoring and delivery workers |
| Copy/social trading | ⬜ | No active product flow | Design, build and verify follower execution |
| cTrader/CFD expansion | ⛔ | Feasibility identified | Deriv and Spotware approval/technical validation |
| Production operations | ⬜ | No complete production proof | CI/CD, monitoring, backups and incident process |

## Critical path

The following order should not be bypassed:

1. Secure authentication.
2. Current Deriv API architecture decision.
3. End-to-end demo trading.
4. Real-time terminal reliability.
5. Customer onboarding and controls.
6. Funding and reconciliation.
7. Production hardening.
8. Monetisation validation.
9. Copy trading and CFD expansion.

---

## Phase 0 — Product, legal and architecture decisions

**Goal:** Define exactly what Synex is allowed to offer and which Deriv interfaces it will use.

**Status:** 🟡

### Tasks

- [ ] Confirm target launch countries and restricted jurisdictions.
- [ ] Obtain legal review of Synex's role as a technology platform, partner or intermediary.
- [ ] Confirm required trading, risk and fee disclosures.
- [ ] Confirm whether Synex may use Deriv API markup and partner commission together.
- [ ] Select the initial Deriv partner commission model.
- [ ] Confirm the maximum launch markup and how it will be disclosed.
- [x] Decide whether to migrate fully to the current Deriv OAuth 2.0 and OTP architecture.
- [ ] Confirm Deriv application scopes required for demo and real trading.
- [ ] Document data retention and deletion obligations.
- [ ] Create an architecture decision record for the initial product boundary.

### Exit criteria

- [ ] Written product boundary approved.
- [ ] Deriv commercial terms confirmed.
- [ ] Launch jurisdictions documented.
- [ ] No unresolved architecture decision blocks authentication or trading.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** _Add links to decisions and provider confirmations._

---

## Phase 1 — Authentication and platform identity

**Goal:** Complete the natural landing → login → callback → dashboard → logout customer journey.

**Status:** 🟡

### Tasks

- [x] Create `/login` route.
- [x] Create `/auth/callback` route.
- [x] Protect `/app` when development bypass is disabled.
- [x] Ensure the preview bypass cannot activate in production builds.
- [ ] Correct Auth0 SPA application configuration.
- [ ] Correct Auth0 API audience and client authorization.
- [ ] Prove login with a new customer account.
- [ ] Prove callback and return-to-dashboard behaviour.
- [ ] Prove silent token acquisition and refresh.
- [ ] Prove logout and session expiry.
- [x] Add friendly handling for denied consent, expired state and callback errors.
- [x] Add unit regression coverage for safe return paths and customer-safe authentication errors.
- [ ] Remove any previously exposed credentials and confirm rotation.
- [ ] Add authentication integration tests.

### Exit criteria

- [ ] A new customer can authenticate without manual intervention.
- [ ] A valid access token is accepted by the Go API.
- [ ] Expired and invalid tokens are rejected safely.
- [ ] Production does not expose the development preview bypass.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** Customer-safe handling is implemented in `src/config/authMessages.ts`,
safe workspace returns are enforced in `src/config/auth.ts`, and the regression
suite passes through `npm test`. The Go API now returns structured JSON for missing
or expired authentication and `go test ./...` covers the protected-session boundary.
Live tenant login, refresh and logout proof is still required before the phase exits.

---

## Phase 2 — Current Deriv connection architecture

**Goal:** Connect customer Deriv accounts securely using the supported API architecture.

**Status:** 🟡

### Tasks

- [x] Create the Synex account connection UI.
- [x] Store the user-level Deriv access grant encrypted at rest in the Go backend.
- [x] Verify connected account ownership in backend requests.
- [ ] Register and configure the correct Deriv OAuth application.
- [x] Replace legacy OAuth and WebSocket endpoints.
- [x] Implement OAuth 2.0 authorization-code exchange with PKCE.
- [ ] Confirm and implement Deriv refresh-token rotation for the registered app.
- [x] Implement current Deriv account discovery.
- [x] Implement OTP creation for authenticated practice and real WebSockets.
- [x] Separate the public WebSocket from account-specific OTP connections.
- [x] Add local grant revocation and account disconnect handling.
- [ ] Confirm and implement provider-side application revocation.
- [x] Handle multiple Deriv accounts per Synex customer.
- [x] Add public market reconnection and subscription restoration.
- [x] Add authenticated account reconnection and subscription restoration.
- [ ] Add rate-limit and upstream failure handling.
- [ ] Add Deriv contract/integration tests against a demo account.

### Exit criteria

- [ ] A customer can connect and disconnect Deriv successfully.
- [ ] Synex never receives the customer's Deriv password.
- [ ] A revoked Deriv token cannot be used.
- [ ] Demo and real accounts cannot be confused by the execution layer.
- [ ] Reconnection restores market and account subscriptions.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** `DERIV_API_ARCHITECTURE.md` records the decision and provider boundary.
The Go implementation uses expiring single-use PKCE transactions, server-side code
exchange, REST account discovery and account-specific OTP WebSocket URLs. Unit tests
in `internal/deriv/platform_test.go` pass through `go test ./...`. The shared public
market hub restores symbol subscriptions after disconnect and a live integration probe
received an `R_10` tick from Deriv's current public WebSocket. The account hub requests
a fresh OTP connection and restores balance, transaction and open-contract subscriptions
after interruption; shared-connection and reconnect tests pass under the race detector.
Browser SSE access uses a 30-second, single-use, account-owned ticket whose hash alone is
stored. A registered Deriv application and authenticated practice-account proof are still
required before the phase exits.

---

## Phase 3 — End-to-end demo trading milestone

**Goal:** Prove one complete demo-account trading journey with real Deriv data.

**Status:** 🟡

### Customer journey checklist

- [ ] Authenticate through Auth0.
- [ ] Complete the minimum Synex onboarding steps.
- [ ] Connect a Deriv demo account.
- [ ] Load the live account balance.
- [ ] Load available markets and contract types.
- [ ] Stream the selected market price.
- [ ] Request a live proposal.
- [ ] Display stake, maximum loss, payout, duration and fees.
- [ ] Confirm the order explicitly.
- [ ] Purchase the contract.
- [ ] Display the new position without a manual refresh.
- [ ] Stream contract status and unrealised result.
- [ ] Update eligible stop-loss or take-profit values.
- [ ] Sell, cancel or allow the contract to settle.
- [ ] Display the final transaction in activity and profit history.
- [ ] Record the full trade audit trail.

### Reliability tasks

- [x] Prevent duplicate purchases caused by repeated clicks.
- [x] Expire stale proposals.
- [ ] Handle insufficient balance clearly.
- [ ] Handle closed markets and unavailable contract types.
- [ ] Recover safely from WebSocket interruption.
- [x] Reconcile uncertain order outcomes before allowing a retry.
- [ ] Add automated end-to-end tests around the demo journey.

### Exit criteria

- [ ] Ten consecutive demo journeys complete without data inconsistency.
- [ ] No duplicate purchase occurs during retry testing.
- [ ] Every purchase, update and close action has a matching audit record.
- [ ] Displayed portfolio and activity reconcile with Deriv.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** Account loading now refreshes balance snapshots through Deriv REST and
marks fallback values as last-known rather than live. Migration `000009` adds durable,
single-use proposal claims and user-scoped idempotency keys. Successful retries return
the stored execution response; processing or uncertain orders block resubmission.
Frontend confirmation reuses the same key after network errors and shows the quote
countdown. It also checks the stored order status after a lost response and continues
polling pending instructions without submitting another purchase. A background worker
conservatively reconciles uncertain execution against Deriv statements and escalates
missing or ambiguous evidence to a protected operations queue. New buys remain blocked
until review is resolved, and review transitions notify the customer. The process is
documented in `TRADE_RECONCILIATION_RUNBOOK.md`. Provider errors are translated into
customer-safe balance, market and pricing messages. The full SQL migration sequence and
review, stream-ticket and customer-receipt lifecycles passed against isolated PostgreSQL
17 instances after all twelve migrations were applied. Local Go tests pass under the race detector,
Go vet passes, and frontend lint, 32 frontend tests and the production build pass. A real Deriv
practice-account journey is still required before the phase exits.

---

## Phase 4 — Production-grade trading terminal

**Goal:** Deliver an enjoyable mobile-first Deriv trading experience.

**Status:** 🟡

### Market experience

- [ ] Replace basic sparkline-only views with interactive candlestick charts.
- [ ] Add supported timeframes.
- [ ] Add symbol search and market categories.
- [ ] Add favourites and recent markets.
- [x] Add live indicative tick and executable proposal information.
- [ ] Add market availability and contract restrictions.
- [x] Add live-price connecting, stale-data and reconnecting states.

### Order experience

- [ ] Build contract-specific order forms.
- [ ] Support applicable barriers, durations, multipliers and growth rates.
- [x] Display all fees and markup before confirmation.
- [x] Display maximum loss and potential payout prominently.
- [x] Add explicit real-account confirmation.
- [ ] Add responsible stake and exposure warnings.
- [x] Add order receipts and contract detail views.
- [x] Add live transaction and balance updates.

### Portfolio and analytics

- [x] Stream open positions.
- [ ] Add filters and account-level summaries.
- [ ] Add realised and unrealised performance breakdowns.
- [ ] Add date-range statement and profit filtering.
- [ ] Add CSV/PDF export where permitted.
- [ ] Add drawdown, win rate and exposure analytics with clear methodology.

### Exit criteria

- [ ] Median quote response meets the agreed service objective.
- [ ] Trade rejection and reconciliation rates are measured.
- [ ] Mobile trading journey passes populated 375px testing.
- [ ] Accessibility and keyboard navigation pass review.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** The Go market hub shares one upstream Deriv subscription per symbol,
bounds symbols and browser subscribers, drops superseded ticks under backpressure,
reconnects with jittered backoff, restores the symbol subscription and releases idle
streams. The public SSE route adds heartbeats and disconnect cleanup. Markets and Trade
display an explicitly indicative live tick with connected, paused and reconnecting
states while preserving Deriv proposals as the executable price. The account hub shares
one OTP WebSocket per user/account, normalizes balance, transaction and open-contract
events, persists streamed balances, restores subscriptions after disconnect and serves
the browser through expiring one-time SSE tickets. The workspace updates the selected
balance, refreshes activity on transactions and applies live position values and terminal
removals without manual refresh. Local reconnect and shared-subscription tests pass under
the Go race detector, and an opt-in live integration test received a real `R_10` tick from
`wss://api.derivws.com/trading/v1/options/ws/public`. The order ticket now separates
indicative and executable prices, displays maximum loss, payout, potential profit and the
zero separate Synex fee, and distinguishes practice from real-money execution. Real buys
require a backend-enforced acknowledgement that is persisted with the operation. Durable,
owner-scoped receipts expose normalized pending, review, failed and successful states plus
provider references without exposing raw provider payloads. All twelve migrations and the
single-use ticket, receipt and reconciliation lifecycles passed against isolated PostgreSQL
17 databases. Frontend lint, 32 tests and the production build pass. Authenticated provider streaming still needs
a registered practice-account proof before Phase 2 and the demo journey can exit.

---

## Phase 5 — Onboarding, suitability and customer protection

**Goal:** Ensure customers understand the product and are eligible to trade.

**Status:** 🟡

### Tasks

- [x] Create customer profile storage and forms.
- [x] Create suitability assessment storage and forms.
- [x] Create risk acknowledgement storage.
- [x] Gate real-account purchases on required onboarding state.
- [ ] Integrate an approved identity-verification provider if required.
- [ ] Add document and liveness verification if required.
- [ ] Add sanctions, PEP and country screening if required.
- [ ] Add age and jurisdiction eligibility enforcement.
- [ ] Version and retain disclosures and customer consent.
- [ ] Add responsible-trading limits and cooling-off controls.
- [ ] Add self-exclusion and account-closure workflows.
- [ ] Add manual compliance review states and an operations queue.
- [ ] Add privacy export and deletion workflows.

### Exit criteria

- [ ] No ineligible customer can place a real-money trade.
- [ ] Every real trader has a complete and auditable onboarding record.
- [ ] Customer restrictions propagate to trading and funding immediately.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** _Add compliance requirements and workflow test report._

---

## Phase 6 — Funding gateway and reconciliation

**Goal:** Provide reliable deposits and withdrawals through the separate payment gateway.

**Status:** ⬜

### Tasks

- [x] Reserve stable frontend and backend funding boundaries.
- [ ] Define gateway deposit, withdrawal and status contracts.
- [ ] Create an idempotent payment-operation ledger.
- [ ] Implement deposit initiation.
- [ ] Implement deposit webhook verification.
- [ ] Implement deposit-to-Deriv reconciliation.
- [ ] Implement withdrawal request and verification.
- [ ] Implement approval, rejection and cancellation states.
- [ ] Implement withdrawal-to-gateway reconciliation.
- [ ] Add duplicate-webhook and retry protection.
- [ ] Add currency, minimum, maximum and fee validation.
- [ ] Add customer receipts and transaction history.
- [ ] Add an operations reconciliation dashboard.
- [ ] Add payment alerts and incident procedures.
- [ ] Test failures at every provider boundary.

### Exit criteria

- [ ] Every movement has an immutable internal reference.
- [ ] Duplicate callbacks cannot duplicate money movement.
- [ ] Customer, gateway and Deriv states can be reconciled.
- [ ] Failed and uncertain operations enter an operations queue.
- [ ] Withdrawal timing is measured and visible to customers.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** _Add sandbox certification and reconciliation report._

---

## Phase 7 — Alerts, notifications, education and support

**Goal:** Build the service layer that drives trust and retention.

**Status:** 🟡

### Tasks

- [x] Create persistent watchlists.
- [x] Create persistent alert definitions.
- [x] Create customer notification storage.
- [x] Create customer support tickets and conversation threads.
- [x] Create initial educational content.
- [ ] Build persistent price-monitoring workers.
- [ ] Trigger and close alerts exactly once.
- [ ] Add email, push or SMS notification channels.
- [ ] Add customer notification preferences.
- [ ] Build a support-agent operations console.
- [ ] Add ticket assignment, priority, SLA and internal notes.
- [ ] Add an economic calendar through a licensed provider.
- [ ] Add content management for education and market updates.
- [ ] Measure delivery, open and support-resolution rates.

### Exit criteria

- [ ] Alerts are delivered reliably and without duplicates.
- [ ] Support staff can manage tickets without database access.
- [ ] Customers can control non-essential communications.
- [ ] Educational and market content has an accountable publishing workflow.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** _Add worker tests, delivery reports and support workflow proof._

---

## Phase 8 — Monetisation and unit economics

**Goal:** Earn sustainably without undermining customer outcomes.

**Status:** ⬜

### Commercial setup

- [ ] Obtain Deriv partner approval.
- [ ] Select Revenue Share or Turnover based on verified economics.
- [ ] Confirm product and country eligibility.
- [ ] Configure and verify referral attribution.
- [ ] Configure approved API markup.
- [ ] Disclose markup before trade confirmation.
- [ ] Decide whether premium subscriptions launch with the trading product.
- [ ] Define subscription benefits that do not disadvantage free users unfairly.
- [ ] Add commission and subscription revenue reporting.
- [ ] Reconcile Deriv statements with internal revenue records.

### Monthly unit-economics dashboard

| Metric | Initial target | Current | Status |
| --- | ---: | ---: | --- |
| Registered users | 5,000 | 0 | ⬜ |
| Deriv account connection rate | ≥ 40% | Unknown | ⬜ |
| Funded-user conversion | ≥ 20% | Unknown | ⬜ |
| Monthly active funded traders | ≥ 1,000 | 0 | ⬜ |
| Active trader rate | ≥ 20% | 0% | ⬜ |
| Revenue per active trader | ≥ $10.50/month | $0 | ⬜ |
| 30-day active-trader retention | ≥ 35% | Unknown | ⬜ |
| Monthly operating costs | ≤ $15,000 initial model | Unknown | ⬜ |
| Monthly break-even traders | ≤ 1,429 | Unknown | ⬜ |
| Withdrawal completion rate | ≥ 98% | Not available | ⬜ |
| Support first-response time | Define by operating model | Unknown | ⬜ |

Targets are planning assumptions, not guarantees. Update them when real cohort data is available.

### Exit criteria

- [ ] Revenue is measured from provider statements, not estimated deposits.
- [ ] Customer deposits are never counted as Synex revenue.
- [ ] Customer acquisition cost and lifetime value are measured by cohort.
- [ ] The platform has a documented path to break even under conservative assumptions.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** _Add partner agreement, revenue reconciliation and cohort dashboard._

---

## Phase 9 — Copy and social trading

**Goal:** Add copy trading only after direct trading is reliable and compliant.

**Status:** ⬜

### Tasks

- [ ] Confirm Deriv support and approval for the chosen execution model.
- [ ] Decide between bulk purchase and a Synex-controlled mirroring engine.
- [ ] Design leader application and approval.
- [ ] Define verified performance methodology.
- [ ] Prevent self-reporting or manipulation of leader results.
- [ ] Build leader profiles and discovery.
- [ ] Build explicit follower consent.
- [ ] Add fixed, proportional and capped allocation rules as permitted.
- [ ] Add daily loss, exposure and drawdown limits.
- [ ] Add pause, stop and emergency kill controls.
- [ ] Add partial-failure and per-follower reconciliation.
- [ ] Add leader/follower notifications.
- [ ] Add immutable execution and consent audit records.
- [ ] Define subscription or performance-fee handling if legally permitted.
- [ ] Run a closed demo-only pilot before real-money availability.

### Exit criteria

- [ ] A leader failure cannot create uncontrolled follower exposure.
- [ ] Every follower execution reconciles independently.
- [ ] Followers can stop copying immediately.
- [ ] Performance figures are reproducible from source transactions.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** _Add risk review and demo pilot report._

---

## Phase 10 — cTrader/CFD expansion decision

**Goal:** Decide whether validated customer demand justifies CFD integration.

**Status:** ⛔

### Feasibility tasks

- [ ] Survey active customers about MT5/cTrader and CFD demand.
- [ ] Confirm that Deriv cTrader accounts are accessible through cTrader Open API.
- [ ] Obtain Spotware application approval.
- [ ] Obtain Deriv commercial and technical approval.
- [ ] Validate OAuth and live/demo account access.
- [ ] Validate symbols, orders, positions, history and streaming.
- [ ] Confirm commission attribution for trades originating from Synex.
- [ ] Assess regulatory and disclosure changes.
- [ ] Estimate implementation and operating cost.
- [ ] Build a demo-only technical proof of concept.

### Go/no-go thresholds

- [ ] At least 20% of active traders request CFD functionality.
- [ ] Expected incremental contribution covers implementation and support cost.
- [ ] The integration can be offered without misleading product claims.
- [ ] Provider approvals and reliable API access are confirmed in writing.

### Later MT5 decision

- [ ] Evaluate an MT5 broker or regulated white-label partnership only if cTrader is insufficient.
- [ ] Do not purchase brokerage infrastructure before demand and legal feasibility are proven.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** _Add survey, approvals, proof of concept and business case._

---

## Phase 11 — Security, reliability and production operations

**Goal:** Operate Synex safely under real customer and financial load.

**Status:** ⬜

### Engineering operations

- [ ] Add CI for lint, type checking, build and backend tests.
- [ ] Add frontend, backend and database deployment pipelines.
- [ ] Create separate development, staging and production environments.
- [ ] Store secrets in an approved secrets manager.
- [ ] Add database migrations to deployment gates.
- [ ] Add structured logging and correlation IDs.
- [ ] Add error monitoring and performance tracing.
- [ ] Add service-health and business-health dashboards.
- [ ] Add uptime and latency alerts.
- [ ] Add database backups and test restoration.
- [ ] Add disaster-recovery objectives and exercises.
- [ ] Add rate limits, abuse detection and request-size limits.
- [ ] Add dependency and container vulnerability scanning.
- [ ] Complete an independent security review before real-money launch.
- [ ] Run load tests at and above the 5,000-user target.

### Operational readiness

- [ ] Create support and incident escalation procedures.
- [ ] Create trade-reconciliation and payment-reconciliation runbooks.
- [ ] Create customer communication templates for incidents.
- [ ] Define maintenance windows and status-page communication.
- [ ] Define retention, privacy and account-deletion processes.
- [ ] Assign on-call and operational ownership.

### Exit criteria

- [ ] Staging matches the production architecture.
- [ ] Backup restoration succeeds within the recovery objective.
- [ ] Load testing meets agreed latency and error budgets.
- [ ] Critical incidents have named owners and tested runbooks.
- [ ] Independent security findings are resolved or formally accepted.

**Owner:** Unassigned  
**Target date:** Unassigned  
**Evidence:** _Add CI, deployment, load, recovery and security reports._

---

## Launch gates

### Legal foundation progress

- [x] Add a public, versioned legal-document centre to the web product.
- [x] Add privacy, terms, trading-risk, platform/Deriv, order-transmission, financial-crime, cookie, complaints, and data-rights drafts.
- [x] Link landing-page legal navigation to real routes.
- [x] Add Android access to the same legal catalogue.
- [x] Add backend legal-document metadata and auditable, versioned acceptance storage.
- [x] Prevent draft documents from being recorded as production acceptance.
- [ ] Confirm the registered legal entity, registration number, and office address.
- [ ] Confirm governing law, courts, launch countries, and restricted jurisdictions.
- [ ] Confirm that `privacy@synex.app` and `support@synex.app` are monitored contacts.
- [ ] Obtain jurisdiction-specific legal and compliance approval.
- [ ] Publish approved document versions and activate required acceptance flows.
- [ ] Complete Google Play Data safety and Financial features declarations from the release build.

### Internal demo gate

- [x] Remove frontend and Android authentication bypass paths.
- [x] Implement SPA Universal Login, callback, protected routing, API tokens, and logout.
- [x] Validate issuer, audience, RS256 signature, expiry, and subject in the Go API.
- [x] Provision the local Synex user on the first authenticated API request.
- [x] Implement Android Auth0 PKCE and Keystore-encrypted renewable credentials.
- [ ] Add the Android Native Application client ID and signing fingerprints in Auth0.
- [ ] Grant the SPA and Native applications user-delegated access to the Synex API.
- [ ] Complete a real browser and Android sign-in with customer credentials.
- [ ] Deriv demo connection works.
- [ ] End-to-end demo trade reconciles.
- [ ] No credential is exposed to the browser or repository.

### Closed beta gate

- [ ] At least ten consecutive demo journeys pass.
- [ ] Monitoring and support intake are active.
- [ ] Customer disclosures are approved.
- [ ] Known limitations are visible to testers.
- [ ] No unresolved critical or high-severity security issue exists.

### Real-money pilot gate

- [ ] Legal and provider approvals are documented.
- [ ] Onboarding restrictions are enforced.
- [ ] Funding and withdrawal reconciliation pass sandbox and pilot tests.
- [ ] Trade reconciliation and incident runbooks are tested.
- [ ] A limited-user and limited-exposure rollout is configured.

### Public launch gate

- [ ] Real-money pilot metrics meet the agreed thresholds.
- [ ] Withdrawal reliability meets the service objective.
- [ ] Support capacity matches expected customer volume.
- [ ] Load testing covers the expected peak.
- [ ] Unit economics are measured and sustainable.

---

## Risk register

| Risk | Impact | Mitigation | Owner | Status |
| --- | --- | --- | --- | --- |
| Auth0 configuration prevents login | Customers cannot enter the product | Complete Phase 1 before further expansion | Unassigned | 🟡 |
| Legacy Deriv integration becomes incompatible | Trading fails or cannot launch | Migrate/validate against current Deriv architecture | Unassigned | 🟡 |
| Duplicate or uncertain orders | Financial and trust loss | Idempotency, reconciliation and audit controls | Unassigned | ⬜ |
| Funding state differs across providers | Customer money appears missing | Immutable ledger and operations queue | Unassigned | ⬜ |
| High markup reduces trader retention | Short-term revenue damages lifetime value | Launch low, disclose and measure cohorts | Unassigned | ⬜ |
| 5,000 registrations produce few active traders | Revenue misses projections | Track funded activation and retention, not registrations | Unassigned | ⬜ |
| Copy trading magnifies execution failures | Many customers affected simultaneously | Demo pilot, caps and emergency stop controls | Unassigned | ⬜ |
| CFD claims exceed actual capability | Legal and reputational exposure | Keep products explicitly Deriv-native | Unassigned | ⬜ |
| Customer support cannot scale | Churn and unresolved financial complaints | Operations console, SLAs and staffing plan | Unassigned | ⬜ |
| Secrets or tokens leak | Account compromise | Rotation, secret manager and automated scanning | Unassigned | 🟡 |

## Decision log

| Date | Decision | Reason | Owner | Reference |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | Deriv-native product is the initial launch scope | Fastest route to a real, testable product | Unassigned | Add reference |
| YYYY-MM-DD | cTrader is a later feasibility track | CFD demand and provider approval must be proven first | Unassigned | Add reference |

## Weekly progress update

Copy this section for each weekly review.

### Week of YYYY-MM-DD

**Overall status:** Green / Amber / Red

**Completed**

- Item and evidence.

**In progress**

- Item, owner and expected completion.

**Blocked**

- Blocker, required decision and owner.

**Metrics**

| Metric | Previous | Current | Target | Trend |
| --- | ---: | ---: | ---: | --- |
| Registered users | 0 | 0 | 5,000 | — |
| Connected Deriv accounts | 0 | 0 | 2,000 | — |
| Monthly active funded traders | 0 | 0 | 1,000 | — |
| Monthly revenue | $0 | $0 | Define after partner approval | — |
| Monthly operating cost | Unknown | Unknown | ≤ $15,000 initial model | — |

**Next seven days**

1. Highest-priority deliverable.
2. Second deliverable.
3. Third deliverable.

## Immediate next actions

1. Resolve and prove Auth0 login with the configured SPA and API audience.
2. Register the current Deriv OAuth 2.0 application and exact callback.
3. Run the Go API, PostgreSQL and frontend as one configured local stack.
4. Complete one real Deriv practice-account trading and authenticated-stream journey.
5. Record the journey as the first formal end-to-end acceptance test.

# Synex Deriv API Architecture

## Decision

Synex will use Deriv's current OAuth 2.0, REST account and one-time-password
WebSocket architecture. The retired token-in-callback flow and legacy
`ws.binaryws.com` authorization flow are not part of the production design.

This decision covers the technical integration only. Deriv application approval,
commercial terms, supported countries and production credentials remain external
launch requirements.

## Customer journey

1. The customer signs in to Synex through Auth0.
2. Synex asks its Go API to start a Deriv connection.
3. The API creates a short-lived, single-use transaction and PKCE challenge.
4. The browser opens Deriv so the customer can review and approve access.
5. Deriv returns an authorization code to the Go API callback.
6. The Go API validates state, consumes the transaction and exchanges the code.
7. The API retrieves the customer's Deriv options accounts and stores the access
   grant encrypted at rest.
8. The dashboard displays practice and real accounts without receiving a Deriv
   password or access token.
9. Before an account-specific WebSocket action, the API requests a one-time URL
   for that account and connects immediately. The URL is valid for one use and a
   short period.
10. The Go account-stream hub subscribes to the selected account's balance,
    transactions and open contracts. React receives normalized events through
    Synex SSE; it never opens the provider WebSocket itself.

## Provider interfaces

| Purpose | Interface |
| --- | --- |
| Customer authorization | `https://auth.deriv.com/oauth2/auth` |
| Server-side code exchange | `https://auth.deriv.com/oauth2/token` |
| REST base | `https://api.derivws.com` |
| Options account discovery | `GET /trading/v1/options/accounts` |
| Account WebSocket access | `POST /trading/v1/options/accounts/{accountId}/otp` |
| Public options WebSocket | `wss://api.derivws.com/trading/v1/options/ws/public` |

The authorization request uses `trade account_manage`, a signed state value and
PKCE `S256`. The callback URL is configured through `DERIV_REDIRECT_URL` and must
exactly match the URL registered with Deriv.

## Security and storage

- PKCE verifiers are encrypted and stored in expiring, single-use database rows.
- OAuth state is HMAC-signed and bound to an HttpOnly, SameSite cookie.
- Access grants are encrypted with AES-256-GCM before database storage.
- One user-level grant is stored; account records do not duplicate access tokens.
- Deriv access tokens and one-time WebSocket URLs never reach the React frontend.
- The browser requests a random account-stream ticket over its authenticated API
  session. Only a SHA-256 hash is stored, the ticket expires after 30 seconds and
  is deleted atomically on first use.
- Ticket creation resolves the requested account through the authenticated Synex
  user and an active connected-account row. It cannot be used to select another
  customer's account.
- Connecting a new grant atomically replaces the user's discovered account set.
- Disconnecting revokes the local grant and disables all related Synex accounts.

## Live account delivery

The authenticated browser calls `POST /v1/streams/account-ticket` with the selected
`login_id`, then opens `GET /v1/streams/account?ticket=...`. The SSE connection emits
four normalized event types:

- `status`: connected, reconnecting or account reconnection required.
- `balance`: current amount, currency and provider login ID.
- `transaction`: action, amount, resulting balance, provider reference and time.
- `position`: contract identity, current spot, profit, return and terminal state.

The backend shares one Deriv WebSocket connection per Synex user and Deriv account,
with bounded subscribers and an idle shutdown. It requests a fresh provider OTP URL
on every connection attempt and restores balance, transaction and open-contract
subscriptions after an interruption. The React client closes a failed EventSource,
requests a new single-use ticket and reconnects with bounded exponential delay.

Reverse proxies and observability tooling must redact the `ticket` query parameter
from access logs, traces and analytics. The ticket is deliberately short-lived and
single-use, but it is still authentication material until consumed.

## Order evidence and pricing boundary

Every executable proposal is stored before purchase with its account owner, market,
contract type, stake basis, requested amount, duration and applicable optional terms.
The stored proposal also records the Deriv ask price, potential payout, long description,
price source and the separate Synex execution fee or markup. The current amount is zero;
Synex must not silently introduce a fee or markup without adding it to this persisted
record and displaying it before confirmation.

Real-account buys require `real_money_confirmed=true` on the authenticated instruction.
The backend verifies that the selected connected account is not virtual and persists the
acknowledgement with the operation. A React-only checkbox is not treated as enforcement.

`GET /v1/trading/receipt` returns only the authenticated customer's persisted operation.
It combines the confirmed terms with the Synex order ID, practice/real account type,
status, provider contract ID, provider transaction ID and timestamps. Provider payloads
remain evidence in the backend, while the browser receives a normalized customer receipt.
Pending and review states remain receipts; they are not described as successful execution.

## Known provider-dependent boundary

The current public Deriv OAuth guide documents authorization-code exchange but
does not give a complete refresh-token contract. The backend records a refresh
token if Deriv returns one, but automatic refresh must not be enabled until the
grant and rotation behaviour is confirmed with the registered production app.
Until then, an expired access grant requires the customer to reconnect.

Synex local disconnect prevents any further use by this platform. Provider-side
application revocation must be confirmed against an official Deriv revocation
endpoint or completed by the customer in Deriv before Synex claims remote
revocation.

The shared public tick service is a technical relay of Deriv data, not an independent
exchange feed. Production redistribution, caching, branding and customer display must
remain within Deriv's application and commercial terms. Synex must not describe an
indicative tick as an executable price; only the account-specific proposal presented
at confirmation is executable.

## Configuration

Required server-only variables:

- `DERIV_APP_ID`
- `DERIV_REDIRECT_URL`
- `OAUTH_STATE_SECRET`
- `TOKEN_ENCRYPTION_KEY`

Endpoint variables have current defaults but remain configurable:

- `DERIV_AUTH_URL`
- `DERIV_TOKEN_URL`
- `DERIV_API_URL`
- `DERIV_PUBLIC_WS_URL`

No Deriv access token, refresh token or encryption key belongs in a `VITE_`
variable or browser bundle.

## Verification still required

- Register a new-compatible Deriv application and exact HTTPS callback.
- Confirm refresh-token and provider-side revocation behaviour with that app.
- Complete repeated practice-account connect, proposal, buy, position and sell
  journeys using real Deriv responses.
- Prove authenticated balance, transaction and open-contract subscription payloads
  with the registered practice account; local protocol, reconnect and decoding tests
  are complete, but a private live-account probe cannot run without that grant.
- Verify production country, product and commercial permissions with Deriv.

## Official references

- [Deriv OAuth 2.0](https://developers.deriv.com/docs/intro/oauth/)
- [Deriv API overview](https://developers.deriv.com/docs/intro/api-overview/)
- [Options account discovery](https://developers.deriv.com/docs/options/get-accounts/)
- [Authenticated WebSockets](https://developers.deriv.com/docs/options/websocket/)
- [Complete workflows](https://developers.deriv.com/docs/workflows/)

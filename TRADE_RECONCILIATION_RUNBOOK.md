# Synex Trade Reconciliation Runbook

## Purpose

This runbook covers a purchase instruction where Synex cannot tell whether Deriv
executed the order—for example, when the WebSocket closes after submission but
before the buy response arrives.

Synex must never solve this uncertainty by sending the purchase again.

## Automated handling

1. Every buy instruction is stored before submission with a customer-scoped
   idempotency key and the associated short-lived proposal.
2. A confirmed Deriv response marks the operation successful or rejected.
3. A transport failure marks the operation `unknown`; a process interruption may
   leave it `processing`.
4. New buys on the same account are blocked while an operation is `processing`,
   `unknown`, or `review`.
5. The reconciliation worker loads the recent Deriv statement through a fresh,
   account-specific OTP WebSocket.
6. A transaction is accepted as a match only when all of the following agree:

   - Action is `buy`.
   - Provider contract and transaction IDs are present.
   - Transaction time is inside the narrow execution window.
   - Absolute transaction amount matches the stored proposal price.
   - Deriv long description exactly matches the stored proposal description.

7. Exactly one match resolves the operation as successful.
8. No match is retried with bounded attempts. Multiple matches, missing evidence,
   or repeated provider failures move the operation to human review.

This rule is deliberately conservative. Synex does not infer execution from a
chart, balance movement, or a similar-looking position.

## Customer experience

- The trading screen displays that the order is being checked and does not submit
  another purchase.
- The stored order-status endpoint lets a lost browser response recover a completed
  result without buying again.
- The customer receipt endpoint returns the persisted terms and current operation
  status for the authenticated owner. `pending` and `review` receipts must never be
  presented as successful execution.
- A successful receipt includes the Deriv contract and transaction references when
  the provider supplied them. A real-money receipt also records the acknowledgement
  captured before submission.
- When human review is required, the account remains locked for new buys and the
  customer receives an in-app notification.
- When the review is resolved, the customer receives a second notification with
  the outcome.

## Operations access

The internal review API is registered only when `SYNEX_OPERATIONS_API_KEY` is set.
The key must contain at least 32 random characters, stay in server-side secret
storage, and be sent through the `X-Synex-Ops-Key` header. It must never be placed
in React, a `VITE_` variable, a mobile build, logs, screenshots, or tickets.

Initial endpoints:

- `GET /internal/v1/trading/reviews`
- `POST /internal/v1/trading/reviews/{operationID}/resolve`

The resolution body uses one of these forms:

```json
{
  "outcome": "succeeded",
  "contract_id": 123456,
  "transaction_id": 789012,
  "note": "Verified against the Deriv statement and customer account."
}
```

```json
{
  "outcome": "failed",
  "note": "Verified against the Deriv statement that no purchase was executed."
}
```

Successful resolution requires both provider identifiers. Every automated retry,
match, review escalation, and manual resolution is recorded in
`trade_reconciliation_events`.

After a review is resolved, support should ask the customer to reopen the trading or
activity screen so the receipt and provider-backed history can refresh. Do not send a
replacement instruction on the customer's behalf.

## Human review checklist

1. Confirm the Synex operation ID, account ID, proposal ID, amount, contract type,
   symbol, and original submission time.
2. Open the correct customer account in approved Deriv operations tooling.
3. Check both the account statement and relevant contract history around the
   submission time.
4. If executed, record the exact Deriv contract ID and transaction ID.
5. If not executed, confirm there is no matching buy in the full provider window.
6. Add a clear evidence note without copying access tokens or unnecessary personal
   information.
7. Resolve the review once. A resolved operation cannot be resolved again.
8. If evidence remains ambiguous, do not resolve it; escalate to Deriv support and
   Synex compliance/operations leadership.

## Monitoring and escalation

Production monitoring should alert on:

- Any operation remaining `processing` or `unknown` beyond five minutes.
- Any operation entering `review`.
- A growing review queue.
- Repeated OTP, statement, or token failures.
- More than one candidate transaction for an instruction.

The current internal key is a server-to-server bootstrap control. Before a staffed
operations console is exposed to employees, replace or supplement it with named
operator identities, least-privilege roles, multi-factor authentication, and an
immutable record of the operator who made each decision.

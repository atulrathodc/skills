---
name: payments-and-billing
description: Integrate Stripe and subscription billing safely — server-side pricing, idempotency keys, webhook-driven entitlement state machines, Checkout vs PaymentIntents, proration/dunning, and replay testing.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Payments and Billing

Billing bugs cost real money and break customer trust immediately. Treat the payment processor's webhooks and API as the source of truth — never the browser's redirect URL or client-supplied prices.

1. **Never trust prices, quantities, discounts, or plan IDs from the client** — look up unit amounts, currencies, and Stripe `price_id` values on the server from your own catalog/database. Store all monetary amounts as integer minor units (cents, paise) — never IEEE-754 floats (`0.1 + 0.2 !== 0.3`).
2. **Drive entitlements from webhooks, never from the `/success` redirect** — users close tabs, lose mobile signal, or forge query parameters on `/checkout/success`. Provision access only when verified webhooks (`checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`) update your billing table. On the success page, show a brief "confirming payment..." state and poll your backend.
3. **Pass idempotency keys on every mutating payment API call** — generate a deterministic `Idempotency-Key` tied to your internal order/attempt ID (e.g., `checkout:order_123:v1`) so network retries or double-clicks never double-charge a customer.
4. **Model the full subscription lifecycle, not just `active` vs `canceled`** — handle `trialing`, `active`, `past_due`, `unpaid`, `incomplete`, `paused`, and `canceled` (`cancel_at_period_end: true` still has access until `current_period_end`!). Decide explicitly whether `past_due` gets a grace period or immediate restriction.
5. **Prefer hosted Checkout and Customer Portal unless custom UI is mandatory** — Stripe Checkout handles 3D Secure / SCA, Apple Pay, Google Pay, local payment methods, tax calculation, and PCI SAQ-A compliance out of the box. Rolling custom card forms increases PCI scope and breaks easily on SCA challenges.
6. **Keep billing data synced via a single canonical upsert** — on any subscription webhook, fetch or upsert the full subscription snapshot (`stripe_customer_id`, `stripe_subscription_id`, `price_id`, `status`, `current_period_end`, `cancel_at_period_end`) keyed by `stripe_subscription_id`. This makes out-of-order and retried webhooks naturally idempotent.
7. **Link customers deterministically before checkout** — create or look up the `stripe_customer_id` for the user/tenant before creating a Checkout Session and pass `customer` + `client_reference_id` + `metadata: { tenant_id }`. Never match payments back to users solely by email (customers change emails or use a different email at checkout).
8. **Isolate test vs live keys strictly** — verify `sk_test_` / `whsec_` test credentials are never mixed with live IDs (`price_...` IDs differ between test and live mode!). Store keys only in secrets management (`env-secrets-management`), never in git or client bundles (only `pk_*` publishable keys belong in the frontend).
9. **Handle refunds, disputes, and failed renewals gracefully** — listen for `invoice.payment_failed` (notify user + link to billing portal to update card) and `charge.dispute.created` / `charge.refunded` (revoke or flag entitlements and alert ops).
10. **Test end-to-end with the Stripe CLI before shipping** — run `stripe listen --forward-to localhost:<port>/api/webhooks/stripe` and trigger `checkout.session.completed`, `invoice.payment_failed`, and `customer.subscription.deleted`. Replay the same event twice to confirm idempotency and verify signature rejection on tampered payloads.

## Related skills

- `webhooks-and-events` — raw-body HMAC verification, idempotency, and out-of-order handling.
- `authorization-and-multitenancy` — mapping billing entitlements to tenant access controls.
- `env-secrets-management` — keeping live API and webhook signing keys safe.
- `database-migrations` — storing integer money columns and unique billing constraints safely.
- `integration-testing` — testing checkout and webhook state transitions deterministically.

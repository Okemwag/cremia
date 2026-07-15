# Synex: Reaching VCG-Level Capabilities and Deriv Profitability

Yes, a Deriv-only Synex can be profitable and enjoyable—but it should target **Deriv traders**, not pretend to be an MT5/VCG clone.

## Best route to VCG-level capabilities

The recommended path is a staged hybrid approach.

### 1. Keep Deriv API as the first trading engine

Use it for:

- Options, Multipliers and Accumulators.
- 24/7 derived indices.
- Demo and real accounts.
- Streaming prices.
- Trade execution and portfolio tracking.
- API markup and partner commissions.

This is the fastest and least expensive route to market. Deriv explicitly supports building third-party trading applications and monetising them through markup, subscriptions, premium functionality and referrals.

- [Deriv API monetisation](https://developers.deriv.com/docs/intro/markup/)

### 2. Add cTrader Open API for CFD functionality

This is potentially the most practical way to move closer to VCG without becoming a complete broker immediately.

cTrader Open API supports:

- Real-time market data.
- Live and demo accounts.
- Market and pending orders.
- Opening, modifying and closing positions.
- Historical orders and deals.
- Hedged and netted accounts.
- Custom trading terminals.

[cTrader Open API](https://help.ctrader.com/open-api/) states that custom applications can perform the trading operations available through official cTrader applications.

Because Deriv offers cTrader, Synex should investigate whether Deriv cTrader accounts can be authorised inside Synex through Spotware's Open API. This requires approval and confirmation from Deriv and Spotware, but technically it is a promising route.

That would give Synex:

- Deriv-native Options trading through Deriv API.
- CFD trading through connected Deriv cTrader accounts.
- A unified Synex dashboard around both.

### 3. Use MT5 only if Synex becomes or partners with a broker

For exact VCG-style functionality, Synex needs an MT5 broker arrangement—not simply a frontend library.

MetaTrader's broker platform includes:

- Forex, equities and futures infrastructure.
- Market depth.
- Hedging and netting.
- All standard order types.
- Trading robots.
- Copy trading.
- Liquidity-provider gateways.
- Broker-configured spreads, leverage, swaps and commissions.
- Dealer, risk-manager and administrator tools.

[MetaTrader's broker documentation](https://www.metatrader5.com/en/brokers) confirms that the broker controls margin requirements, contract terms, swaps, spreads, commissions and liquidity connectivity.

This route requires:

- A regulated broker or licensed principal.
- An MT5 licence or white-label agreement.
- Liquidity providers.
- Bridge or gateway infrastructure.
- Broker CRM and back office.
- KYC/AML systems.
- Risk and dealing operations.
- Legal and regulatory approval.

This is substantially more expensive than Deriv API development.

## Recommended Synex architecture

The recommended sequence is:

1. Launch with Deriv API only.
2. Prove that traders activate, trade and return.
3. Integrate Deriv cTrader through Open API if approved.
4. Add a broker/MT5 arrangement only after genuine CFD demand is proven.

```text
Synex
├── Deriv Options
│   ├── Options
│   ├── Multipliers
│   ├── Accumulators
│   └── Derived indices
├── Deriv cTrader integration
│   ├── Forex CFDs
│   ├── Commodities
│   ├── Indices
│   └── Standard CFD positions
└── Synex services
    ├── Unified portfolio
    ├── Copy trading
    ├── Alerts and analytics
    ├── Education
    ├── Payments
    └── Premium subscriptions
```

## Will traders enjoy a Deriv-only Synex?

Some traders will love it; others will reject it.

It will appeal to traders who want:

- 24/7 derived markets.
- A cleaner interface than traditional terminals.
- Quick demo-account access.
- Simple stake-based trading.
- Multipliers and short-duration contracts.
- Local payment methods.
- Mobile-first execution.
- Transparent maximum loss.
- Copy trading and social features.

It will not fully satisfy traders who specifically want:

- MT5.
- Expert Advisors.
- Forex lot-based trading.
- Thousands of stock CFDs.
- Pending CFD orders.
- Market depth.
- Raw spreads.
- Classic leverage and margin.
- Long-term CFD positions.

Therefore, Synex should market itself as a polished Deriv-native platform, not "another MT5 broker."

Trader enjoyment will depend more on execution quality than the number of screens:

- Fast quote and order response.
- Reliable streaming.
- Clear contract terms.
- Low rejection rates.
- Accurate balances and P&L.
- Transparent fees.
- Easy withdrawals.
- Responsive support.
- Good mobile performance.
- Responsible risk controls.

A beautiful dashboard with unreliable withdrawals or delayed contract updates will lose traders quickly.

## Can 5,000 users make Synex profitable?

Yes, but **5,000 registered users does not automatically mean meaningful revenue**.

The important number is monthly active funded traders.

### Illustrative activity assumptions

| Scenario | Registered | Monthly active traders | Active rate |
| --- | ---: | ---: | ---: |
| Conservative | 5,000 | 500 | 10% |
| Reasonable | 5,000 | 1,000 | 20% |
| Strong | 5,000 | 1,500 | 30% |
| Exceptional | 5,000 | 5,000 | 100% |

## Revenue model 1: Deriv Turnover commission

Deriv currently advertises:

- Up to 1.5% on Digital Options stakes.
- Up to 40% of Deriv's charges on Multipliers, Accumulators and other eligible contracts.

The exact Digital Options percentage depends on contract payout probability.

- [Deriv partner commission plans](https://deriv.com/partners-help-center-questions/what-type-of-revenue-models-or-commission-plans-do-you-offer-for-affiliates)

Illustrative turnover model:

| Scenario | Active traders | Monthly stake per trader | Assumed commission | Monthly revenue |
| --- | ---: | ---: | ---: | ---: |
| Conservative | 500 | $300 | 0.50% | $750 |
| Reasonable | 1,000 | $1,000 | 0.75% | $7,500 |
| Strong | 1,500 | $2,500 | 1.00% | $37,500 |
| All 5,000 active | 5,000 | $1,000 | 0.75% | $37,500 |

These are illustrations, not forecasts. Actual commission depends on product mix, payout probability, eligibility and Deriv's approved agreement.

## Revenue model 2: Revenue share

Deriv advertises:

- 30% of monthly net revenue up to $20,000.
- 45% on monthly net revenue exceeding $20,000.

- [Deriv revenue-share schedule](https://docs.deriv.com/partners/affiliate-options-commissions-table.pdf)

If different monthly Deriv net revenue per active trader is assumed:

| Scenario | Active traders | Assumed net revenue per trader | Total net revenue | Estimated commission |
| --- | ---: | ---: | ---: | ---: |
| Conservative | 500 | $10 | $5,000 | $1,500 |
| Reasonable | 1,000 | $30 | $30,000 | $10,500 |
| Strong | 1,500 | $75 | $112,500 | $47,625 |
| All 5,000 active | 5,000 | $30 | $150,000 | $64,500 |

The reasonable calculation is:

```text
First $20,000 × 30% = $6,000
Remaining $10,000 × 45% = $4,500
Estimated commission = $10,500/month
```

Revenue share can fluctuate heavily because it depends on Deriv's net revenue from the traders.

## Revenue model 3: API markup

Deriv permits up to 3% markup on eligible contracts, calculated against contract payout. However, Deriv explicitly warns that higher markup reduces the trader's profit.

- [Deriv markup explanation](https://developers.deriv.com/docs/intro/markup/)

A sustainable approach would be:

- 0% during onboarding and demo use.
- Approximately 0.5–1% for standard users, subject to Deriv approval.
- Premium subscriptions for advanced functionality.
- Clear disclosure of the markup.

Maximising markup can increase short-term revenue while destroying retention.

Do not assume markup and partner revenue can always be stacked. Confirm that directly with Deriv under the approved application and partner agreement.

## Additional Synex revenue

A healthier model would combine low trading charges with optional services:

- Pro subscriptions for analytics, advanced charts and alerts.
- Copy-trading subscriptions.
- Leader tools.
- Premium education.
- Affiliate commissions.
- Partner/IB portal.
- API access for professional users.

For example:

```text
250 subscribers × $10/month = $2,500/month
500 subscribers × $15/month = $7,500/month
```

This makes Synex less dependent on traders losing money.

## Revenue is not profit

At 5,000 registered users, expected costs include:

- Hosting and streaming infrastructure.
- Development and security.
- Customer support.
- Payment processing.
- KYC/AML providers.
- Legal and compliance work.
- Marketing and customer acquisition.
- Fraud and chargeback losses.
- Monitoring, backups and incident response.

A reasonable $10,500 monthly commission is not automatically profitable. If operating costs are $15,000 monthly, Synex still loses $4,500.

At approximately $10.50 revenue per active trader, a $15,000 monthly cost base requires roughly:

```text
$15,000 ÷ $10.50 = 1,429 active traders
```

That means about **29% of 5,000 registered users must trade actively every month** just to break even under that illustrative model.

## Recommendation

Build Synex around Deriv first, using this commercial structure:

- Low or moderate markup.
- Deriv partner commission.
- Optional premium subscriptions.
- Excellent local funding and withdrawals.
- Strong education and customer support.
- Later cTrader integration for CFD demand.

With 5,000 genuinely acquired users, Synex can be profitable. With 5,000 registrations but only 200–500 active traders, profitability is unlikely unless operating costs are extremely lean.

The metrics that matter are:

- Deriv account connection rate.
- Funded-user conversion.
- Monthly active funded traders.
- Trading volume.
- 30/90-day retention.
- Revenue per active trader.
- Withdrawal success time.
- Support cost per customer.
- Customer acquisition cost.
- Lifetime value.
- Responsible-trading outcomes.

The strongest business is not the one charging the maximum markup. It is the one traders trust enough to continue using.

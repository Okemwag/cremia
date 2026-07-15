# VCG Markets Capabilities Not Directly Provided by Deriv APIs

The biggest difference is that **VCG Markets is a regulated CFD broker built around MT5**, while **Deriv API is primarily a programmable derivatives trading infrastructure**. Deriv provides execution primitives, not an entire VCG-style brokerage business.

## Capability comparison

| VCG capability | Deriv API position | Can Synex reproduce it? |
| --- | --- | --- |
| MT5 CFD terminal | No equivalent MT5 terminal API | Not exactly |
| Thousands of share and ETF CFDs | Deriv's developer offering centres on Options, Multipliers, Accumulators and derived markets | Not through Deriv alone |
| Market depth and liquidity-book information | No comparable MT5-style depth-of-market API is documented | Not exactly |
| MT5 hedging and CFD positions | Deriv uses contract-based products with defined contract types | Only a Deriv-native equivalent |
| ECN execution model | Deriv executes its own products and contracts | No |
| Broker-defined spreads and leverage | Deriv determines available products and proposal prices | Very limited |
| Overnight swaps and CFD margin accounting | Not part of the Deriv Options contract model | No exact equivalent |
| Standard/Premium broker account tiers | Not supplied as brokerage account classes | Yes, as Synex application tiers |
| Regulated client-money segregation | Organisational and regulatory capability, not an API feature | Not through software alone |
| Negative-balance protection policy | Broker and legal policy | Not something Synex can claim independently |
| Full partner/IB operation | Deriv offers markup and affiliate possibilities, but not VCG's complete partner business | Synex must build it |
| VCG Social copy-trader marketplace | Deriv supplies some execution primitives, not the marketplace | Synex must build it |
| Trading Central economic calendar | Not provided by Deriv trading APIs | Use a third-party data provider |
| VIP account managers and 24/7 operations | Human operational service | Synex must operate it |
| Broker promotions and bonuses | Commercial and regulatory program | Synex must build and legally review it |

## 1. MT5 and the CFD execution model

VCG's platform supports MT5 features including:

- Hedging.
- Market-depth insight.
- Additional technical indicators.
- Expanded chart timeframes.
- Desktop, mobile and web terminals.
- CFD-focused execution.

These are advertised by VCG on its [MT5 platform page](https://vcgmarkets.com/en/platforms).

Deriv's current APIs instead expose:

- Options.
- Multipliers.
- Accumulator options.
- Derived markets.
- Proposals and contract purchases.
- Contract resale, cancellation and updates.
- Portfolio and account streams.
- Automated strategy execution.

That is powerful, but it is a different trading model. See the [Deriv API overview](https://developers.deriv.com/docs/intro/api-overview/).

For example, a VCG EUR/USD CFD can remain open as a margined position with spread, leverage, swap and margin requirements. A Deriv EUR/USD contract is purchased under specific contract parameters such as stake, duration, multiplier, barriers or payout conditions.

Synex can make the user interfaces feel similar, but the underlying financial product will remain different.

## 2. VCG's instrument catalogue

VCG claims access to thousands of instruments, including:

- Individual stocks.
- ETFs.
- Forex pairs.
- Indices.
- Commodities.
- Cryptocurrencies.

Its website advertises leveraged long/short stock trading and more than 180 forex pairs. See [VCG instruments](https://vcgmarkets.com/en/instrument/).

The current Deriv developer offering does not provide equivalent API access to thousands of individual share and ETF CFDs. It focuses on Deriv's available underlyings and contract types.

Therefore, Synex cannot use Deriv alone to offer exact Tesla, Apple, thousands-of-stocks and ETF CFD coverage comparable to VCG. That would require another broker, liquidity provider or licensed white-label CFD infrastructure.

## 3. Broker-controlled account economics

VCG advertises Standard and Premium arrangements with characteristics such as:

- ECN execution.
- Dynamic or zero-based spreads.
- Defined maximum leverage.
- Stop-out levels.
- Commission per standard lot.
- Premium deposit requirements.
- Instant funding.
- VIP support.

These are described on the [VCG Club account page](https://vcgmarkets.com/en/vcg).

Deriv lets an approved API application apply a markup to eligible contracts, but Synex cannot redefine Deriv's underlying execution model, create ECN liquidity, determine a classic CFD spread or invent MT5 leverage conditions. See the [Deriv markup documentation](https://developers.deriv.com/docs/intro/markup/).

Synex can create Free, Standard, Pro or VIP application tiers, but those tiers would control Synex features rather than transforming a Deriv account into VCG's Premium ECN account.

## 4. Regulatory and brokerage protections

VCG presents itself as a regulated brokerage operation and advertises:

- Segregation of company and trader funds.
- Negative-balance protection.
- Regulatory oversight.
- Order-execution policies.
- Client agreements and disclosures.
- Complaint and customer-service operations.

These are broker-level legal and operational responsibilities, not software features available from an API. See [VCG trading and protection claims](https://vcgmarkets.com/en/instrument/).

Deriv remains responsible for funds and contracts inside the connected Deriv account. Synex should therefore state that execution and balances are held with Deriv. Synex should not independently claim segregated funds, ECN execution or negative-balance protection unless the actual legal arrangement supports those claims.

## 5. Copy trading and social trading

VCG Social provides the customer-facing concept of discovering traders and following their trades.

Deriv provides useful execution primitives, including beta bulk purchases across multiple accounts, but it does not give Synex a finished social-trading product. Synex still needs to build:

- Leader applications and approval.
- Public leader profiles.
- Verified performance calculations.
- Follower consent.
- Allocation and maximum-loss rules.
- Suitability restrictions.
- Pause and stop controls.
- Execution retries and reconciliation.
- Performance fees or subscriptions.
- Leader and follower audit histories.

Deriv can execute the copied contracts, but Synex must own the social platform and risk engine.

## 6. Partner and affiliate operations

VCG has a complete partner program covering introducing brokers, affiliates and influencers, including commission reporting, marketing materials, relationship managers and payout processes. See the [VCG partner program](https://vcgmarkets.com/en/partnership).

Deriv offers markup and affiliate monetisation possibilities, but a polished VCG-style partner operation is not supplied as a ready-made API. Synex would need its own:

- Referral attribution.
- Partner onboarding.
- Commission rules.
- Reporting dashboard.
- Fraud detection.
- Payout ledger.
- Marketing-asset library.
- Partner support.

## 7. Research, calendars and trading intelligence

VCG embeds a Trading Central economic calendar with filters for date, country and importance. See the [VCG economic calendar](https://vcgmarkets.com/en/economic-calendar).

Deriv market data does not replace:

- Macroeconomic calendars.
- News feeds.
- Fundamental research.
- Earnings calendars.
- Analyst articles.
- Trading signals.
- Sentiment analysis.

Synex can add these capabilities, but they require providers such as Trading Central or another licensed data and news source.

## Funding is a partial exception

Deriv documents payment-agent APIs for deposits, withdrawals, agent discovery and withdrawal-status tracking. See the [Deriv payment-agent withdrawal API](https://developers.deriv.com/docs/payment-agents/payment-agent-withdraw/).

However, these endpoints do not automatically give Synex VCG's global payment network. Payment-agent eligibility, countries, currencies, limits and approval still apply. The separate Synex payment gateway can provide the customer-facing funding experience, but reconciliation with Deriv wallets must be deliberately designed.

## Bottom line

Using Deriv, Synex can become an excellent:

> **Deriv-native trading, portfolio, copy-trading and customer-management platform with VCG-level design and service quality.**

It cannot become an exact VCG clone using Deriv alone because Deriv does not supply:

- MT5.
- VCG's CFD catalogue.
- Thousands of stock and ETF CFDs.
- ECN liquidity.
- MT5 market depth.
- Classic CFD spreads, margin and swaps.
- VCG's legal or regulatory status.
- Segregated client-fund arrangements.
- A finished partner, research or social-trading business.

The recommended strategy is to reproduce VCG's **customer journey and product maturity**, while keeping the actual trading products explicitly Deriv-native.

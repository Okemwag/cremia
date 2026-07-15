import type { ActiveSymbol, Candle, PortfolioContract, SynexAccount } from "./synexApi";

export const previewAccount: SynexAccount = {
  id: "preview-account",
  login_id: "VRTC-PREVIEW",
  currency: "USD",
  landing_company: "Development preview",
  is_virtual: true,
  connected_at: new Date().toISOString(),
  status: "connected",
  live: {
    balance: 25000,
    currency: "USD",
    fullname: "Preview Trader",
    loginid: "VRTC-PREVIEW",
  },
};

export const previewSymbols: ActiveSymbol[] = [
  { symbol: "frxEURUSD", display_name: "EUR/USD", market: "forex", market_display_name: "Forex", exchange_is_open: 1 },
  { symbol: "frxGBPUSD", display_name: "GBP/USD", market: "forex", market_display_name: "Forex", exchange_is_open: 1 },
  { symbol: "R_100", display_name: "Volatility 100 Index", market: "synthetic_index", market_display_name: "Derived Indices", exchange_is_open: 1 },
  { symbol: "cryBTCUSD", display_name: "BTC/USD", market: "cryptocurrency", market_display_name: "Cryptocurrencies", exchange_is_open: 1 },
  { symbol: "frxXAUUSD", display_name: "Gold/USD", market: "commodities", market_display_name: "Commodities", exchange_is_open: 1 },
];

export const previewCandles: Candle[] = Array.from({ length: 80 }, (_, index) => {
  const close = 1.084 + index * 0.00008 + Math.sin(index / 5) * 0.0014;
  return {
    epoch: 1784140000 + index * 300,
    open: close - 0.0003,
    high: close + 0.0007,
    low: close - 0.0008,
    close,
  };
});

export const previewPositions: PortfolioContract[] = [
  { contract_id: 782401, contract_type: "MULTUP", underlying: "EUR/USD", buy_price: 125, bid_price: 138.4, profit: 13.4, currency: "USD" },
  { contract_id: 782447, contract_type: "CALL", underlying: "Volatility 100 Index", buy_price: 80, bid_price: 76.25, profit: -3.75, currency: "USD" },
];

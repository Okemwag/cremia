import { afterEach, describe, expect, it, vi } from "vitest";
import { APIError, apiErrorMessage, formatMoney, SynexAPI } from "./synexApi";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiErrorMessage", () => {
  it("turns unauthorized responses into a session message", () => {
    expect(apiErrorMessage(new APIError(401, "invalid_token", "raw token failure"))).toBe(
      "Your session has ended. Please sign in again.",
    );
  });

  it("does not expose server internals", () => {
    expect(apiErrorMessage(new APIError(500, "database_error", "pq: relation users does not exist"))).toBe(
      "Synex is temporarily unavailable. Please try again shortly.",
    );
  });

  it("uses a customer-friendly network message", () => {
    expect(apiErrorMessage(new TypeError("Failed to fetch"))).not.toContain("Failed to fetch");
  });

  it("explains an insufficient balance without provider jargon", () => {
    expect(apiErrorMessage(new APIError(422, "InsufficientBalance", "provider detail"))).toBe(
      "There isn't enough balance in this account for that trade.",
    );
  });

  it("explains a closed market", () => {
    expect(apiErrorMessage(new APIError(422, "MarketIsClosed", "provider detail"))).toContain("market is closed");
  });

  it("blocks new orders while an earlier instruction is under review", () => {
    expect(apiErrorMessage(new APIError(409, "account_order_under_review", "internal"))).toContain(
      "Wait for it to finish",
    );
  });

  it("explains the required real-money acknowledgement", () => {
    expect(apiErrorMessage(new APIError(422, "real_money_confirmation_required", "internal"))).toContain(
      "real money you could lose",
    );
  });
});

describe("formatMoney", () => {
  it("formats fiat currencies", () => {
    expect(formatMoney(1250.5, "USD")).toContain("1,250.50");
  });

  it("does not crash for asset currency codes", () => {
    expect(formatMoney(0.12345678, "USDT")).toBe("0.12345678 USDT");
  });
});

describe("current backend response contracts", () => {
  it("normalizes Deriv V2 active-symbol fields without inventing prices", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [{
        exchange_is_open: 1,
        is_trading_suspended: 0,
        market: "synthetic_index",
        pip_size: 0.01,
        submarket: "random_index",
        underlying_symbol: "R_100",
        underlying_symbol_name: "Volatility 100 Index",
        underlying_symbol_type: "stockindex",
      }],
      source: "deriv",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const symbols = await new SynexAPI(async () => "unused-public-token").symbols();

    expect(symbols).toEqual([expect.objectContaining({
      symbol: "R_100",
      display_name: "Volatility 100 Index",
      market: "synthetic_index",
      pip: 0.01,
    })]);
    expect(symbols[0]).not.toHaveProperty("quote");
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(request.headers).has("Authorization")).toBe(false);
  });
});

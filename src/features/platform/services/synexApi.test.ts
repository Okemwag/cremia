import { describe, expect, it } from "vitest";
import { APIError, apiErrorMessage, formatMoney } from "./synexApi";

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
      "Your account does not have enough available balance for this order.",
    );
  });

  it("explains a closed market", () => {
    expect(apiErrorMessage(new APIError(422, "MarketIsClosed", "provider detail"))).toContain("market is currently closed");
  });

  it("blocks new orders while an earlier instruction is under review", () => {
    expect(apiErrorMessage(new APIError(409, "account_order_under_review", "internal"))).toContain(
      "Wait for it to be resolved",
    );
  });

  it("explains the required real-money acknowledgement", () => {
    expect(apiErrorMessage(new APIError(422, "real_money_confirmation_required", "internal"))).toContain(
      "real-money risk",
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

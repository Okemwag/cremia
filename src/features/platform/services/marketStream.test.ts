import { describe, expect, it } from "vitest";
import { formatMarketQuote, marketStreamLabel, parseMarketStreamEvent } from "./marketStream";

describe("parseMarketStreamEvent", () => {
  it("accepts a valid live tick", () => {
    expect(parseMarketStreamEvent('{"type":"tick","symbol":"R_10","quote":123.45,"epoch":1750000000,"pip_size":2}')).toMatchObject({
      type: "tick", symbol: "R_10", quote: 123.45,
    });
  });

  it("ignores malformed or incomplete data", () => {
    expect(parseMarketStreamEvent("not-json")).toBeUndefined();
    expect(parseMarketStreamEvent('{"type":"tick","symbol":"R_10"}')).toBeUndefined();
  });
});

describe("formatMarketQuote", () => {
  it("uses the provider precision safely", () => {
    expect(formatMarketQuote(123.4, 3)).toBe("123.400");
    expect(formatMarketQuote(undefined, 2)).toBe("—");
  });
});

describe("marketStreamLabel", () => {
  it("uses clear customer-facing connection states", () => {
    expect(marketStreamLabel("connected")).toBe("Live");
    expect(marketStreamLabel("stale")).toBe("Price paused");
    expect(marketStreamLabel("reconnecting")).toBe("Reconnecting");
  });
});

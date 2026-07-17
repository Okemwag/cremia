import { describe, expect, it } from "vitest";
import { accountStreamLabel, mergePositionUpdate, parseAccountStreamEvent } from "./accountStream";

const livePosition = {
  contract_id: 101,
  contract_type: "CALL",
  symbol: "R_10",
  status: "open",
  buy_price: 5,
  current_spot: 123.45,
  profit: 1.25,
  profit_percentage: 25,
  currency: "USD",
  is_expired: false,
  is_sold: false,
};

describe("parseAccountStreamEvent", () => {
  it("accepts balance, transaction, and position updates", () => {
    expect(parseAccountStreamEvent('{"type":"balance","login_id":"DOT1","balance":{"amount":995.5,"currency":"USD","login_id":"DOT1"}}')?.balance?.amount).toBe(995.5);
    expect(parseAccountStreamEvent('{"type":"transaction","login_id":"DOT1","transaction":{"action":"buy","amount":-5,"balance":995,"currency":"USD","transaction_id":20,"time":1750000000}}')?.transaction?.transaction_id).toBe(20);
    expect(parseAccountStreamEvent(JSON.stringify({ type: "position", login_id: "DOT1", position: livePosition }))?.position?.contract_id).toBe(101);
  });

  it("rejects malformed or incomplete provider data", () => {
    expect(parseAccountStreamEvent("not-json")).toBeUndefined();
    expect(parseAccountStreamEvent('{"type":"balance","login_id":"DOT1","balance":{"amount":"995"}}')).toBeUndefined();
  });
});

describe("mergePositionUpdate", () => {
  it("adds and refreshes a live position without discarding provider fields", () => {
    const added = mergePositionUpdate([], livePosition);
    expect(added[0]).toMatchObject({ contract_id: 101, current_spot: 123.45, profit: 1.25 });
    const refreshed = mergePositionUpdate([{ ...added[0], payout: 10 }], { ...livePosition, profit: 2 });
    expect(refreshed[0]).toMatchObject({ payout: 10, profit: 2 });
  });

  it("removes sold or expired positions", () => {
    expect(mergePositionUpdate([{ contract_id: 101, contract_type: "CALL", buy_price: 5 }], { ...livePosition, is_sold: true })).toEqual([]);
  });
});

describe("accountStreamLabel", () => {
  it("uses plain customer-facing connection states", () => {
    expect(accountStreamLabel("connected")).toBe("Live");
    expect(accountStreamLabel("connection_required")).toBe("Reconnect account");
  });
});

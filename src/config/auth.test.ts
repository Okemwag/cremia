import { describe, expect, it } from "vitest";
import { safeReturnTo } from "./auth";
import { authIssueFor, isSessionExpiredError, loginNoticeFor } from "./authMessages";

describe("safeReturnTo", () => {
  it.each([
    ["/app", "/app"],
    ["/app/portfolio?range=week", "/app/portfolio?range=week"],
    ["/app/activity#latest", "/app/activity#latest"],
  ])("keeps a Synex workspace route", (input, expected) => {
    expect(safeReturnTo(input)).toBe(expected);
  });

  it.each(["https://example.com", "//example.com", "/", "/legal", "/app/../../login", "not-a-route"])(
    "rejects unsafe or non-workspace return path %s",
    (input) => expect(safeReturnTo(input)).toBe("/app"),
  );
});

describe("authentication messages", () => {
  it("does not expose a provider error when consent is denied", () => {
    const issue = authIssueFor({ error: "access_denied", message: "raw provider detail" });
    expect(issue.title).toBe("Sign-in cancelled");
    expect(issue.message).not.toContain("provider");
  });

  it("recognises expired callback state", () => {
    expect(authIssueFor({ error: "missing_transaction", message: "Invalid state" }).title).toContain("expired");
  });

  it("recognises API and token session expiry", () => {
    expect(isSessionExpiredError({ status: 401 })).toBe(true);
    expect(isSessionExpiredError({ error: "login_required" })).toBe(true);
    expect(isSessionExpiredError({ error: "missing_refresh_token" })).toBe(true);
  });

  it("provides a friendly session-return notice", () => {
    expect(loginNoticeFor("session-ended")?.message).toContain("Sign in again");
  });

  it("never displays an unknown raw exception", () => {
    const issue = authIssueFor(new Error("tenant_client_secret_failed"));
    expect(issue.message).not.toContain("tenant_client_secret_failed");
  });
});

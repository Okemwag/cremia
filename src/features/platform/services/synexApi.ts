import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

export type SynexAccount = {
  id: string;
  login_id: string;
  currency: string;
  landing_company: string;
  is_virtual: boolean;
  connected_at: string;
  status: "connected" | "unavailable";
  live?: {
    balance?: number;
    currency?: string;
    email?: string;
    fullname?: string;
    loginid?: string;
  };
};

export type ActiveSymbol = {
  symbol: string;
  display_name: string;
  market: string;
  market_display_name?: string;
  submarket?: string;
  submarket_display_name?: string;
  exchange_is_open?: number;
  pip?: number;
};

export type Candle = {
  epoch: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Tick = {
  symbol: string;
  quote: number;
  epoch: number;
  ask?: number;
  bid?: number;
  pip_size?: number;
};

export type WatchlistItem = {
  symbol: string;
  display_name: string;
  market: string;
  created_at: string;
};

export type PriceAlert = {
  id: string;
  symbol: string;
  display_name: string;
  direction: "above" | "below";
  target_price: number;
  is_active: boolean;
  triggered_at?: string;
  created_at: string;
};

export type UserProfile = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country_of_residence: string;
  nationality: string;
  date_of_birth: string;
  address_line_1: string;
  city: string;
  postal_code: string;
  preferred_language: string;
  marketing_consent: boolean;
};

export type SuitabilityAssessment = {
  employment_status: string;
  annual_income_range: string;
  net_worth_range: string;
  source_of_funds: string;
  trading_experience: "none" | "beginner" | "intermediate" | "advanced";
  trading_objective: string;
  risk_tolerance: "low" | "medium" | "high";
  knowledge_score: number;
  risk_score?: number;
};

export type OnboardingStatus = {
  profile_complete: boolean;
  suitability_complete: boolean;
  risk_acknowledged: boolean;
  deriv_connected: boolean;
  ready_for_demo: boolean;
  ready_for_live: boolean;
  missing: string[];
  disclosure_version: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  category: "account" | "trading" | "funding" | "verification" | "technical" | "other";
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
};

export type SupportMessage = {
  id: string;
  sender_role: "customer" | "support" | "system";
  message: string;
  created_at: string;
};

export type Notification = {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  action_url?: string;
  read_at?: string;
  created_at: string;
};

export type PortfolioContract = {
  contract_id: number;
  contract_type: string;
  underlying?: string;
  symbol?: string;
  buy_price: number;
  bid_price?: number;
  payout?: number;
  profit?: number;
  currency?: string;
  purchase_time?: number;
  expiry_time?: number;
};

export type Proposal = {
  id: string;
  ask_price: number;
  payout?: number;
  spot?: number;
  display_value?: string;
  longcode?: string;
  contract_type?: string;
  underlying_symbol?: string;
};

export type ContractOption = {
  contract_type: string;
  contract_display?: string;
  sentiment?: string;
};

export class APIError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.code = code;
  }
}

type TokenGetter = () => Promise<string>;

export class SynexAPI {
  constructor(private readonly getToken: TokenGetter) {}

  private async request<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body) headers.set("Content-Type", "application/json");
    if (authenticated) headers.set("Authorization", `Bearer ${await this.getToken()}`);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
    if (response.status === 204) return undefined as T;

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new APIError(
        response.status,
        body.code || "request_failed",
        body.message || body.error || `Request failed with status ${response.status}`,
      );
    }
    return body as T;
  }

  async symbols() {
    const result = await this.request<{ data: ActiveSymbol[] }>("/v1/markets/symbols", {}, false);
    return result.data;
  }

  async candles(symbol: string, granularity = 300, count = 120) {
    const params = new URLSearchParams({ symbol, granularity: String(granularity), count: String(count) });
    const result = await this.request<{ data: { candles?: Candle[] } }>(`/v1/markets/candles?${params}`, {}, false);
    return result.data.candles || [];
  }

  async tick(symbol: string) {
    const result = await this.request<{ data: Tick }>(
      `/v1/markets/tick?symbol=${encodeURIComponent(symbol)}`,
      {},
      false,
    );
    return result.data;
  }

  async contracts(symbol: string) {
    const result = await this.request<{ data: { available?: ContractOption[] } }>(
      `/v1/markets/contracts?symbol=${encodeURIComponent(symbol)}`,
      {},
      false,
    );
    return result.data.available || [];
  }

  async accounts() {
    const result = await this.request<{ accounts: SynexAccount[] }>("/v1/accounts");
    return result.accounts;
  }

  async connectURL() {
    return this.request<{ authorize_url: string }>("/v1/auth/deriv/connect-url");
  }

  async disconnect(loginID: string) {
    return this.request<void>(`/v1/auth/deriv/disconnect?login_id=${encodeURIComponent(loginID)}`, {
      method: "DELETE",
    });
  }

  async portfolio(loginID: string) {
    const result = await this.request<{ data: { contracts?: PortfolioContract[] } }>(
      `/v1/portfolio?login_id=${encodeURIComponent(loginID)}`,
    );
    return result.data.contracts || [];
  }

  async position(loginID: string, contractID: number) {
    const params = new URLSearchParams({ login_id: loginID, contract_id: String(contractID) });
    const result = await this.request<{ data: Record<string, unknown> }>(`/v1/positions/status?${params}`);
    return result.data;
  }

  async limits(loginID: string) {
    const result = await this.request<{ data: Record<string, unknown> }>(
      `/v1/trading/limits?login_id=${encodeURIComponent(loginID)}`,
    );
    return result.data;
  }

  async statement(loginID: string) {
    const result = await this.request<{ data: { transactions?: Record<string, unknown>[] } }>(
      `/v1/statement?login_id=${encodeURIComponent(loginID)}&limit=100`,
    );
    return result.data.transactions || [];
  }

  async profitTable(loginID: string) {
    const result = await this.request<{ data: { transactions?: Record<string, unknown>[] } }>(
      `/v1/profit-table?login_id=${encodeURIComponent(loginID)}&limit=100`,
    );
    return result.data.transactions || [];
  }

  async proposal(input: Record<string, unknown>) {
    const result = await this.request<{ data: Proposal }>("/v1/trading/proposal", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.data;
  }

  async buy(input: Record<string, unknown>) {
    const result = await this.request<{ data: Record<string, unknown> }>("/v1/trading/buy", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.data;
  }

  async sell(input: Record<string, unknown>) {
    const result = await this.request<{ data: Record<string, unknown> }>("/v1/trading/sell", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.data;
  }

  async updateContract(input: Record<string, unknown>) {
    const result = await this.request<{ data: Record<string, unknown> }>("/v1/trading/update", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return result.data;
  }

  async contractUpdateHistory(loginID: string, contractID: number) {
    const params = new URLSearchParams({ login_id: loginID, contract_id: String(contractID) });
    const result = await this.request<{ data: Record<string, unknown>[] }>(`/v1/trading/update-history?${params}`);
    return result.data;
  }

  async cancelContract(loginID: string, contractID: number) {
    const result = await this.request<{ data: Record<string, unknown> }>("/v1/trading/cancel", {
      method: "POST",
      body: JSON.stringify({ login_id: loginID, contract_id: contractID }),
    });
    return result.data;
  }

  async watchlist() {
    const result = await this.request<{ items: WatchlistItem[] }>("/v1/watchlist");
    return result.items;
  }

  async addToWatchlist(item: Pick<WatchlistItem, "symbol" | "display_name" | "market">) {
    return this.request<{ symbol: string; saved: boolean }>("/v1/watchlist", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async removeFromWatchlist(symbol: string) {
    return this.request<void>(`/v1/watchlist?symbol=${encodeURIComponent(symbol)}`, { method: "DELETE" });
  }

  async alerts() {
    const result = await this.request<{ alerts: PriceAlert[] }>("/v1/alerts");
    return result.alerts;
  }

  async createAlert(input: Pick<PriceAlert, "symbol" | "display_name" | "direction" | "target_price">) {
    return this.request<PriceAlert>("/v1/alerts", { method: "POST", body: JSON.stringify(input) });
  }

  async deleteAlert(id: string) {
    return this.request<void>(`/v1/alerts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async profile() {
    return this.request<UserProfile>("/v1/profile");
  }

  async updateProfile(input: UserProfile) {
    return this.request<UserProfile>("/v1/profile", { method: "PUT", body: JSON.stringify(input) });
  }

  async suitability() {
    return this.request<{ assessment: SuitabilityAssessment | null }>("/v1/suitability");
  }

  async updateSuitability(input: SuitabilityAssessment) {
    return this.request<SuitabilityAssessment>("/v1/suitability", { method: "PUT", body: JSON.stringify(input) });
  }

  async onboardingStatus() {
    return this.request<OnboardingStatus>("/v1/onboarding/status");
  }

  async acknowledgeRisk(disclosureVersion: string) {
    return this.request<{ accepted: boolean; disclosure_version: string }>("/v1/onboarding/risk-acknowledgement", {
      method: "POST",
      body: JSON.stringify({ accepted: true, disclosure_version: disclosureVersion }),
    });
  }

  async supportTickets() {
    const result = await this.request<{ tickets: SupportTicket[] }>("/v1/support/tickets");
    return result.tickets;
  }

  async createSupportTicket(input: Pick<SupportTicket, "subject" | "category"> & { message: string }) {
    return this.request<SupportTicket>("/v1/support/tickets", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async supportThread(id: string) {
    return this.request<{ ticket: SupportTicket; messages: SupportMessage[] }>(
      `/v1/support/thread?id=${encodeURIComponent(id)}`,
    );
  }

  async addSupportMessage(ticketID: string, message: string) {
    return this.request<void>("/v1/support/messages", {
      method: "POST",
      body: JSON.stringify({ ticket_id: ticketID, message }),
    });
  }

  async notifications() {
    return this.request<{ notifications: Notification[]; unread: number }>("/v1/notifications");
  }

  async markNotificationsRead(id = "") {
    return this.request<void>("/v1/notifications/read", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  async fundingMethods() {
    return this.request<{ status: string; methods: unknown[]; message: string }>("/v1/funding/methods");
  }
}

export function useSynexAPI() {
  const { getAccessTokenSilently } = useAuth0();
  return useMemo(() => new SynexAPI(() => getAccessTokenSilently()), [getAccessTokenSilently]);
}

export function formatMoney(value: number | undefined, currency = "USD") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function apiErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

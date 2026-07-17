import { useEffect, useState } from "react";
import {
  APIError,
  SYNEX_API_BASE_URL,
  type PortfolioContract,
  type SynexAPI,
} from "./synexApi";

export type AccountStreamStatus = "idle" | "connecting" | "connected" | "reconnecting" | "connection_required";

export type AccountBalanceEvent = {
  amount: number;
  currency: string;
  login_id: string;
};

export type AccountTransactionEvent = {
  action: string;
  amount: number;
  balance: number;
  contract_id?: number;
  currency: string;
  transaction_id: number;
  time: number;
  symbol?: string;
};

export type AccountPositionEvent = {
  contract_id: number;
  contract_type: string;
  symbol: string;
  status: string;
  buy_price: number;
  current_spot: number;
  profit: number;
  profit_percentage: number;
  payout?: number;
  currency: string;
  is_expired: boolean;
  is_sold: boolean;
};

export type AccountStreamEvent = {
  type: "status" | "balance" | "transaction" | "position";
  status?: "connected" | "reconnecting" | "connection_required";
  login_id: string;
  balance?: AccountBalanceEvent;
  transaction?: AccountTransactionEvent;
  position?: AccountPositionEvent;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseBalance(value: unknown): AccountBalanceEvent | undefined {
  if (!isRecord(value) || !isNumber(value.amount) || typeof value.currency !== "string" || typeof value.login_id !== "string") return undefined;
  return value as AccountBalanceEvent;
}

function parseTransaction(value: unknown): AccountTransactionEvent | undefined {
  if (!isRecord(value) || typeof value.action !== "string" || !isNumber(value.amount) || !isNumber(value.balance)
    || typeof value.currency !== "string" || !isNumber(value.transaction_id) || !isNumber(value.time)) return undefined;
  return value as AccountTransactionEvent;
}

function parsePosition(value: unknown): AccountPositionEvent | undefined {
  if (!isRecord(value) || !isNumber(value.contract_id) || typeof value.contract_type !== "string"
    || typeof value.symbol !== "string" || typeof value.status !== "string" || !isNumber(value.buy_price)
    || !isNumber(value.current_spot) || !isNumber(value.profit) || !isNumber(value.profit_percentage)
    || (value.payout !== undefined && !isNumber(value.payout))
    || typeof value.currency !== "string" || typeof value.is_expired !== "boolean" || typeof value.is_sold !== "boolean") return undefined;
  return value as AccountPositionEvent;
}

export function parseAccountStreamEvent(data: string): AccountStreamEvent | undefined {
  try {
    const value: unknown = JSON.parse(data);
    if (!isRecord(value) || typeof value.login_id !== "string" || typeof value.type !== "string") return undefined;
    if (value.type === "status" && (value.status === "connected" || value.status === "reconnecting" || value.status === "connection_required")) {
      return { type: "status", login_id: value.login_id, status: value.status };
    }
    if (value.type === "balance") {
      const balance = parseBalance(value.balance);
      return balance ? { type: "balance", login_id: value.login_id, balance } : undefined;
    }
    if (value.type === "transaction") {
      const transaction = parseTransaction(value.transaction);
      return transaction ? { type: "transaction", login_id: value.login_id, transaction } : undefined;
    }
    if (value.type === "position") {
      const position = parsePosition(value.position);
      return position ? { type: "position", login_id: value.login_id, position } : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function mergePositionUpdate(positions: PortfolioContract[], update: AccountPositionEvent) {
  if (update.is_expired || update.is_sold) {
    return positions.filter((position) => position.contract_id !== update.contract_id);
  }
  const next: PortfolioContract = {
    contract_id: update.contract_id,
    contract_type: update.contract_type,
    underlying: update.symbol,
    symbol: update.symbol,
    buy_price: update.buy_price,
    current_spot: update.current_spot,
    profit: update.profit,
    profit_percentage: update.profit_percentage,
    currency: update.currency,
    status: update.status,
    is_expired: update.is_expired,
    is_sold: update.is_sold,
    ...(update.payout !== undefined ? { payout: update.payout } : {}),
  };
  const index = positions.findIndex((position) => position.contract_id === update.contract_id);
  if (index < 0) return [...positions, next];
  return positions.map((position, positionIndex) => positionIndex === index ? { ...position, ...next } : position);
}

export function accountStreamLabel(status: AccountStreamStatus) {
  if (status === "connected") return "Live";
  if (status === "connection_required") return "Reconnect account";
  if (status === "reconnecting") return "Reconnecting";
  if (status === "idle") return "Setup required";
  return "Connecting";
}

export function useAccountStream(api: SynexAPI, loginID: string) {
  const [status, setStatus] = useState<AccountStreamStatus>(loginID ? "connecting" : "idle");
  const [balance, setBalance] = useState<AccountBalanceEvent>();
  const [lastTransaction, setLastTransaction] = useState<AccountTransactionEvent>();
  const [positionUpdates, setPositionUpdates] = useState<Record<number, AccountPositionEvent>>({});

  useEffect(() => {
    let cancelled = false;
    let source: EventSource | undefined;
    let retryTimer: number | undefined;
    let attempts = 0;

    setBalance(undefined);
    setLastTransaction(undefined);
    setPositionUpdates({});
    if (!loginID) {
      setStatus("idle");
      return;
    }

    const scheduleReconnect = () => {
      if (cancelled || retryTimer !== undefined) return;
      source?.close();
      source = undefined;
      setStatus("reconnecting");
      const delay = Math.min(15_000, 1_000 * (2 ** Math.min(attempts, 4)));
      attempts += 1;
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined;
        void connect();
      }, delay);
    };

    const handleEvent = (message: MessageEvent<string>) => {
      const event = parseAccountStreamEvent(message.data);
      if (!event || event.login_id !== loginID) return;
      attempts = 0;
      if (event.type === "status" && event.status) setStatus(event.status);
      if (event.type === "balance" && event.balance) {
        setBalance(event.balance);
        setStatus("connected");
      }
      if (event.type === "transaction" && event.transaction) {
        setLastTransaction(event.transaction);
        setStatus("connected");
      }
      if (event.type === "position" && event.position) {
        setPositionUpdates((current) => ({ ...current, [event.position!.contract_id]: event.position! }));
        setStatus("connected");
      }
    };

    async function connect() {
      if (cancelled) return;
      setStatus((current) => current === "connection_required" ? current : attempts ? "reconnecting" : "connecting");
      try {
        const { ticket } = await api.accountStreamTicket(loginID);
        if (cancelled) return;
        source = new EventSource(`${SYNEX_API_BASE_URL}/v1/streams/account?ticket=${encodeURIComponent(ticket)}`);
        for (const eventType of ["status", "balance", "transaction", "position"]) {
          source.addEventListener(eventType, handleEvent as EventListener);
        }
        source.onerror = scheduleReconnect;
      } catch (error) {
        if (cancelled) return;
        if (error instanceof APIError && (error.status === 401 || error.status === 404 || error.code === "account_not_connected")) {
          setStatus("connection_required");
          return;
        }
        scheduleReconnect();
      }
    }

    void connect();
    return () => {
      cancelled = true;
      source?.close();
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [api, loginID]);

  return { status, balance, lastTransaction, positionUpdates };
}

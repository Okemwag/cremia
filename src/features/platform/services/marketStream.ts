import { useEffect, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

export type MarketStreamStatus = "idle" | "connecting" | "connected" | "reconnecting" | "stale";

export type MarketTick = {
  type: "tick";
  symbol: string;
  quote: number;
  ask?: number;
  bid?: number;
  epoch: number;
  pip_size?: number;
};

type StatusEvent = {
  type: "status";
  symbol: string;
  status: "connected" | "reconnecting";
};

export function parseMarketStreamEvent(data: string): MarketTick | StatusEvent | undefined {
  try {
    const parsed: unknown = JSON.parse(data);
    if (!parsed || typeof parsed !== "object") return undefined;
    const value = parsed as Record<string, unknown>;
    if (value.type === "tick" && typeof value.symbol === "string" && typeof value.quote === "number" && typeof value.epoch === "number") {
      return value as MarketTick;
    }
    if (value.type === "status" && typeof value.symbol === "string" && (value.status === "connected" || value.status === "reconnecting")) {
      return value as StatusEvent;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function formatMarketQuote(value: number | undefined, pipSize = 2) {
  if (value === undefined || !Number.isFinite(value)) return "—";
  const digits = Math.min(10, Math.max(0, pipSize));
  return value.toLocaleString("en", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function marketStreamLabel(status: MarketStreamStatus) {
  if (status === "connected") return "Live";
  if (status === "stale") return "Price paused";
  if (status === "reconnecting") return "Reconnecting";
  return "Connecting";
}

export function useMarketStream(symbol: string) {
  const [status, setStatus] = useState<MarketStreamStatus>(symbol ? "connecting" : "idle");
  const [tick, setTick] = useState<MarketTick>();

  useEffect(() => {
    setTick(undefined);
    if (!symbol) {
      setStatus("idle");
      return;
    }
    setStatus("connecting");
    const source = new EventSource(`${API_BASE_URL}/v1/markets/stream?symbol=${encodeURIComponent(symbol)}`);
    const onStatus = (event: MessageEvent<string>) => {
      const next = parseMarketStreamEvent(event.data);
      if (next?.type === "status") setStatus(next.status);
    };
    const onTick = (event: MessageEvent<string>) => {
      const next = parseMarketStreamEvent(event.data);
      if (next?.type === "tick") {
        setTick(next);
        setStatus("connected");
      }
    };
    source.addEventListener("status", onStatus as EventListener);
    source.addEventListener("tick", onTick as EventListener);
    source.onerror = () => setStatus("reconnecting");
    return () => source.close();
  }, [symbol]);

  useEffect(() => {
    if (!tick) return;
    const timer = window.setTimeout(() => {
      setStatus((current) => current === "connected" ? "stale" : current);
    }, 20_000);
    return () => window.clearTimeout(timer);
  }, [tick]);

  return { status, tick };
}

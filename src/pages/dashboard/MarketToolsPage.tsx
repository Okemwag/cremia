import { Bell, LoaderCircle, Plus, RefreshCw, Search, Star, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  apiErrorMessage,
  type ActiveSymbol,
  type PriceAlert,
  type Tick,
  type WatchlistItem,
  useSynexAPI,
} from "../../features/platform/services/synexApi";

export default function MarketToolsPage() {
  const api = useSynexAPI();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([]);
  const [ticks, setTicks] = useState<Record<string, Tick>>({});
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [target, setTarget] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [saved, configuredAlerts, available] = await Promise.all([
        api.watchlist(), api.alerts(), api.symbols(),
      ]);
      setWatchlist(saved);
      setAlerts(configuredAlerts);
      setSymbols(available);
      setSelectedSymbol((current) => current || available[0]?.symbol || "");
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!watchlist.length) return;
    let active = true;
    const refresh = async () => {
      const results = await Promise.allSettled(watchlist.map((item) => api.tick(item.symbol)));
      if (!active) return;
      setTicks((current) => {
        const next = { ...current };
        results.forEach((result, index) => {
          if (result.status === "fulfilled") next[watchlist[index].symbol] = result.value;
        });
        return next;
      });
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [api, watchlist]);

  const filteredSymbols = useMemo(() => symbols.filter((item) =>
    `${item.display_name} ${item.symbol} ${item.market}`.toLowerCase().includes(search.toLowerCase()),
  ).slice(0, 60), [symbols, search]);
  const selected = symbols.find((item) => item.symbol === selectedSymbol);
  const alreadySaved = watchlist.some((item) => item.symbol === selectedSymbol);

  const add = async () => {
    if (!selected || alreadySaved) return;
    setBusy(true); setError("");
    try {
      await api.addToWatchlist({ symbol: selected.symbol, display_name: selected.display_name, market: selected.market_display_name || selected.market });
      await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const remove = async (symbol: string) => {
    setBusy(true); setError("");
    try { await api.removeFromWatchlist(symbol); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const createAlert = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected || Number(target) <= 0) return;
    setBusy(true); setError("");
    try {
      await api.createAlert({ symbol: selected.symbol, display_name: selected.display_name, direction, target_price: Number(target) });
      setTarget("");
      await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const deleteAlert = async (id: string) => {
    setBusy(true); setError("");
    try { await api.deleteAlert(id); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/30">Personal market desk</p>
          <h1 className="mt-2 text-[36px] font-medium leading-none tracking-[-.05em] sm:text-[44px]">Watchlist & alerts</h1>
          <p className="mt-3 max-w-[620px] text-sm font-medium leading-relaxed text-black/40 sm:text-base">Track the instruments that matter and keep durable price-alert instructions in your Synex account.</p>
        </div>
        <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-5 py-3 text-sm font-semibold"><RefreshCw size={15}/> Refresh</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-900/10 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}

      <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="overflow-hidden rounded-[22px] border border-black/[.07] bg-[#f7f7f4]">
          <div className="flex items-center justify-between border-b border-black/[.07] p-6">
            <div><h2 className="text-lg font-semibold tracking-[-.03em]">Saved markets</h2><p className="mt-1 text-xs text-black/35">Quotes refresh every five seconds while this page is open.</p></div>
            <Star size={18} className="text-black/30"/>
          </div>
          {loading ? <div className="grid min-h-[360px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div> : watchlist.length ? (
            <div className="divide-y divide-black/[.06]">
              {watchlist.map((item) => {
                const tick = ticks[item.symbol];
                return <div key={item.symbol} className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 sm:grid-cols-[1fr_130px_auto]">
                  <div><p className="text-sm font-semibold">{item.display_name}</p><p className="mt-1 text-xs text-black/35">{item.symbol} · {item.market}</p></div>
                  <div className="hidden text-right sm:block"><p className="text-sm font-semibold tabular-nums">{tick?.quote ?? "—"}</p><p className="mt-1 text-[11px] text-black/30">{tick ? new Date(tick.epoch * 1000).toLocaleTimeString() : "Waiting for quote"}</p></div>
                  <div className="flex items-center gap-2"><Link to={`/app/trade?symbol=${encodeURIComponent(item.symbol)}`} className="rounded-full bg-[#111310] px-4 py-2 text-xs font-semibold text-white">Trade</Link><button type="button" disabled={busy} onClick={() => void remove(item.symbol)} aria-label={`Remove ${item.display_name}`} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-black/35 hover:text-red-600"><Trash2 size={14}/></button></div>
                </div>;
              })}
            </div>
          ) : <div className="grid min-h-[360px] place-items-center p-8 text-center"><div><Star className="mx-auto text-black/20"/><h3 className="mt-4 text-xl font-medium">Your watchlist is empty</h3><p className="mt-2 text-sm text-black/40">Choose an instrument on the right to start tracking it.</p></div></div>}
        </section>

        <div className="space-y-4">
          <section className="rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6">
            <h2 className="text-lg font-semibold tracking-[-.03em]">Add a market</h2>
            <label className="mt-5 flex items-center gap-3 rounded-xl bg-black/[.04] px-4 py-3"><Search size={15} className="text-black/30"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search instruments" className="w-full bg-transparent text-sm outline-none"/></label>
            <select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)} className="mt-3 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none">{filteredSymbols.map((item) => <option key={item.symbol} value={item.symbol}>{item.display_name} · {item.symbol}</option>)}</select>
            <button type="button" disabled={busy || !selected || alreadySaved} onClick={() => void add()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#111310] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-35"><Plus size={15}/>{alreadySaved ? "Already saved" : "Add to watchlist"}</button>
          </section>

          <section className="rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold tracking-[-.03em]">Create price alert</h2><Bell size={17} className="text-black/30"/></div>
            <form onSubmit={createAlert} className="mt-5 space-y-3">
              <select value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value)} className="w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none">{symbols.slice(0, 200).map((item) => <option key={item.symbol} value={item.symbol}>{item.display_name}</option>)}</select>
              <div className="grid grid-cols-2 gap-3"><select value={direction} onChange={(event) => setDirection(event.target.value as "above" | "below")} className="rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none"><option value="above">Moves above</option><option value="below">Moves below</option></select><input type="number" min="0" step="any" required value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Target price" className="rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none"/></div>
              <button disabled={busy || !selectedSymbol || Number(target) <= 0} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6f9f5f] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-35"><Bell size={15}/> Save alert</button>
            </form>
          </section>
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-[22px] border border-black/[.07] bg-[#f7f7f4]">
        <div className="border-b border-black/[.07] p-6"><h2 className="text-lg font-semibold tracking-[-.03em]">Configured alerts</h2><p className="mt-1 text-xs text-black/35">Persistent alert delivery workers will connect to notification channels in the operations phase.</p></div>
        {alerts.length ? <div className="divide-y divide-black/[.06]">{alerts.map((alert) => <div key={alert.id} className="flex items-center gap-4 px-6 py-5"><span className={`grid h-10 w-10 place-items-center rounded-full ${alert.direction === "above" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{alert.direction === "above" ? <TrendingUp size={17}/> : <TrendingDown size={17}/>}</span><div className="flex-1"><p className="text-sm font-semibold">{alert.display_name}</p><p className="mt-1 text-xs text-black/35">Notify when price moves {alert.direction} {alert.target_price}</p></div><span className="rounded-full bg-black/[.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-black/40">{alert.is_active ? "Active" : "Triggered"}</span><button type="button" disabled={busy} onClick={() => void deleteAlert(alert.id)} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-black/35 hover:text-red-600" aria-label="Delete alert"><Trash2 size={14}/></button></div>)}</div> : <p className="p-8 text-center text-sm font-medium text-black/35">No price alerts configured.</p>}
      </section>
    </>
  );
}

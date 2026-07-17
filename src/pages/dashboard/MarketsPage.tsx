import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Sparkline from "../../components/dashboard/Sparkline";
import Surface from "../../components/dashboard/Surface";
import { formatMarketQuote, marketStreamLabel, useMarketStream } from "../../features/platform/services/marketStream";
import { apiErrorMessage, type ActiveSymbol, type Candle, useSynexAPI } from "../../features/platform/services/synexApi";

export default function MarketsPage() {
  const api = useSynexAPI();
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([]);
  const [selected, setSelected] = useState<ActiveSymbol>();
  const [candles, setCandles] = useState<Candle[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
	const live = useMarketStream(selected?.symbol || "");

  useEffect(() => {
    void api.symbols()
      .then((items) => { setSymbols(items); setSelected(items[0]); })
      .catch((reason) => setError(apiErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    if (!selected) return;
    setCandles([]);
    void api.candles(selected.symbol, 300, 160).then(setCandles).catch((reason) => setError(apiErrorMessage(reason)));
  }, [api, selected]);

  const filtered = useMemo(
    () => symbols.filter((item) => `${item.display_name} ${item.symbol} ${item.market}`.toLowerCase().includes(search.toLowerCase())).slice(0, 80),
    [search, symbols],
  );
  const first = candles[0]?.close;
  const last = candles[candles.length - 1]?.close;
  const change = first && last ? ((last - first) / first) * 100 : 0;

  return (
    <>
      <PageHeader eyebrow="Live Deriv data" title="Markets" description="Explore instruments available through Deriv. Availability and contract terms depend on your connected account and jurisdiction." />
      {error && <div className="mt-6"><Feedback>{error}</Feedback></div>}
      <div className="mt-8 grid gap-4 xl:grid-cols-[360px_1fr]">
        <Surface className="overflow-hidden">
          <div className="border-b border-black/[.07] p-4">
            <label className="flex items-center gap-3 rounded-xl bg-black/[.04] px-4 py-3"><Search size={16} className="text-black/35"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search markets" className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-black/30"/></label>
          </div>
          <div className="max-h-[610px] overflow-y-auto p-2">
            {loading ? <p className="p-5 text-sm text-black/40">Loading instruments…</p> : filtered.map((symbol) => (
              <button type="button" key={symbol.symbol} onClick={() => setSelected(symbol)} className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors ${selected?.symbol === symbol.symbol ? "bg-[#111310] text-white" : "hover:bg-black/[.04]"}`}>
                <div><p className="text-sm font-semibold">{symbol.display_name}</p><p className={`mt-1 text-xs ${selected?.symbol === symbol.symbol ? "text-white/40" : "text-black/35"}`}>{symbol.symbol} · {symbol.market_display_name || symbol.market}</p></div>
                <span className={`h-2 w-2 rounded-full ${symbol.exchange_is_open === 0 ? "bg-amber-500" : "bg-[#75ad62]"}`}/>
              </button>
            ))}
          </div>
        </Surface>
        <Surface className="min-h-[580px] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-black/30">{selected?.market_display_name || "Market"}</p><h2 className="mt-2 text-3xl font-medium tracking-[-.05em]">{selected?.display_name || "Select an instrument"}</h2><p className="mt-2 text-sm text-black/35">{selected?.symbol}</p></div>
            <div className="sm:text-right"><div className="flex items-center gap-2 sm:justify-end"><span className={`h-2 w-2 rounded-full ${live.status === "connected" ? "bg-[#75ad62]" : "animate-pulse bg-amber-500"}`}/><span className="text-xs font-semibold text-black/35">{marketStreamLabel(live.status)}</span></div><p className="mt-2 text-2xl font-medium tracking-[-.04em] tabular-nums">{formatMarketQuote(live.tick?.quote ?? last, live.tick?.pip_size ?? selected?.pip ?? 2)}</p><p className={`mt-1 text-sm font-semibold ${change >= 0 ? "text-[#568f47]" : "text-red-600"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</p></div>
          </div>
          <Sparkline candles={candles} className="mt-9 h-[360px] w-full" />
          {selected && <div className="mt-7 flex items-center justify-between border-t border-black/[.07] pt-6"><p className="text-xs font-medium text-black/35">Indicative chart · 5-minute candles</p><Link to={`/app/trade?symbol=${encodeURIComponent(selected.symbol)}`} className="inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white">Trade market <ArrowRight size={15}/></Link></div>}
        </Surface>
      </div>
    </>
  );
}

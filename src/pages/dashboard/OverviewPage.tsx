import { ArrowRight, ArrowUpRight, BarChart3, CircleDollarSign, ShieldCheck, WalletCards, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyAccountState from "../../components/dashboard/EmptyAccountState";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Sparkline from "../../components/dashboard/Sparkline";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { previewCandles, previewPositions, previewSymbols } from "../../features/platform/services/previewData";
import { apiErrorMessage, formatMoney, type ActiveSymbol, type Candle, type PortfolioContract, useSynexAPI } from "../../features/platform/services/synexApi";

export default function OverviewPage() {
  const api = useSynexAPI();
  const { activeAccount, activeLoginID, previewMode } = useWorkspace();
  const [positions, setPositions] = useState<PortfolioContract[]>([]);
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (previewMode) {
      setSymbols(previewSymbols);
      return;
    }
    void api.symbols().then((items) => setSymbols(items.slice(0, 6))).catch((reason) => setError(apiErrorMessage(reason)));
  }, [api, previewMode]);

  useEffect(() => {
    if (previewMode) {
      setPositions(previewPositions);
      return;
    }
    if (!activeLoginID) {
      setPositions([]);
      return;
    }
    void api.portfolio(activeLoginID).then(setPositions).catch((reason) => setError(apiErrorMessage(reason)));
  }, [activeLoginID, api, previewMode]);

  useEffect(() => {
    if (previewMode) {
      setCandles(previewCandles);
      return;
    }
    const symbol = symbols[0]?.symbol;
    if (symbol) void api.candles(symbol, 300, 80).then(setCandles).catch(() => setCandles([]));
  }, [api, previewMode, symbols]);

  if (!activeAccount) {
    return (
      <>
        <PageHeader eyebrow="Synex workspace" title="Good to see you." description="Connect a trading account to activate your live workspace." />
        <EmptyAccountState />
      </>
    );
  }

  const balance = Number(activeAccount.live?.balance || 0);
  const openProfit = positions.reduce((sum, item) => sum + Number(item.profit || 0), 0);
  const metrics = [
    { label: "Available balance", value: formatMoney(balance, activeAccount.currency), icon: CircleDollarSign, note: previewMode ? "Preview balance" : "Live from Deriv" },
    { label: "Open positions", value: String(positions.length), icon: WalletCards, note: positions.length ? "Currently active" : "No market exposure" },
    { label: "Open profit", value: formatMoney(openProfit, activeAccount.currency), icon: ArrowUpRight, note: "Unrealised result" },
    { label: "Account", value: activeAccount.is_virtual ? "Virtual" : "Real", icon: ShieldCheck, note: activeAccount.login_id },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Synex workspace"
        title="Market overview"
        description="A clear view of your connected Deriv account, open exposure and the markets available to trade."
        action={<Link to="/app/trade" className="inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white"><Zap size={15} /> New trade</Link>}
      />
      {error && <div className="mt-6"><Feedback>{error}</Feedback></div>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, note }) => (
          <Surface key={label} className="p-5 sm:p-6">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold text-black/35">{label}</p><Icon size={17} className="text-black/30" /></div>
            <p className="mt-6 text-[28px] font-medium tracking-[-0.05em]">{value}</p>
            <p className="mt-2 text-xs font-medium text-black/35">{note}</p>
          </Surface>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <Surface className="overflow-hidden p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-black/30">Featured market</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em]">{symbols[0]?.display_name || "Loading market"}</h2></div>
            <span className="rounded-full bg-[#e0eadb] px-3 py-1.5 text-xs font-semibold text-[#46683c]">5 minute</span>
          </div>
          <Sparkline candles={candles} className="mt-7 h-[220px] w-full" />
        </Surface>
        <Surface className="p-6 sm:p-8">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold tracking-[-.03em]">Market access</h2><BarChart3 size={18} className="text-black/30" /></div>
          <div className="mt-5 space-y-1">
            {symbols.slice(0, 5).map((symbol) => (
              <Link key={symbol.symbol} to={`/app/trade?symbol=${encodeURIComponent(symbol.symbol)}`} className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-black/[.04]">
                <div><p className="text-sm font-semibold">{symbol.display_name}</p><p className="text-xs text-black/35">{symbol.market_display_name || symbol.market}</p></div><ArrowRight size={15} className="text-black/30" />
              </Link>
            ))}
          </div>
        </Surface>
      </div>
    </>
  );
}

import { useAuth0 } from "@auth0/auth0-react";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Landmark,
  LayoutDashboard,
  LogOut,
  LifeBuoy,
  Menu,
  Settings,
  Star,
  UserRoundCheck,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { safeReturnTo } from "../../../config/auth";
import { isSessionExpiredError } from "../../../config/authMessages";
import { WorkspaceContext, type WorkspaceValue } from "../context/WorkspaceContext";
import { accountStreamLabel, useAccountStream } from "../services/accountStream";
import { apiErrorMessage, type OnboardingStatus, type SynexAccount, useSynexAPI } from "../services/synexApi";

const baseNavItems = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/app/markets", label: "Markets", icon: BarChart3 },
  { to: "/app/watchlist", label: "Watchlist", icon: Star },
  { to: "/app/trade", label: "Trade", icon: Zap },
  { to: "/app/portfolio", label: "Portfolio", icon: WalletCards },
  { to: "/app/activity", label: "Activity", icon: Activity },
  { to: "/app/funding", label: "Funding", icon: Landmark },
  { to: "/app/connect", label: "Accounts", icon: Settings },
  { to: "/app/learn", label: "Learn", icon: BookOpen },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/support", label: "Support", icon: LifeBuoy },
];

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#eeeee9]">
      <div className="flex items-center gap-3 text-sm font-semibold text-black/50">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#78a863]" />
        Opening Synex
      </div>
    </div>
  );
}

export default function PlatformShell() {
  const { isAuthenticated, isLoading, user, logout } = useAuth0();
  const api = useSynexAPI();
  const [accounts, setAccounts] = useState<SynexAccount[]>([]);
  const [activeLoginID, setActiveLoginID] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingStatus>();

  const refreshOnboarding = useCallback(async () => {
    const next = await api.onboardingStatus();
    setOnboarding(next);
    return next;
  }, [api]);

  const refreshAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    setAccountError("");
    try {
      await api.session();
      const [next, onboardingStatus] = await Promise.all([
        api.accounts(),
        api.onboardingStatus().catch(() => undefined),
      ]);
      setOnboarding(onboardingStatus);
      setAccounts(next);
      setActiveLoginID((current) => current && next.some((item) => item.login_id === current) ? current : next[0]?.login_id || "");
    } catch (error) {
      if (isSessionExpiredError(error)) {
        const returnTo = safeReturnTo(`${window.location.pathname}${window.location.search}${window.location.hash}`);
        await logout({ openUrl: false });
        window.location.replace(`/login?reason=session-ended&returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      setAccountError(apiErrorMessage(error));
    } finally {
      setLoadingAccounts(false);
    }
  }, [api, logout]);

  useEffect(() => {
    if (isAuthenticated) void refreshAccounts();
    else setLoadingAccounts(false);
    // The API instance changes only when Auth0's token getter changes.
  }, [isAuthenticated, refreshAccounts]);

  const activeAccount = accounts.find((item) => item.login_id === activeLoginID);
  const accountStream = useAccountStream(api, activeLoginID);

  useEffect(() => {
    if (!accountStream.balance) return;
    setAccounts((current) => current.map((account) => account.login_id === activeLoginID ? {
      ...account,
      balance: accountStream.balance!.amount,
      currency: accountStream.balance!.currency || account.currency,
      balance_fresh: true,
      balance_updated_at: new Date().toISOString(),
    } : account));
  }, [accountStream.balance, activeLoginID]);

  useEffect(() => {
    if (!accountStream.lastTransaction) return;
    setAccounts((current) => current.map((account) => account.login_id === activeLoginID ? {
      ...account,
      balance: accountStream.lastTransaction!.balance,
      currency: accountStream.lastTransaction!.currency || account.currency,
      balance_fresh: true,
      balance_updated_at: new Date().toISOString(),
    } : account));
  }, [accountStream.lastTransaction, activeLoginID]);

  const workspace = useMemo<WorkspaceValue>(() => ({
    accounts,
    activeAccount,
    activeLoginID,
    setActiveLoginID,
    loadingAccounts,
    refreshAccounts,
    refreshOnboarding,
    accountStreamStatus: accountStream.status,
    lastTransaction: accountStream.lastTransaction,
    positionUpdates: accountStream.positionUpdates,
    onboarding,
  }), [accounts, activeAccount, activeLoginID, loadingAccounts, refreshAccounts, refreshOnboarding, accountStream.status, accountStream.lastTransaction, accountStream.positionUpdates, onboarding]);

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login?returnTo=/app" replace />;

  // Until setup is complete, "Get started" sits right under Overview with a
  // reminder dot; afterwards it drops to the quieter spot above Learn.
  const setupIncomplete = Boolean(onboarding && !onboarding.ready_for_live);
  const onboardingItem = {
    to: "/app/onboarding",
    label: onboarding?.deriv_connected ? "Live trading setup" : "Get started",
    icon: UserRoundCheck,
    end: false,
  };
  const navItems = setupIncomplete
    ? [baseNavItems[0], onboardingItem, ...baseNavItems.slice(1)]
    : [...baseNavItems.slice(0, 8), onboardingItem, ...baseNavItems.slice(8)];

  const sidebar = (
    <>
      <div className="flex shrink-0 items-center justify-between px-6 py-7">
        <a href="/" className="text-[22px] font-bold tracking-[-0.07em]" aria-label="Synex home">SYNEX</a>
        <button type="button" onClick={() => setMenuOpen(false)} className="rounded-full p-2 transition-colors hover:bg-black/[0.05] lg:hidden" aria-label="Close menu"><X size={20} /></button>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-5 [scrollbar-color:rgba(0,0,0,0.16)_transparent] [scrollbar-width:thin]" aria-label="Application navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive ? "bg-[#111310] text-white shadow-sm" : "text-black/45 hover:bg-black/[0.05] hover:text-black"}`}
          >
            <Icon size={17} strokeWidth={1.8} /> {label}
            {to === "/app/onboarding" && setupIncomplete && (
              <span className="ml-auto h-2 w-2 rounded-full bg-amber-500" aria-label="Setup incomplete" />
            )}
          </NavLink>
        ))}
      </nav>
      <div className="shrink-0 border-t border-black/[0.06] p-4">
        <div className="rounded-2xl border border-black/[0.07] bg-white/50 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d9e6d2] text-sm font-bold text-[#34502d]">{(user?.name || user?.email || "S").slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name || "Synex client"}</p>
              <p className="truncate text-xs text-black/35">{user?.email || ""}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout({ logoutParams: { returnTo: `${window.location.origin}/` } })}
            className="mt-4 flex items-center gap-2 text-xs font-semibold text-black/45 transition-colors hover:text-black"
          ><LogOut size={14} /> Sign out</button>
        </div>
      </div>
    </>
  );

  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className="min-h-screen bg-[#edede8] text-[#0b0c0b]">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] min-h-0 flex-col overflow-hidden border-r border-black/[0.08] bg-[#f5f5f1] lg:flex">{sidebar}</aside>
        {menuOpen && <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}><aside className="flex h-full w-[280px] flex-col bg-[#f5f5f1]" onClick={(event) => event.stopPropagation()}>{sidebar}</aside></div>}

        <div className="lg:pl-[248px]">
          <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-black/[0.07] bg-[#edede8]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
            <button type="button" onClick={() => setMenuOpen(true)} className="lg:hidden" aria-label="Open menu"><Menu size={21} /></button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black/30">Trading account</p>
              {accounts.length ? (
                <select value={activeLoginID} onChange={(event) => setActiveLoginID(event.target.value)} className="-ml-1 mt-0.5 bg-transparent text-sm font-semibold outline-none">
                  {accounts.map((account) => <option key={account.id} value={account.login_id}>{account.login_id} · {account.currency}{account.is_virtual ? " Practice" : ""}</option>)}
                </select>
              ) : <p className="mt-0.5 text-sm font-semibold">No account connected</p>}
            </div>
            <span className="ml-auto flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/50 px-3 py-2 text-xs font-semibold text-black/45">
              <span className={`h-2 w-2 rounded-full ${accountStream.status === "connected" ? "bg-[#6ca95b]" : accountStream.status === "connection_required" ? "bg-red-500" : "bg-amber-500"}`} />
              {activeAccount ? accountStreamLabel(accountStream.status) : "Setup required"}
            </span>
          </header>
          {accountError && <div className="mx-5 mt-5 rounded-xl border border-red-900/10 bg-red-50 px-4 py-3 text-sm text-red-800 sm:mx-8 lg:mx-10">{accountError}</div>}
          <main className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10"><Outlet /></main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}

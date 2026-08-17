import { BadgeCheck, KeyRound, Landmark, LoaderCircle, RefreshCw, Send, ShieldAlert, WalletCards } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Feedback from "../../components/dashboard/Feedback";
import PageHeader from "../../components/dashboard/PageHeader";
import Surface from "../../components/dashboard/Surface";
import { useWorkspace } from "../../features/platform/context/WorkspaceContext";
import { apiErrorMessage, type DerivWallet, type FundingCapabilities, type PaymentAgent, type PaymentAgentClientSettings, type WalletTransaction, useSynexAPI } from "../../features/platform/services/synexApi";

type PendingOperation = { kind: "transfer" | "withdrawal"; requestID: string; status: string; transactionID?: number | null };
const fieldClass = "mt-2 w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold outline-none focus:border-black/30";

export default function FundingPage() {
  const api = useSynexAPI();
  const { activeAccount } = useWorkspace();
  const defaultCurrency = (activeAccount?.currency || "USD").toUpperCase();
  const [capabilities, setCapabilities] = useState<FundingCapabilities>();
  const [wallets, setWallets] = useState<DerivWallet[]>([]);
  const [walletType, setWalletType] = useState<DerivWallet["type"]>();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [links, setLinks] = useState<{ next?: string | null; prev?: string | null }>({});
  const [currencies, setCurrencies] = useState<string[]>([defaultCurrency]);
  const [countries, setCountries] = useState<string[]>([]);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [country, setCountry] = useState("");
  const [agents, setAgents] = useState<PaymentAgent[]>([]);
  const [selectedAgentID, setSelectedAgentID] = useState(0);
  const [settings, setSettings] = useState<PaymentAgentClientSettings>();
  const [ownAgent, setOwnAgent] = useState<PaymentAgent>();
  const [amount, setAmount] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationExpiry, setVerificationExpiry] = useState(0);
  const [recipientNickname, setRecipientNickname] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [pending, setPending] = useState<PendingOperation>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadTransactions = useCallback(async (type: DerivWallet["type"], cursor = "") => {
    const result = await api.walletTransactions(type, cursor ? { page_cursor: cursor } : { per_page: 100 });
    setTransactions(result.data.transactions || []);
    setLinks(result.links || {});
  }, [api]);

  const loadAgents = useCallback(async (nextCurrency: string, nextCountry = "") => {
    const result = await api.paymentAgents(nextCurrency, nextCountry);
    setAgents(result.data || []);
    setSelectedAgentID((current) => result.data.some((agent) => agent.id === current) ? current : result.data[0]?.id || 0);
  }, [api]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const nextCapabilities = await api.fundingCapabilities();
      setCapabilities(nextCapabilities);
      if (!nextCapabilities.payment_enabled) return;
      const [walletResult, statsResult, settingsResult] = await Promise.all([
        api.wallets(defaultCurrency),
        api.paymentAgentStatistics(),
        api.paymentAgentClientSettings(),
      ]);
      setWallets(walletResult.data || []);
      const firstWallet = walletResult.data?.[0]?.type;
      setWalletType((current) => current || firstWallet);
      if (firstWallet) await loadTransactions(firstWallet);
      const nextCurrencies = statsResult.data.available_currencies?.length ? statsResult.data.available_currencies : [defaultCurrency];
      setCurrencies(nextCurrencies);
      setCountries(statsResult.data.available_countries || []);
      const nextCurrency = nextCurrencies.includes(defaultCurrency) ? defaultCurrency : nextCurrencies[0];
      setCurrency(nextCurrency);
      await loadAgents(nextCurrency);
      setSettings(settingsResult.data);
      setOwnAgent((await api.paymentAgent("me").catch(() => undefined))?.data);
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [api, defaultCurrency, loadAgents, loadTransactions]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!pending || !["requested", "pending"].includes(pending.status)) return;
    let stopped = false;
    const poll = async () => {
      try {
        const result = pending.kind === "withdrawal"
          ? await api.paymentAgentWithdrawalStatus(pending.requestID)
          : await api.paymentAgentTransferStatus(pending.requestID);
        if (!stopped) setPending({ ...pending, status: result.data.status, transactionID: result.data.transaction_id });
        if (!stopped && !["requested", "pending"].includes(result.data.status)) {
          setSuccess(`${pending.kind === "withdrawal" ? "Withdrawal" : "Transfer"} ${result.data.status}.`);
          if (walletType) void loadTransactions(walletType);
        }
      } catch (reason) { if (!stopped) setError(apiErrorMessage(reason)); }
    };
    const timer = window.setInterval(() => void poll(), 4000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [api, loadTransactions, pending, walletType]);

  const reconnect = async () => {
    setBusy(true); setError("");
    try { const result = await api.connectURL(); window.location.assign(result.authorize_url); }
    catch (reason) { setBusy(false); setError(apiErrorMessage(reason)); }
  };

  const chooseWallet = async (type: DerivWallet["type"]) => {
    setWalletType(type); setBusy(true); setError("");
    try { await loadTransactions(type); } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const changeAgentFilters = async (nextCurrency: string, nextCountry: string) => {
    setCurrency(nextCurrency); setCountry(nextCountry); setBusy(true); setError("");
    try { await loadAgents(nextCurrency, nextCountry); } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const requestCode = async () => {
    if (!selectedAgentID || !amount) { setError("Choose an agent and enter the amount you want to withdraw."); return; }
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await api.requestWithdrawalCode({ agent_id: selectedAgentID, amount, currency });
      setVerificationExpiry(result.data.expires_at);
      setSuccess(result.data.message || "Deriv sent your verification code.");
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const withdraw = async (event: FormEvent) => {
    event.preventDefault();
    if (!window.confirm(`Withdraw ${amount} ${currency} through this payment agent? The agent settles with you outside Deriv.`)) return;
    const requestID = createRequestID();
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await api.paymentAgentWithdrawal({ agent_id: selectedAgentID, amount, currency, verification_code: verificationCode, request_id: requestID });
      setPending({ kind: "withdrawal", requestID, status: result.data.status, transactionID: result.data.transaction_id });
      setVerificationCode("");
      setSuccess(`Withdrawal ${result.data.status}. Keep reference ${requestID}.`);
      if (walletType) await loadTransactions(walletType);
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const transfer = async (event: FormEvent) => {
    event.preventDefault();
    const requestID = createRequestID();
    setBusy(true); setError(""); setSuccess("");
    try {
      await api.paymentAgentTransfer({ to_nickname: recipientNickname, amount: transferAmount, currency, request_id: requestID, dry_run: true });
      if (!window.confirm(`Validation passed. Transfer ${transferAmount} ${currency} to ${recipientNickname}?`)) return;
      const result = await api.paymentAgentTransfer({ to_nickname: recipientNickname, amount: transferAmount, currency, request_id: requestID });
      setPending({ kind: "transfer", requestID, status: result.data.status, transactionID: result.data.transaction_id });
      setSuccess(`Transfer ${result.data.status}. Keep reference ${requestID}.`);
      if (walletType) await loadTransactions(walletType);
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const updatePrivacy = async (showRealName: boolean) => {
    setBusy(true); setError("");
    try { setSettings((await api.updatePaymentAgentClientSettings(showRealName)).data); setSuccess("Payment-agent privacy updated."); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentID);
  const nextCursor = useMemo(() => cursorFromLink(links.next), [links.next]);
  const previousCursor = useMemo(() => cursorFromLink(links.prev), [links.prev]);

  return <>
    <PageHeader eyebrow="Your money" title="Funding" description="Wallet balances, payment-agent deposits and verified withdrawals — provided directly by Deriv." action={<button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-5 py-3 text-sm font-semibold"><RefreshCw size={15}/> Refresh</button>}/>
    {error && <div className="mt-6"><Feedback>{error}</Feedback></div>}{success && <div className="mt-6"><Feedback tone="success">{success}</Feedback></div>}
    {loading ? <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div> : !capabilities?.connected ? <Surface className="mt-8 p-8 text-center"><Landmark className="mx-auto text-black/20"/><h2 className="mt-4 text-2xl font-semibold">Connect Deriv first</h2><p className="mt-2 text-sm text-black/40">Your wallets and funding permissions belong to your Deriv profile.</p><button onClick={() => void reconnect()} className="mt-5 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white">Connect Deriv</button></Surface> : !capabilities.payment_enabled ? <Surface className="mt-8 p-8 text-center"><KeyRound className="mx-auto text-black/20"/><h2 className="mt-4 text-2xl font-semibold">Approve payment access</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-black/40">Your existing connection predates wallet support. Reconnect once and approve Deriv’s payment permission; Synex never receives your password or verification code from Deriv.</p><button disabled={busy} onClick={() => void reconnect()} className="mt-5 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Reconnect and approve</button></Surface> : <>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">{wallets.map((wallet) => <Surface key={wallet.wallet_id} className={`cursor-pointer p-6 ${wallet.type === walletType ? "ring-2 ring-black" : ""}`}><button type="button" onClick={() => void chooseWallet(wallet.type)} className="w-full text-left"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#dfe9d9] text-[#426337]"><WalletCards size={19}/></span><span className="text-[10px] font-bold uppercase tracking-[.13em] text-black/35">{wallet.type.replace("_", " ")}</span></div><div className="mt-6 space-y-2">{Object.entries(wallet.balances).map(([code, balance]) => <div key={code} className="flex justify-between"><span className="text-sm text-black/40">{code}</span><span className="font-semibold">{balance.balance}</span></div>)}</div>{wallet.total_balance && <p className="mt-4 border-t border-black/[.06] pt-4 text-sm font-semibold">≈ {wallet.total_balance.approximate_total_balance} {wallet.total_balance.converted_to}</p>}</button></Surface>)}</div>
      <Surface className="mt-4 overflow-hidden"><div className="flex items-center justify-between border-b border-black/[.07] p-6"><div><h2 className="text-xl font-semibold">Wallet transactions</h2><p className="mt-1 text-sm text-black/35">{walletType?.replace("_", " ") || "Choose a wallet"}</p></div>{busy && <LoaderCircle size={18} className="animate-spin text-black/25"/>}</div>{transactions.length ? <div className="divide-y divide-black/[.06]">{transactions.map((item) => <div key={`${item.request_id}-${item.transaction_id}`} className="flex flex-col justify-between gap-3 p-6 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold capitalize">{item.category} · {item.channel.replace("_", " ")}</p><p className="mt-1 text-xs text-black/35">{new Date(item.timestamp).toLocaleString()} · #{item.transaction_id}</p></div><div className="text-right"><p className={`font-semibold ${item.category === "deposit" ? "text-[#568f47]" : "text-red-600"}`}>{item.category === "deposit" ? "+" : "−"}{item.metadata.transaction_net_amount} {item.metadata.transaction_currency}</p><p className="mt-1 text-xs capitalize text-black/35">{item.metadata.transaction_status}</p></div></div>)}</div> : <p className="p-10 text-center text-sm text-black/35">No transactions in this wallet yet.</p>}<div className="flex justify-end gap-2 border-t border-black/[.06] p-4"><button disabled={!previousCursor} onClick={() => walletType && void loadTransactions(walletType, previousCursor)} className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold disabled:opacity-30">Previous</button><button disabled={!nextCursor} onClick={() => walletType && void loadTransactions(walletType, nextCursor)} className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold disabled:opacity-30">Next</button></div></Surface>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_420px]"><Surface className="p-6 sm:p-8"><div className="flex items-center gap-3"><Landmark size={19}/><div><h2 className="text-xl font-semibold">Find a payment agent</h2><p className="text-sm text-black/35">Only agents listed by Deriv are shown.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><SelectField label="Currency" value={currency} onChange={(value) => void changeAgentFilters(value, country)} options={currencies}/><SelectField label="Country (optional)" value={country} onChange={(value) => void changeAgentFilters(currency, value)} options={["", ...countries]}/></div><div className="mt-5 grid gap-3">{agents.map((agent) => <button type="button" key={agent.id} onClick={() => setSelectedAgentID(agent.id)} className={`rounded-2xl border p-5 text-left ${selectedAgentID === agent.id ? "border-black bg-black/[.03]" : "border-black/[.07]"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{agent.name || agent.nickname || `Agent #${agent.id}`}</p><p className="mt-1 text-xs text-black/35">{agent.payment_methods?.join(" · ") || agent.information || "Contact agent for settlement methods"}</p></div><span className="text-xs font-semibold text-black/40">#{agent.id}</span></div><p className="mt-3 text-xs text-black/45">Withdraw {agent.withdrawal_minimum || "—"}–{agent.withdrawal_maximum || "—"} {currency} · commission {agent.withdrawal_commission ?? "—"}%</p></button>)}</div></Surface>
      <div className="space-y-4"><Surface className="p-6"><h2 className="text-lg font-semibold">Withdraw through agent</h2><p className="mt-2 text-sm leading-relaxed text-black/40">Deriv moves funds to the selected agent. The agent then pays you using the method you agree with them.</p><form onSubmit={withdraw} className="mt-5 space-y-3"><ReadOnlyField label="Selected agent" value={selectedAgent ? `${selectedAgent.name || selectedAgent.nickname || "Agent"} (#${selectedAgent.id})` : "Choose an agent"}/><InputField label={`Amount (${currency})`} value={amount} onChange={setAmount} type="number"/><button type="button" disabled={busy || !settings?.withdraw_enabled} onClick={() => void requestCode()} className="w-full rounded-full border border-black/10 px-4 py-3 text-sm font-semibold disabled:opacity-35"><KeyRound size={15} className="mr-2 inline"/> Send verification code</button>{verificationExpiry > Date.now() / 1000 && <InputField label="Six-digit Deriv code" value={verificationCode} onChange={setVerificationCode} inputMode="numeric"/>}<button disabled={busy || !verificationCode || !settings?.withdraw_enabled} className="w-full rounded-full bg-[#111310] px-4 py-3 text-sm font-semibold text-white disabled:opacity-35">Submit withdrawal</button></form></Surface>
      <Surface className="p-6"><h2 className="text-lg font-semibold">Payment-agent privacy</h2><p className="mt-2 text-sm text-black/40">Deposits {settings?.deposit_enabled ? "enabled" : "disabled"} · withdrawals {settings?.withdraw_enabled ? "enabled" : "disabled"}</p><label className="mt-4 flex items-start gap-3 text-sm font-medium"><input type="checkbox" checked={Boolean(settings?.show_real_name)} disabled={busy} onChange={(event) => void updatePrivacy(event.target.checked)} className="mt-1"/><span>Share my real name with payment agents on future transactions.</span></label></Surface></div></div>

      {ownAgent && <Surface className="mt-8 p-6 sm:p-8"><div className="flex items-center gap-3"><BadgeCheck className="text-[#568f47]"/><div><h2 className="text-xl font-semibold">Payment-agent deposit</h2><p className="text-sm text-black/35">Available because Deriv recognises this profile as payment agent #{ownAgent.id}.</p></div></div><form onSubmit={transfer} className="mt-5 grid gap-4 md:grid-cols-3"><InputField label="Recipient nickname" value={recipientNickname} onChange={setRecipientNickname}/><InputField label={`Amount (${currency})`} value={transferAmount} onChange={setTransferAmount} type="number"/><button disabled={busy} className="self-end rounded-full bg-[#111310] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-35"><Send size={15} className="mr-2 inline"/> Validate and transfer</button></form></Surface>}
      {pending && <Feedback tone="info"><span className="font-bold capitalize">{pending.kind}:</span> {pending.status} · reference {pending.requestID}{pending.transactionID ? ` · transaction ${pending.transactionID}` : ""}</Feedback>}
      <div className="mt-6"><Feedback tone="info"><ShieldAlert size={15} className="mr-2 inline"/><span className="font-bold">Payment-agent notice:</span> agents are independent third parties. Confirm identity, exchange rate, fees, and settlement method before sending money. Synex cannot reverse an off-platform settlement.</Feedback></div>
    </>}
  </>;
}

function createRequestID() { return globalThis.crypto?.randomUUID?.() || `synex-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function cursorFromLink(link?: string | null) { if (!link) return ""; try { return new URL(link, window.location.origin).searchParams.get("page_cursor") || ""; } catch { return ""; } }

function InputField({ label, value, onChange, type = "text", inputMode }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "numeric" }) {
  return <label className="block text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}<input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}/></label>;
}
function ReadOnlyField({ label, value }: { label: string; value: string }) { return <label className="block text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}<span className={`${fieldClass} block normal-case text-black/55`}>{value}</span></label>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="block text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>{options.map((option) => <option key={option || "all"} value={option}>{option ? option.toUpperCase() : "All countries"}</option>)}</select></label>; }

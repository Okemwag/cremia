import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage, type Notification, useSynexAPI } from "../../features/platform/services/synexApi";

export default function NotificationsPage() {
  const api = useSynexAPI();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const result = await api.notifications(); setItems(result.notifications); setUnread(result.unread); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [api]);
  useEffect(() => { void load(); }, [load]);

  const markRead = async (id = "") => {
    setError("");
    try { await api.markNotificationsRead(id); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
  };

  return <>
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/30">Account inbox</p><h1 className="mt-2 text-[36px] font-medium leading-none tracking-[-.05em] sm:text-[44px]">Notifications</h1><p className="mt-3 text-sm font-medium text-black/40">Trading, account, security and service updates in one place.</p></div>{unread > 0 && <button type="button" onClick={() => void markRead()} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/50 px-5 py-3 text-sm font-semibold"><CheckCheck size={16}/> Mark all read</button>}</div>
    {error && <div className="mt-6 rounded-xl border border-red-900/10 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}
    <section className="mt-8 overflow-hidden rounded-[22px] border border-black/[.07] bg-[#f7f7f4]">
      <div className="flex items-center justify-between border-b border-black/[.07] p-6"><div><h2 className="text-lg font-semibold tracking-[-.03em]">Recent updates</h2><p className="mt-1 text-xs text-black/35">{unread} unread · showing the latest 100</p></div><Bell size={18} className="text-black/30"/></div>
      {loading ? <div className="grid min-h-[400px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div> : items.length ? <div className="divide-y divide-black/[.06]">{items.map((item) => {
        const body = <div className="flex gap-4 px-6 py-5"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.read_at ? "bg-black/10" : "bg-[#6ca95b]"}`}/><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-sm leading-relaxed text-black/45">{item.body}</p><p className="mt-2 text-[10px] text-black/30">{new Date(item.created_at).toLocaleString()}</p></div>{!item.read_at && <button type="button" onClick={(event) => { event.preventDefault(); void markRead(item.id); }} className="self-start rounded-full border border-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-black/45">Read</button>}</div>;
        return item.action_url ? <Link key={item.id} to={item.action_url} onClick={() => { if (!item.read_at) void api.markNotificationsRead(item.id); }} className="block transition-colors hover:bg-black/[.025]">{body}</Link> : <div key={item.id}>{body}</div>;
      })}</div> : <div className="grid min-h-[400px] place-items-center p-8 text-center"><div><Bell className="mx-auto text-black/20"/><h3 className="mt-4 text-xl font-medium">You are all caught up</h3><p className="mt-2 text-sm text-black/40">New account and service updates will appear here.</p></div></div>}
    </section>
  </>;
}

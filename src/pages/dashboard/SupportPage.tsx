import { ArrowLeft, LoaderCircle, MessageCircle, Plus, Send } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  apiErrorMessage,
  type SupportMessage,
  type SupportTicket,
  useSynexAPI,
} from "../../features/platform/services/synexApi";

const categories: SupportTicket["category"][] = ["account", "trading", "funding", "verification", "technical", "other"];

export default function SupportPage() {
  const api = useSynexAPI();
  const [searchParams, setSearchParams] = useSearchParams();
  const ticketID = searchParams.get("ticket") || "";
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicket["category"]>("account");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = await api.supportTickets();
      setTickets(items);
      if (ticketID) {
        const thread = await api.supportThread(ticketID);
        setTicket(thread.ticket);
        setMessages(thread.messages);
      } else {
        setTicket(null);
        setMessages([]);
      }
    } catch (reason) {
      setError(apiErrorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [api, ticketID]);

  useEffect(() => { void load(); }, [load]);

  const createTicket = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const created = await api.createSupportTicket({ subject, category, message });
      setSubject(""); setMessage("");
      setSearchParams({ ticket: created.id });
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!ticketID || !reply.trim()) return;
    setBusy(true); setError("");
    try {
      await api.addSupportMessage(ticketID, reply.trim());
      setReply("");
      await load();
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  return (
    <>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/30">Client care</p>
        <h1 className="mt-2 text-[36px] font-medium leading-none tracking-[-.05em] sm:text-[44px]">Support centre</h1>
        <p className="mt-3 max-w-[650px] text-sm font-medium leading-relaxed text-black/40 sm:text-base">Open a secure support request and keep the full conversation attached to your Synex account.</p>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-900/10 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}

      {loading ? <div className="mt-8 grid min-h-[420px] place-items-center rounded-[22px] border border-black/[.07] bg-[#f7f7f4]"><LoaderCircle className="animate-spin text-black/30" /></div> : ticket ? (
        <section className="mt-8 overflow-hidden rounded-[22px] border border-black/[.07] bg-[#f7f7f4]">
          <div className="flex items-center gap-4 border-b border-black/[.07] p-6">
            <button type="button" onClick={() => setSearchParams({})} className="grid h-10 w-10 place-items-center rounded-full border border-black/10"><ArrowLeft size={16}/></button>
            <div className="min-w-0 flex-1"><h2 className="truncate text-lg font-semibold tracking-[-.03em]">{ticket.subject}</h2><p className="mt-1 text-xs capitalize text-black/35">{ticket.category} · {ticket.status} · opened {new Date(ticket.created_at).toLocaleDateString()}</p></div>
            <span className="rounded-full bg-[#deead8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#45643b]">{ticket.priority}</span>
          </div>
          <div className="mx-auto max-w-[850px] space-y-4 p-6 sm:p-8">
            {messages.map((item) => <div key={item.id} className={`flex ${item.sender_role === "customer" ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-[18px] px-5 py-4 ${item.sender_role === "customer" ? "bg-[#111310] text-white" : "border border-black/[.07] bg-white/70"}`}><p className="whitespace-pre-wrap text-sm leading-relaxed">{item.message}</p><p className={`mt-2 text-[10px] ${item.sender_role === "customer" ? "text-white/45" : "text-black/30"}`}>{item.sender_role === "customer" ? "You" : "Synex support"} · {new Date(item.created_at).toLocaleString()}</p></div></div>)}
          </div>
          {ticket.status !== "closed" && <form onSubmit={sendReply} className="flex gap-3 border-t border-black/[.07] p-5 sm:p-6"><textarea required maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply" className="min-h-[52px] flex-1 resize-y rounded-2xl border border-black/[.08] bg-white/60 px-4 py-3 text-sm outline-none"/><button disabled={busy || !reply.trim()} className="grid h-[52px] w-[52px] place-items-center self-end rounded-full bg-[#111310] text-white disabled:opacity-35" aria-label="Send reply"><Send size={17}/></button></form>}
        </section>
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_430px]">
          <section className="overflow-hidden rounded-[22px] border border-black/[.07] bg-[#f7f7f4]">
            <div className="flex items-center justify-between border-b border-black/[.07] p-6"><div><h2 className="text-lg font-semibold tracking-[-.03em]">Your requests</h2><p className="mt-1 text-xs text-black/35">Updates stay available in this secure workspace.</p></div><MessageCircle size={18} className="text-black/30"/></div>
            {tickets.length ? <div className="divide-y divide-black/[.06]">{tickets.map((item) => <Link key={item.id} to={`/app/support?ticket=${item.id}`} className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-black/[.025]"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.subject}</p><p className="mt-1 text-xs capitalize text-black/35">{item.category} · updated {new Date(item.updated_at).toLocaleString()}</p></div><span className="rounded-full bg-black/[.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-black/40">{item.status}</span></Link>)}</div> : <div className="grid min-h-[350px] place-items-center p-8 text-center"><div><MessageCircle className="mx-auto text-black/20"/><h3 className="mt-4 text-xl font-medium">No support requests</h3><p className="mt-2 text-sm text-black/40">Use the form to contact the Synex service team.</p></div></div>}
          </section>

          <section className="rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold tracking-[-.03em]">New request</h2><Plus size={17} className="text-black/30"/></div>
            <form onSubmit={createTicket} className="mt-5 space-y-3">
              <input required maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="What do you need help with?" className="w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm outline-none"/>
              <select value={category} onChange={(event) => setCategory(event.target.value as SupportTicket["category"])} className="w-full rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm font-semibold capitalize outline-none">{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
              <textarea required minLength={10} maxLength={5000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe the issue, including any relevant order or contract details." className="min-h-[170px] w-full resize-y rounded-xl border border-black/[.08] bg-white/60 px-4 py-3.5 text-sm leading-relaxed outline-none"/>
              <button disabled={busy || subject.trim().length === 0 || message.trim().length < 10} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111310] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-35"><Send size={15}/> Submit securely</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

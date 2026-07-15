import { BadgeCheck, ChevronRight, Circle, FileCheck2, Link2, LoaderCircle, ShieldAlert, UserRoundCheck } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  apiErrorMessage,
  type OnboardingStatus,
  type SuitabilityAssessment,
  type UserProfile,
  useSynexAPI,
} from "../../features/platform/services/synexApi";

const emptyProfile: UserProfile = {
  email: "", first_name: "", last_name: "", phone: "", country_of_residence: "",
  nationality: "", date_of_birth: "", address_line_1: "", city: "", postal_code: "",
  preferred_language: "en", marketing_consent: false,
};

const emptyAssessment: SuitabilityAssessment = {
  employment_status: "", annual_income_range: "", net_worth_range: "", source_of_funds: "",
  trading_experience: "none", trading_objective: "", risk_tolerance: "low", knowledge_score: 0,
};

const knowledgeQuestions = [
  { question: "A live price proposal…", answers: ["stays valid indefinitely", "may expire or change with the market", "guarantees a profit"], correct: 1 },
  { question: "A Deriv virtual account…", answers: ["uses practice funds", "can be withdrawn as cash", "removes all market risk from live trading"], correct: 0 },
  { question: "Short-duration contracts are…", answers: ["risk free", "the same as savings", "high risk and can lose the stake quickly"], correct: 2 },
  { question: "A stop-loss instruction…", answers: ["is a risk tool, not a profit guarantee", "guarantees execution at any exact price", "makes leverage harmless"], correct: 0 },
  { question: "Money used for trading should be…", answers: ["borrowed whenever possible", "money you can afford to lose", "your emergency fund"], correct: 1 },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-[.12em] text-black/35">{label}{children}</label>;
}

const inputClass = "mt-2 w-full rounded-xl border border-black/[.08] bg-white/65 px-4 py-3.5 text-sm font-semibold normal-case tracking-normal text-black outline-none focus:border-black/30";

export default function OnboardingPage() {
  const api = useSynexAPI();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [assessment, setAssessment] = useState<SuitabilityAssessment>(emptyAssessment);
  const [status, setStatus] = useState<OnboardingStatus>();
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1, -1, -1]);
  const [riskChecked, setRiskChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [profileResult, suitabilityResult, statusResult] = await Promise.all([
        api.profile(), api.suitability(), api.onboardingStatus(),
      ]);
      setProfile(profileResult);
      if (suitabilityResult.assessment) setAssessment(suitabilityResult.assessment);
      setStatus(statusResult);
    } catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { void load(); }, [load]);

  const knowledgeScore = useMemo(() => answers.reduce((score, answer, index) => score + (answer === knowledgeQuestions[index].correct ? 1 : 0), 0), [answers]);
  const allAnswered = answers.every((answer) => answer >= 0);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    try { setProfile(await api.updateProfile(profile)); setSuccess("Personal profile saved."); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const saveAssessment = async (event: FormEvent) => {
    event.preventDefault();
    if (!allAnswered) { setError("Answer every knowledge question before submitting."); return; }
    setBusy(true); setError(""); setSuccess("");
    try { setAssessment(await api.updateSuitability({ ...assessment, knowledge_score: knowledgeScore })); setSuccess(knowledgeScore >= 3 ? "Suitability assessment completed." : "Assessment saved. Review the learning material and retake the knowledge questions to unlock live trading."); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  const acknowledge = async () => {
    if (!status || !riskChecked) return;
    setBusy(true); setError(""); setSuccess("");
    try { await api.acknowledgeRisk(status.disclosure_version); setSuccess("Risk acknowledgement recorded."); await load(); }
    catch (reason) { setError(apiErrorMessage(reason)); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="grid min-h-[560px] place-items-center"><LoaderCircle className="animate-spin text-black/30"/></div>;

  const steps = [
    ["Personal profile", status?.profile_complete, UserRoundCheck],
    ["Suitability", status?.suitability_complete, FileCheck2],
    ["Risk disclosure", status?.risk_acknowledged, ShieldAlert],
    ["Deriv account", status?.deriv_connected, Link2],
  ] as const;

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-black/30">Account readiness</p><h1 className="mt-2 text-[36px] font-medium leading-none tracking-[-.05em] sm:text-[44px]">Complete onboarding</h1><p className="mt-3 max-w-[670px] text-sm font-medium leading-relaxed text-black/40 sm:text-base">Virtual trading is available after connecting Deriv. Personal details, suitability and risk acknowledgement are required before Synex permits execution on a real account.</p></div>{status?.ready_for_live && <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2.5 text-xs font-bold text-green-800"><BadgeCheck size={15}/> Ready for live trading</span>}</div>
      {error && <div className="mt-6 rounded-xl border border-red-900/10 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}{success && <div className="mt-6 rounded-xl border border-green-900/10 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{success}</div>}
      <section className="mt-8 grid gap-px overflow-hidden rounded-[22px] border border-black/[.07] bg-black/[.07] sm:grid-cols-2 xl:grid-cols-4">{steps.map(([label, complete, Icon]) => <div key={label} className="flex items-center gap-3 bg-[#f7f7f4] p-5"><span className={`grid h-9 w-9 place-items-center rounded-full ${complete ? "bg-green-100 text-green-700" : "bg-black/[.05] text-black/30"}`}>{complete ? <BadgeCheck size={17}/> : <Icon size={17}/>}</span><div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-black/35">{complete ? "Complete" : "Action required"}</p></div></div>)}</section>

      <form onSubmit={saveProfile} className="mt-4 rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">Step 1</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em]">Personal profile</h2></div>{status?.profile_complete && <BadgeCheck className="text-green-600"/>}</div><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="First name"><input required value={profile.first_name} onChange={(e) => setProfile({...profile, first_name:e.target.value})} className={inputClass}/></Field><Field label="Last name"><input required value={profile.last_name} onChange={(e) => setProfile({...profile, last_name:e.target.value})} className={inputClass}/></Field><Field label="Email"><input disabled value={profile.email} className={`${inputClass} opacity-55`}/></Field><Field label="Phone"><input value={profile.phone} onChange={(e) => setProfile({...profile, phone:e.target.value})} className={inputClass}/></Field><Field label="Date of birth"><input required type="date" value={profile.date_of_birth} onChange={(e) => setProfile({...profile, date_of_birth:e.target.value})} className={inputClass}/></Field><Field label="Country of residence"><input required maxLength={2} placeholder="KE" value={profile.country_of_residence} onChange={(e) => setProfile({...profile, country_of_residence:e.target.value.toUpperCase()})} className={inputClass}/></Field><Field label="Nationality"><input maxLength={2} placeholder="KE" value={profile.nationality} onChange={(e) => setProfile({...profile, nationality:e.target.value.toUpperCase()})} className={inputClass}/></Field><Field label="Address"><input required value={profile.address_line_1} onChange={(e) => setProfile({...profile, address_line_1:e.target.value})} className={inputClass}/></Field><Field label="City"><input required value={profile.city} onChange={(e) => setProfile({...profile, city:e.target.value})} className={inputClass}/></Field><Field label="Postal code"><input value={profile.postal_code} onChange={(e) => setProfile({...profile, postal_code:e.target.value})} className={inputClass}/></Field><Field label="Language"><select value={profile.preferred_language} onChange={(e) => setProfile({...profile, preferred_language:e.target.value})} className={inputClass}><option value="en">English</option><option value="sw">Kiswahili</option><option value="fr">French</option><option value="ar">Arabic</option></select></Field></div><label className="mt-6 flex items-start gap-3 text-sm font-medium text-black/45"><input type="checkbox" checked={profile.marketing_consent} onChange={(e) => setProfile({...profile, marketing_consent:e.target.checked})} className="mt-1"/> Receive optional product and market updates. This can be changed later.</label><button disabled={busy} className="mt-7 rounded-full bg-[#111310] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-40">Save profile</button></form>

      <form onSubmit={saveAssessment} className="mt-4 rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">Step 2</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em]">Suitability assessment</h2></div>{status?.suitability_complete && <BadgeCheck className="text-green-600"/>}</div><p className="mt-3 max-w-[740px] text-sm font-medium leading-relaxed text-black/40">This assessment records experience and financial context. It is not investment advice or a promise that trading is appropriate for you.</p><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="Employment"><select required value={assessment.employment_status} onChange={(e) => setAssessment({...assessment, employment_status:e.target.value})} className={inputClass}><option value="">Select</option><option value="employed">Employed</option><option value="self_employed">Self-employed</option><option value="student">Student</option><option value="retired">Retired</option><option value="unemployed">Not employed</option></select></Field><Field label="Annual income"><select required value={assessment.annual_income_range} onChange={(e) => setAssessment({...assessment, annual_income_range:e.target.value})} className={inputClass}><option value="">Select</option><option value="under_25k">Under USD 25k</option><option value="25k_50k">USD 25k–50k</option><option value="50k_100k">USD 50k–100k</option><option value="over_100k">Over USD 100k</option></select></Field><Field label="Net worth"><select required value={assessment.net_worth_range} onChange={(e) => setAssessment({...assessment, net_worth_range:e.target.value})} className={inputClass}><option value="">Select</option><option value="under_25k">Under USD 25k</option><option value="25k_100k">USD 25k–100k</option><option value="100k_500k">USD 100k–500k</option><option value="over_500k">Over USD 500k</option></select></Field><Field label="Source of funds"><select required value={assessment.source_of_funds} onChange={(e) => setAssessment({...assessment, source_of_funds:e.target.value})} className={inputClass}><option value="">Select</option><option value="employment">Employment income</option><option value="business">Business income</option><option value="savings">Savings</option><option value="investments">Investments</option><option value="inheritance">Inheritance</option></select></Field><Field label="Trading experience"><select value={assessment.trading_experience} onChange={(e) => setAssessment({...assessment, trading_experience:e.target.value as SuitabilityAssessment["trading_experience"]})} className={inputClass}><option value="none">None</option><option value="beginner">Under 1 year</option><option value="intermediate">1–3 years</option><option value="advanced">Over 3 years</option></select></Field><Field label="Primary objective"><select required value={assessment.trading_objective} onChange={(e) => setAssessment({...assessment, trading_objective:e.target.value})} className={inputClass}><option value="">Select</option><option value="learning">Learning with demo funds</option><option value="speculation">Short-term speculation</option><option value="hedging">Hedging</option><option value="diversification">Diversification</option></select></Field><Field label="Risk tolerance"><select value={assessment.risk_tolerance} onChange={(e) => setAssessment({...assessment, risk_tolerance:e.target.value as SuitabilityAssessment["risk_tolerance"]})} className={inputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></Field></div><div className="mt-8 border-t border-black/[.08] pt-7"><div className="flex items-end justify-between"><div><h3 className="text-lg font-semibold">Trading knowledge</h3><p className="mt-1 text-sm text-black/40">At least three correct answers are required for live-account readiness.</p></div><span className={`text-sm font-bold ${knowledgeScore >= 3 ? "text-green-700" : "text-black/35"}`}>{knowledgeScore}/5 correct</span></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{knowledgeQuestions.map((item,index) => <Field key={item.question} label={item.question}><select required value={answers[index]} onChange={(e) => setAnswers(answers.map((value,i) => i===index ? Number(e.target.value) : value))} className={inputClass}><option value={-1}>Choose an answer</option>{item.answers.map((answer,answerIndex) => <option key={answer} value={answerIndex}>{answer}</option>)}</select></Field>)}</div></div><button disabled={busy || !allAnswered} className="mt-7 rounded-full bg-[#111310] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-40">Submit assessment</button></form>

      <section className="mt-4 rounded-[22px] border border-black/[.07] bg-[#111310] p-6 text-white sm:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-white/35">Step 3</p><h2 className="mt-2 text-2xl font-medium tracking-[-.04em]">Risk disclosure</h2></div>{status?.risk_acknowledged && <BadgeCheck className="text-[#9de783]"/>}</div><div className="mt-7 rounded-2xl border border-white/10 bg-white/[.04] p-5 text-sm font-medium leading-relaxed text-white/55"><p>Trading options, leveraged products, and short-duration contracts involves significant risk. Prices can move quickly and you may lose the full amount committed to a contract. Past or virtual-account results do not predict live performance. Synex does not provide investment, legal, or tax advice.</p><p className="mt-4">Only trade with money you can afford to lose. Review each Deriv proposal and contract terms before confirming execution.</p></div><label className="mt-5 flex items-start gap-3 text-sm font-medium text-white/65"><input type="checkbox" checked={riskChecked || Boolean(status?.risk_acknowledged)} disabled={status?.risk_acknowledged} onChange={(e) => setRiskChecked(e.target.checked)} className="mt-1"/> I have read and understood this risk disclosure and accept version {status?.disclosure_version}.</label><button type="button" onClick={() => void acknowledge()} disabled={busy || !riskChecked || status?.risk_acknowledged} className="mt-6 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black disabled:opacity-30">{status?.risk_acknowledged ? "Acknowledged" : "Record acknowledgement"}</button></section>

      <section className="mt-4 flex flex-col gap-5 rounded-[22px] border border-black/[.07] bg-[#f7f7f4] p-6 sm:flex-row sm:items-center sm:p-8"><span className={`grid h-12 w-12 place-items-center rounded-full ${status?.deriv_connected ? "bg-green-100 text-green-700" : "bg-black/[.05] text-black/30"}`}>{status?.deriv_connected ? <BadgeCheck size={20}/> : <Link2 size={20}/>}</span><div className="flex-1"><p className="text-xs font-bold uppercase tracking-[.14em] text-black/30">Step 4</p><h2 className="mt-1 text-xl font-semibold">Connect a Deriv account</h2><p className="mt-2 text-sm font-medium text-black/40">Deriv owns account verification, available instruments, balances, contract settlement, and jurisdiction-specific restrictions.</p></div><Link to="/app/connect" className="inline-flex items-center gap-2 rounded-full bg-[#111310] px-5 py-3 text-sm font-semibold text-white">Manage accounts <ChevronRight size={15}/></Link></section>
      {!status?.ready_for_live && <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-900/10 bg-amber-50 px-4 py-3 text-sm font-medium leading-relaxed text-amber-900/70"><Circle size={14} className="mt-0.5 shrink-0"/> Live-account buying remains blocked until all required steps are complete. Virtual-account trading remains available after connection.</div>}
    </>
  );
}

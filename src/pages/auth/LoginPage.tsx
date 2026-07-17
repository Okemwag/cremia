import { useAuth0 } from "@auth0/auth0-react";
import { AlertCircle, ArrowLeft, ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { authConfig, safeReturnTo } from "../../config/auth";
import { authIssueFor, loginNoticeFor, type AuthIssue } from "../../config/authMessages";

type PendingAction = "sign-in" | "sign-up" | null;

export default function LoginPage() {
  const { error: authError, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [params] = useSearchParams();
  const returnTo = useMemo(() => safeReturnTo(params.get("returnTo")), [params]);
  const notice = useMemo(() => loginNoticeFor(params.get("reason")), [params]);
  const [email, setEmail] = useState("");
  const [redirectIssue, setRedirectIssue] = useState<AuthIssue | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const startLogin = useCallback(async (action: Exclude<PendingAction, null>) => {
    if (!authConfig.configured) return;
    setPendingAction(action);
    setRedirectIssue(null);

    try {
      await loginWithRedirect({
        appState: { returnTo },
        authorizationParams: {
          redirect_uri: authConfig.callbackUrl,
          scope: "openid profile email",
          ...(authConfig.audience ? { audience: authConfig.audience } : {}),
          ...(email.trim() ? { login_hint: email.trim() } : {}),
          ...(action === "sign-up" ? { screen_hint: "signup" } : {}),
        },
      });
    } catch (error) {
      setPendingAction(null);
      setRedirectIssue(authIssueFor(error));
    }
  }, [email, loginWithRedirect, returnTo]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void startLogin("sign-in");
  };

  if (isAuthenticated) return <Navigate to={returnTo} replace />;

  const issue = redirectIssue || (authError ? authIssueFor(authError) : null);
  const busy = isLoading || pendingAction !== null;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f2f2f0] px-5 py-10">
      <div aria-hidden="true" className="absolute left-1/2 top-[-22rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/90 blur-3xl" />

      <Link
        to="/"
        className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-black/55 transition-colors hover:bg-white/70 hover:text-black sm:left-8 sm:top-8"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Home
      </Link>

      <section className="relative w-full max-w-[420px] rounded-[30px] border border-black/[0.08] bg-[#fafaf7]/95 p-7 shadow-[0_30px_90px_rgba(20,20,17,0.10)] backdrop-blur sm:p-10">
        <Link to="/" className="inline-flex" aria-label="Synex home">
          <img
            src="/assets/synex/logo.svg"
            alt="Synex"
            className="h-7 w-auto"
          />
        </Link>

        <h1 className="mt-12 text-[38px] font-medium leading-none tracking-[-0.045em] text-[#090a09] sm:text-[44px]">
          Welcome back
        </h1>
        <p className="mt-3 text-[15px] font-medium text-black/45">
          Sign in and pick up right where you left off.
        </p>

        {!authConfig.configured && (
          <div role="alert" className="mt-7 rounded-2xl border border-amber-900/15 bg-amber-100/55 p-4 text-sm font-medium leading-relaxed text-amber-950/75">
            Sign-in is temporarily unavailable. Please try again later.
          </div>
        )}

        {notice && !issue && (
          <div className="mt-7 rounded-2xl border border-black/[0.08] bg-white/70 p-4 text-sm font-medium leading-relaxed text-black/55">
            <strong className="text-black/80">{notice.title}</strong> {notice.message}
          </div>
        )}

        {issue && (
          <div role="alert" className="mt-7 flex gap-3 rounded-2xl border border-red-900/10 bg-red-50 p-4 text-sm font-medium leading-relaxed text-red-800">
            <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
            <span><strong>{issue.title}</strong><br />{issue.message}</span>
          </div>
        )}

        <form className="mt-8" onSubmit={handleSubmit}>
          <label htmlFor="email" className="text-sm font-semibold text-black/75">
            Email address
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-black/15 bg-white px-4 transition focus-within:border-black/45 focus-within:ring-4 focus-within:ring-black/[0.04]">
            <Mail size={18} className="shrink-0 text-black/35" aria-hidden="true" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={busy}
              className="min-w-0 flex-1 bg-transparent py-4 text-[15px] font-medium text-black outline-none placeholder:text-black/30 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={!authConfig.configured || busy}
            className="mt-4 flex w-full items-center justify-between rounded-2xl bg-[#0b0c0b] px-5 py-4 text-sm font-semibold text-white transition duration-200 hover:bg-[#30322f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="flex items-center gap-2">
              {(isLoading || pendingAction === "sign-in") && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {pendingAction === "sign-in" ? "Opening sign in…" : "Continue"}
            </span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>

        <p className="mt-7 text-center text-sm font-medium text-black/45">
          New to Synex?{" "}
          <button
            type="button"
            disabled={!authConfig.configured || busy}
            onClick={() => void startLogin("sign-up")}
            className="font-semibold text-black underline decoration-black/20 underline-offset-4 transition hover:decoration-black disabled:cursor-not-allowed disabled:opacity-45"
          >
            {pendingAction === "sign-up" ? "Opening account setup…" : "Create an account"}
          </button>
        </p>

        <p className="mt-10 text-center text-xs font-medium leading-relaxed text-black/35">
          By continuing, you agree to our{" "}
          <Link to="/legal/terms" className="text-black/55 hover:text-black">Terms</Link>
          {" "}and acknowledge our{" "}
          <Link to="/legal/privacy" className="text-black/55 hover:text-black">Privacy Policy</Link>.
        </p>
      </section>
    </main>
  );
}

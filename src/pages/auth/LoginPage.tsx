import { useAuth0 } from "@auth0/auth0-react";
import { AlertCircle, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { authConfig, missingAuthConfig } from "../../config/auth";

let redirectStarted = false;

function safeReturnTo(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

export default function LoginPage() {
  const { error: authError, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const [params] = useSearchParams();
  const returnTo = useMemo(() => safeReturnTo(params.get("returnTo")), [params]);
  const [redirectError, setRedirectError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const startLogin = useCallback(async () => {
    if (!authConfig.configured) return;
    setRedirecting(true);
    setRedirectError("");
    try {
      await loginWithRedirect({
        appState: { returnTo },
        authorizationParams: {
          redirect_uri: authConfig.callbackUrl,
          ...(authConfig.audience ? { audience: authConfig.audience } : {}),
        },
      });
    } catch (error) {
      redirectStarted = false;
      setRedirecting(false);
      setRedirectError(error instanceof Error ? error.message : "Unable to open secure login.");
    }
  }, [loginWithRedirect, returnTo]);

  useEffect(() => {
    if (isLoading || isAuthenticated || !authConfig.configured || redirectStarted) return;
    redirectStarted = true;
    void startLogin();
  }, [isAuthenticated, isLoading, startLogin]);

  if (isAuthenticated) return <Navigate to={returnTo} replace />;

  const error = redirectError || authError?.message;
  return (
    <main className="grid min-h-screen place-items-center bg-[#e9e9e4] px-5 py-10">
      <section className="w-full max-w-[520px] rounded-[28px] border border-black/10 bg-[#f7f7f4] p-8 shadow-2xl shadow-black/5 sm:p-12">
        <a href="/" className="text-2xl font-semibold tracking-[-0.06em]">SYNEX</a>
        <div className="mt-16 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/35"><ShieldCheck size={15}/> Secure sign in</div>
        <h1 className="mt-4 text-[42px] font-medium leading-[0.98] tracking-[-0.05em] sm:text-[54px]">Opening your trading workspace.</h1>
        <p className="mt-6 text-base font-medium leading-relaxed text-black/45">You will authenticate with Auth0, then return to Synex. Your Auth0 password is never handled by this frontend.</p>

        {!authConfig.configured && <div className="mt-8 rounded-2xl border border-amber-900/15 bg-amber-100/50 p-4 text-sm font-medium leading-relaxed text-amber-950/70"><span className="font-bold">Authentication is not configured.</span><br/>Missing: {missingAuthConfig.join(", ")}</div>}
        {error && <div role="alert" className="mt-8 flex gap-3 rounded-2xl border border-red-900/10 bg-red-50 p-4 text-sm font-medium leading-relaxed text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={17}/><span>{error}</span></div>}

        <button type="button" disabled={!authConfig.configured || isLoading || redirecting} onClick={() => { redirectStarted = true; void startLogin(); }} className="mt-8 flex w-full items-center justify-between rounded-full bg-[#0b0c0b] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#30322f] disabled:cursor-not-allowed disabled:opacity-45">
          <span className="flex items-center gap-2">{(isLoading || redirecting) && <LoaderCircle size={16} className="animate-spin"/>}{isLoading ? "Preparing authentication" : redirecting ? "Redirecting to Auth0" : "Continue to secure login"}</span><ArrowRight size={17}/>
        </button>
        <a href="/" className="mt-5 block text-center text-xs font-semibold text-black/35 hover:text-black">Return to landing page</a>
      </section>
    </main>
  );
}

import { useAuth0 } from "@auth0/auth0-react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { authIssueFor } from "../../config/authMessages";

export default function AuthCallbackPage() {
  const { error, isAuthenticated, isLoading } = useAuth0();

  if (isAuthenticated) return <Navigate to="/app" replace />;
  const issue = error ? authIssueFor(error) : !isLoading ? authIssueFor(null) : null;

  return (
    <main className="grid min-h-screen place-items-center bg-[#e9e9e4] px-5">
      <section className="w-full max-w-[460px] rounded-[28px] border border-black/10 bg-[#f7f7f4] p-8 text-center shadow-2xl shadow-black/5 sm:p-12">
        {issue ? <><AlertCircle size={30} className="mx-auto text-red-600"/><h1 className="mt-5 text-3xl font-medium tracking-[-0.04em]">{issue.title}</h1><p role="alert" className="mt-4 text-sm font-medium leading-relaxed text-red-800">{issue.message}</p><Link to="/login?reason=retry" className="mt-7 inline-flex rounded-full bg-[#111310] px-6 py-3.5 text-sm font-semibold text-white">Try again</Link></> : <><LoaderCircle size={30} className="mx-auto animate-spin text-black/30"/><h1 className="mt-5 text-3xl font-medium tracking-[-0.04em]">Signing you in</h1><p className="mt-4 text-sm font-medium text-black/40">Your account will open in a moment.</p></>}
      </section>
    </main>
  );
}

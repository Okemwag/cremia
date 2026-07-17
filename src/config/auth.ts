const domain = import.meta.env.VITE_AUTH0_DOMAIN?.trim();
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim();
const audience = import.meta.env.VITE_AUTH0_AUDIENCE?.trim();
const callbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL?.trim();
const defaultCallbackUrl = import.meta.env.DEV
  ? "http://localhost:5173/auth/callback"
  : `${window.location.origin}/auth/callback`;

export const authConfig = {
  domain: domain || "synex.local",
  clientId: clientId || "synex-local-client",
  audience: audience || undefined,
  callbackUrl: callbackUrl || defaultCallbackUrl,
  configured: Boolean(domain && clientId && audience),
  apiConfigured: Boolean(audience),
};

export function safeReturnTo(value?: string | null) {
  if (!value) return "/app";
  try {
    const base = new URL("https://synex.local");
    const target = new URL(value, base);
    const isWorkspace = target.pathname === "/app" || target.pathname.startsWith("/app/");
    if (target.origin !== base.origin || !isWorkspace) return "/app";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/app";
  }
}

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
  configured: Boolean(domain && clientId),
  apiConfigured: Boolean(audience),
  devAuthBypass: import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === "true",
};

export const missingAuthConfig = [
  !domain && "VITE_AUTH0_DOMAIN",
  !clientId && "VITE_AUTH0_CLIENT_ID",
].filter(Boolean) as string[];

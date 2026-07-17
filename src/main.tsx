import { Auth0Provider, type AppState } from "@auth0/auth0-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { authConfig, safeReturnTo } from "./config/auth";
import "./index.css";

function onRedirectCallback(appState?: AppState) {
  window.history.replaceState({}, document.title, safeReturnTo(appState?.returnTo));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={{
        redirect_uri: authConfig.callbackUrl,
        scope: "openid profile email",
        ...(authConfig.audience ? { audience: authConfig.audience } : {}),
      }}
      cacheLocation="memory"
      useRefreshTokens
      useRefreshTokensFallback
      onRedirectCallback={onRedirectCallback}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
);

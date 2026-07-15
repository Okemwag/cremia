import { Auth0Provider, type AppState } from "@auth0/auth0-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { authConfig } from "./config/auth";
import "./index.css";

function onRedirectCallback(appState?: AppState) {
  window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={{
        redirect_uri: authConfig.callbackUrl,
        ...(authConfig.audience ? { audience: authConfig.audience } : {}),
      }}
      onRedirectCallback={onRedirectCallback}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
);

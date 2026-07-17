# Synex Auth0 production setup

Synex uses two public Auth0 applications and one custom API. The SPA and Android
app use Authorization Code with PKCE; neither application may contain an Auth0
client secret.

## 1. Custom API

Create or update the API with these values:

- Identifier: `https://api.synex.app` — no leading or trailing whitespace.
- Signing algorithm: RS256.
- User-delegated access: either **All apps allowed**, or **Per-app authorization**
  with explicit grants for both Synex applications.
- Client access: deny unless a separately approved machine-to-machine integration
  needs it. Machine tokens are not customer sessions.

If Auth0 reports `Client ... is not authorized to access resource server`, open
the API's **Application Access** tab and grant that application user-delegated
access, or change the user-delegated policy to **All apps allowed**.

## 2. Web Single Page Application

Application type: **Single Page Application**.

In Advanced Settings → Grant Types, enable **Authorization Code** and **Refresh
Token**. Turn on refresh-token rotation with expiry and a short overlap period,
and allow offline access for the Synex API. The web client keeps tokens in memory
and asks the SDK to rotate refresh tokens; do not work around this by putting a
client secret in Vite.

Local settings:

```text
Allowed Callback URLs: http://localhost:5173/auth/callback
Allowed Logout URLs: http://localhost:5173/
Allowed Web Origins: http://localhost:5173
```

Leave **Application Login URI** empty for localhost. Auth0 requires that field to
use HTTPS when it is populated; set it to `https://YOUR_WEB_DOMAIN/login` only
for production.

Frontend environment:

```dotenv
VITE_AUTH0_DOMAIN=dev-5uxh5z65i7cmrxna.us.auth0.com
VITE_AUTH0_CLIENT_ID=YOUR_SPA_CLIENT_ID
VITE_AUTH0_AUDIENCE=https://api.synex.app
VITE_AUTH0_CALLBACK_URL=http://localhost:5173/auth/callback
VITE_API_BASE_URL=http://localhost:8080
```

## 3. Android Native Application

Create a separate application with type **Native**. Add this URL to both Allowed
Callback URLs and Allowed Logout URLs:

```text
https://dev-5uxh5z65i7cmrxna.us.auth0.com/android/com.synex.mobile/callback
```

Enable Authorization Code and Refresh Token grants. In Advanced Settings →
Device Settings → Android, register package `com.synex.mobile` and the SHA-256
fingerprints for debug and release signing certificates. Auth0 then hosts the
App Link association used by the HTTPS callback.

Current local debug certificate SHA-256:

```text
E1:84:09:D1:36:F3:3C:94:A6:55:69:63:08:16:B4:7B:03:23:E0:47:6F:AA:8B:B1:3F:C7:47:1E:E6:40:63:A9
```

The release fingerprint must come from the final Play App Signing certificate;
do not reuse the debug fingerprint for production.

Add the public values to user-level `~/.gradle/gradle.properties`:

```properties
SYNEX_AUTH0_CLIENT_ID=YOUR_NATIVE_CLIENT_ID
SYNEX_AUTH0_DOMAIN=dev-5uxh5z65i7cmrxna.us.auth0.com
SYNEX_AUTH0_AUDIENCE=https://api.synex.app
```

Do not add a client secret. The Android SDK stores renewable credentials through
`SecureCredentialsManager`, which encrypts them using Android Keystore.

## 4. Go API

```dotenv
AUTH0_DOMAIN=dev-5uxh5z65i7cmrxna.us.auth0.com
AUTH0_AUDIENCE=https://api.synex.app
FRONTEND_URL=http://localhost:5173
```

The API accepts only RS256 tokens with the configured issuer, audience, expiry,
and subject. The first protected request provisions the local Synex user from
Auth0 `/userinfo`; all later requests resolve the local user by Auth0 subject.

## 5. Customer journey verification

1. Open `/` and select **Login** or **Launch app**.
2. Confirm the browser opens Auth0 Universal Login.
3. Sign up or sign in and return to `/auth/callback`, then `/app`.
4. Confirm `GET /v1/auth/session` returns the authenticated local user.
5. Refresh `/app`; the SPA should recover the Auth0 session without a bypass.
6. Allow an access token to expire and confirm the SDK renews it without customer action.
7. Revoke or expire the session and confirm Synex shows a friendly sign-in-again message.
8. Sign out and confirm `/app` redirects to login.
9. On Android, sign in through the Custom Tab, return by the verified App Link,
   close and reopen the app, then sign out and confirm credentials are cleared.

Rotate any Auth0 client secret that has ever been pasted into a terminal transcript,
chat, issue, or log. The SPA and Android app do not use it.

# Google OAuth — Merchant Center

Use this guide to connect Shopping Rescue to Google Merchant Center via OAuth.

## 1. Create a Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Content API for Shopping** (and Merchant API if prompted)

## 2. Configure the OAuth consent screen

1. APIs & Services → OAuth consent screen
2. User type: External (or Internal for Workspace-only testing)
3. App name: Shopping Rescue
4. Add scopes:
   - `https://www.googleapis.com/auth/content`
   - `email` (optional, for the connected Google account label)

## 3. Create OAuth client credentials

1. APIs & Services → Credentials → Create credentials → OAuth client ID
2. Application type: **Web application**
3. Authorized redirect URIs:
   - Local: `http://localhost:3000/api/oauth/google/callback`
   - Production: `https://YOUR-DOMAIN/api/oauth/google/callback`

## 4. Railway / `.env` variables

```env
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://YOUR-DOMAIN/api/oauth/google/callback
TOKEN_ENCRYPTION_KEY=<openssl rand -base64 32>
```

`TOKEN_ENCRYPTION_KEY` must be a 32-byte key, base64-encoded. It encrypts refresh tokens at rest.

## 5. Verify

1. Sign in to `/dashboard` with magic link
2. Open `/dashboard/integrations`
3. Click **Connect Merchant Center**
4. Approve access → accounts sync → issues appear after `MERCHANT_SYNC` completes on the worker

## Notes

- Offline access (`access_type=offline` + `prompt=consent`) is required so we store a refresh token.
- PKCE (`code_challenge`) is used on the authorize URL.
- Disconnect soft-deletes the connection row and stops future syncs until reconnected.

# Setup Guide

Step-by-step from zero to a running Inumaki AI instance.

---

## Prerequisites

| Requirement          | Version | Notes                                         |
| -------------------- | ------- | --------------------------------------------- |
| Node.js              | ≥ 20    | Use nvm or fnm                                |
| pnpm                 | ≥ 9     | `npm i -g pnpm`                               |
| PostgreSQL           | ≥ 14    | Local or hosted (Supabase, Neon, Railway)     |
| OpenAI account       | —       | Need API key with GPT-4o + Whisper access     |
| Google Cloud project | —       | For OAuth (optional if using magic link only) |
| Resend account       | —       | For magic link emails                         |

---

## 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE inumaki;
CREATE USER inumaki_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inumaki TO inumaki_user;
```

Or use a hosted option:

- [Neon](https://neon.tech) — free tier, great for dev
- [Supabase](https://supabase.com) — free tier
- [Railway](https://railway.app) — easy deploys

---

## 2. Google OAuth credentials

1. [Google Cloud Console](https://console.cloud.google.com) → New project
2. APIs & Services → OAuth consent screen
   - User type: **Internal** (limits to your Workspace)
   - Fill required fields
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://your-domain.com/api/auth/callback/google` (prod)
4. Copy Client ID and Client Secret

---

## 3. Resend (magic link email)

1. [Resend](https://resend.com) → Create account
2. API Keys → Create key
3. Domains → Add and verify your domain (or use `@resend.dev` for testing)

---

## 4. Environment setup

```bash
cd apps/web
cp ../../.env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://inumaki_user:your_password@localhost:5432/inumaki"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="Inumaki AI <noreply@yourdomain.com>"

OPENAI_API_KEY="sk-..."

ALLOWED_EMAIL_DOMAINS="yourcompany.com"
```

---

## 5. Install and migrate

```bash
# From repo root
pnpm install

# Generate Prisma client + push schema
cd apps/web
pnpm db:generate
pnpm db:push
```

---

## 6. First run

```bash
# Terminal 1 — web backend
pnpm dev:web

# Terminal 2 — desktop app (optional for web-only testing)
pnpm dev:desktop
```

Open `http://localhost:3000` → sign in → you'll land on `/dashboard`.

---

## 7. Promote to admin

After first sign-in, run this SQL:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@yourcompany.com';
```

Or via Prisma Studio:

```bash
cd apps/web && pnpm db:studio
```

---

## 8. Deploy to production

### Web backend (Vercel recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# From apps/web
vercel --prod
```

Set all env vars in Vercel dashboard (same as `.env.local`).

Update `NEXTAUTH_URL` to your production URL.

Add production redirect URI to Google OAuth credentials.

### Desktop app — build for Windows

```bash
pnpm build:desktop
# Output in apps/desktop/dist/
```

Or trigger the GitHub Actions release workflow by pushing a tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## Troubleshooting

**`PrismaClientInitializationError`**  
→ Check `DATABASE_URL` is correct and PostgreSQL is running.

**`OAuthCallbackError`**  
→ Redirect URI mismatch. Check Google OAuth credentials match your `NEXTAUTH_URL`.

**Email not delivered**  
→ Check `RESEND_API_KEY` and `EMAIL_FROM` domain is verified in Resend.

**Hotkey not registering**  
→ Another app may be using the same shortcut. Change hotkey in Settings.

**Microphone permission denied**  
→ Windows: Settings → Privacy → Microphone → allow the app.

**OpenAI 401**  
→ `OPENAI_API_KEY` is invalid or has no credits. Check platform.openai.com.

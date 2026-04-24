// apps/web/src/lib/auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '../db';
import { users, invites, userPreferences } from '../db/schema';
import { eq } from 'drizzle-orm';

// ─── Allowed domains & emails ─────────────────────────────────────
const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS ?? '')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean);

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE =
  process.env.SMTP_SECURE === 'true' || (process.env.SMTP_SECURE == null && SMTP_PORT === 465);

function isEmailAllowed(email: string): boolean {
  if (ALLOWED_EMAILS.includes(email)) return true;
  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
}

// ─── Auth config ──────────────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  adapter: DrizzleAdapter(db),
  session: { strategy: 'database' },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: ALLOWED_DOMAINS[0] ?? undefined, // Google Workspace domain hint
          prompt: 'select_account',
        },
      },
    }),

    // Magic link via SMTP
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST!,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      },
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const email = user.email;
      if (!email) return false;

      // Check allowlist
      if (!isEmailAllowed(email)) {
        // Check if explicitly invited
        const [invite] = await db.select().from(invites).where(eq(invites.email, email));
        if (!invite || invite.status !== 'PENDING') return false;
      }

      // Check if user exists and is active
      const [dbUser] = await db.select().from(users).where(eq(users.email, email));
      if (dbUser && !dbUser.isActive) return false;

      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        const [dbUser] = await db
          .select({ role: users.role, isActive: users.isActive })
          .from(users)
          .where(eq(users.id, user.id));
        session.user.id = user.id;
        session.user.role = (dbUser?.role ?? 'USER') as 'USER' | 'ADMIN';
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Auto-create default preferences
      if (user.id) {
        await db
          .insert(userPreferences)
          .values({
            userId: user.id,
          })
          .catch(() => {}); // ignore error if exists

        // Mark invite as accepted if present
        if (user.email) {
          await db
            .update(invites)
            .set({ status: 'ACCEPTED' })
            .where(eq(invites.email, user.email))
            .catch(() => {}); // ignore if no invite
        }
      }
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },
});

// ─── Type augmentation ────────────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

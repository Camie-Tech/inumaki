import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  primaryKey,
  pgEnum,
  real,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
export const outputModeEnum = pgEnum('output_mode', ['RAW', 'CLEAN', 'POLISHED', 'CODING_PROMPT']);
export const inviteStatusEnum = pgEnum('invite_status', ['PENDING', 'ACCEPTED', 'EXPIRED']);

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  name: text('name'),
  image: text('image'),
  role: roleEnum('role').default('USER').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const accounts = pgTable(
  'account',
  {
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable('session', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const userPreferences = pgTable('user_preferences', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  defaultMode: outputModeEnum('default_mode').default('CLEAN').notNull(),
  autoPaste: boolean('auto_paste').default(true).notNull(),
  previewBeforePaste: boolean('preview_before_paste').default(false).notNull(),
  hotkey: text('hotkey').default('Control+Shift+Space').notNull(),
  microphoneId: text('microphone_id'),
  tonePreference: text('tone_preference').default('neutral').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const usageLogs = pgTable('usage_log', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  mode: outputModeEnum('mode').notNull(),
  audioDurationSeconds: real('audio_duration_seconds').notNull(),
  success: boolean('success').notNull(),
  errorCode: text('error_code'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const invites = pgTable('invite', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  invitedById: text('invited_by_id')
    .notNull()
    .references(() => users.id),
  status: inviteStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

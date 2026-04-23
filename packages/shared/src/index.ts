// ─── Output Modes ────────────────────────────────────────────────
export type OutputMode = 'raw' | 'clean' | 'polished' | 'coding_prompt';

export const OUTPUT_MODE_LABELS: Record<OutputMode, string> = {
  raw: 'Raw Transcript',
  clean: 'Clean Text',
  polished: 'Polished Message',
  coding_prompt: 'Coding Prompt',
};

// ─── User ─────────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// ─── User Preferences ─────────────────────────────────────────────
export interface UserPreferences {
  id: string;
  userId: string;
  defaultMode: OutputMode;
  autoPaste: boolean;
  previewBeforePaste: boolean;
  hotkey: string;
  microphoneId: string | null;
  tonePreference: string;
}

// ─── API Payloads ─────────────────────────────────────────────────
export interface TranscribeRequest {
  audioBase64: string;
  mimeType: string;
  durationSeconds: number;
}

export interface TranscribeResponse {
  transcript: string;
}

export interface RewriteRequest {
  transcript: string;
  mode: OutputMode;
  tonePreference?: string;
}

export interface RewriteResponse {
  output: string;
  mode: OutputMode;
}

export interface ProcessAudioRequest extends TranscribeRequest {
  mode: OutputMode;
  tonePreference?: string;
}

export interface ProcessAudioResponse {
  transcript: string;
  output: string;
  mode: OutputMode;
}

// ─── Usage Logs ───────────────────────────────────────────────────
export interface UsageLog {
  id: string;
  userId: string;
  mode: OutputMode;
  audioDurationSeconds: number;
  success: boolean;
  errorCode: string | null;
  createdAt: string;
}

// ─── Admin ────────────────────────────────────────────────────────
export interface InviteRequest {
  email: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalLogs: number;
  recentLogs: UsageLog[];
}

// ─── IPC (Desktop ↔ Main process) ────────────────────────────────
export type IpcChannel =
  | 'start-recording'
  | 'stop-recording'
  | 'process-audio'
  | 'process-audio-result'
  | 'process-audio-error'
  | 'get-preferences'
  | 'save-preferences'
  | 'get-microphones'
  | 'paste-text'
  | 'copy-text'
  | 'recording-state-change'
  | 'show-preview'
  | 'hotkey-triggered';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

export interface RecordingStateChange {
  state: RecordingState;
  message?: string;
}

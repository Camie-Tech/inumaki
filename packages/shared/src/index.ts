export type OutputMode = 'raw' | 'clean' | 'polished' | 'coding_prompt';

export const OUTPUT_MODE_LABELS: Record<OutputMode, string> = {
  raw: 'Raw Transcript',
  clean: 'Clean Text',
  polished: 'Polished Message',
  coding_prompt: 'Coding Prompt',
};

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

export type IpcChannel =
  | 'start-recording'
  | 'stop-recording'
  | 'process-audio'
  | 'process-audio-result'
  | 'process-audio-error'
  | 'paste-text'
  | 'copy-text'
  | 'recording-state-change'
  | 'overlay-state'
  | 'hotkey-triggered';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

export interface RecordingStateChange {
  state: RecordingState;
  message?: string;
}

/**
 * State of the floating "listening" HUD overlay shown during the global-hotkey
 * dictation flow. `listening`/`hiding` are overlay-only; `hiding` triggers the
 * fade-out animation just before the main process hides the window.
 */
export type OverlayState =
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'
  | 'hiding'
  | 'idle';

export interface OverlayStateChange {
  state: OverlayState;
  message?: string;
}

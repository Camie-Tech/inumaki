// apps/desktop/src/main/audio-recorder.ts
import { desktopCapturer } from 'electron';

export interface AudioResult {
  audioBase64: string;
  mimeType: string;
  durationSeconds: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private recording = false;
  private stream: MediaStream | null = null;

  // NOTE: MediaRecorder runs in the renderer process.
  // The main process orchestrates start/stop and receives base64 audio via IPC.
  // This class acts as a state tracker; actual recording is in recorder-bridge.ts (renderer).

  isRecording() {
    return this.recording;
  }

  setRecording(value: boolean) {
    this.recording = value;
  }

  setStartTime(time: number) {
    this.startTime = time;
  }

  getElapsed() {
    return this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
  }

  start() {
    this.recording = true;
    this.startTime = Date.now();
  }

  async stop(): Promise<AudioResult | null> {
    this.recording = false;
    // Actual stop is handled in renderer; this signals state only
    return null;
  }

  cleanup() {
    this.recording = false;
    this.stream?.getTracks().forEach((t) => t.stop());
  }
}

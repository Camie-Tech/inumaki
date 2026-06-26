// apps/desktop/src/main/audio-recorder.ts
//
// Recording-state tracker for the global-hotkey flow. The actual audio capture
// runs in the renderer (MediaRecorder via getUserMedia in useRecorder); the main
// process only tracks whether a capture is in progress and orchestrates
// start/stop over IPC ('start-recording' / 'process-audio'). It deliberately
// does NOT try to return audio — that lives in the renderer.
export class AudioRecorder {
  private recording = false;
  private startTime = 0;

  isRecording() {
    return this.recording;
  }

  setRecording(value: boolean) {
    this.recording = value;
  }

  getElapsed() {
    return this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
  }

  start() {
    this.recording = true;
    this.startTime = Date.now();
  }

  // Flip state only; the renderer is signalled separately to stop + process.
  stop() {
    this.recording = false;
  }

  cleanup() {
    this.recording = false;
  }
}

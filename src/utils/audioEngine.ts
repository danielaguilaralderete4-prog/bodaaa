// Audio engine for "Caminar de tu mano" (Río Roma ft. Fonseca)
// Combines rich Web Audio API acoustic guitar/piano synthesis and HTML5 Audio (.mp3)

class WeddingAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private audioEl: HTMLAudioElement | null = null;
  private intervalId: number | null = null;
  private step: number = 0;
  private customAudioUrl: string | null = null;

  constructor() {
    // Lazy setup
  }

  public setCustomAudioUrl(url: string | null) {
    this.customAudioUrl = url;
    if (this.audioEl && url) {
      this.audioEl.src = url;
      if (this.isPlaying) {
        this.audioEl.play().catch(() => {});
      }
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Melody for Río Roma - Caminar de tu Mano (Chorus & Verse romantic phrasing)
  private melodyNotes = [
    // Coro: "Y quiero caminar de tu mano..." (D - F# - A - B - A - F# - E - D)
    { f: 293.66, dur: 0.35, chord: [146.83, 220.0, 293.66, 369.99] }, // D major
    { f: 369.99, dur: 0.35, chord: null },
    { f: 440.0, dur: 0.4, chord: null },
    { f: 493.88, dur: 0.6, chord: null },
    { f: 440.0, dur: 0.35, chord: null },
    { f: 369.99, dur: 0.35, chord: null },
    { f: 329.63, dur: 0.35, chord: null },
    { f: 293.66, dur: 0.7, chord: [196.0, 246.94, 293.66, 392.0] }, // G major

    // "...lo que me resta de camino" (D - E - F# - G - F# - E - D)
    { f: 293.66, dur: 0.3, chord: null },
    { f: 329.63, dur: 0.3, chord: null },
    { f: 369.99, dur: 0.35, chord: null },
    { f: 392.0, dur: 0.45, chord: null },
    { f: 369.99, dur: 0.35, chord: null },
    { f: 329.63, dur: 0.35, chord: null },
    { f: 293.66, dur: 0.8, chord: [220.0, 277.18, 329.63, 440.0] }, // A major

    // "...que los cumpleaños que me faltan" (D - F# - A - B - A - F# - E - D)
    { f: 293.66, dur: 0.3, chord: [123.47, 185.0, 246.94, 293.66] }, // Bm
    { f: 369.99, dur: 0.35, chord: null },
    { f: 440.0, dur: 0.4, chord: null },
    { f: 493.88, dur: 0.6, chord: null },
    { f: 440.0, dur: 0.35, chord: null },
    { f: 369.99, dur: 0.35, chord: null },
    { f: 329.63, dur: 0.35, chord: null },
    { f: 293.66, dur: 0.7, chord: [196.0, 246.94, 293.66, 392.0] }, // G major

    // "...siempre los pases conmigo" (D - E - F# - G - F# - E - D)
    { f: 293.66, dur: 0.3, chord: null },
    { f: 329.63, dur: 0.3, chord: null },
    { f: 369.99, dur: 0.35, chord: null },
    { f: 392.0, dur: 0.45, chord: null },
    { f: 369.99, dur: 0.35, chord: null },
    { f: 329.63, dur: 0.4, chord: null },
    { f: 293.66, dur: 1.2, chord: [146.83, 220.0, 293.66, 369.99] }, // D resolve
  ];

  private playPluckedString(freq: number, dur: number, gainVal: number = 0.15) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;

    // Pluck oscillator (rich triangle)
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Warm body resonance (sine)
    const body = this.ctx.createOscillator();
    body.type = 'sine';
    body.frequency.setValueAtTime(freq * 0.5, now);

    // Gain envelope with crisp attack and gentle acoustic decay
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + dur + 0.5);

    osc.connect(filter);
    body.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    body.start(now);
    osc.stop(now + dur + 0.7);
    body.stop(now + dur + 0.7);
  }

  private playStep() {
    if (!this.isPlaying || !this.ctx) return;
    const item = this.melodyNotes[this.step % this.melodyNotes.length];

    // Play melody note
    this.playPluckedString(item.f, item.dur, 0.14);

    // Play chord if present
    if (item.chord) {
      item.chord.forEach((freq, idx) => {
        setTimeout(() => {
          this.playPluckedString(freq, 1.2, 0.05);
        }, idx * 30);
      });
    }

    this.step++;
  }

  public async start() {
    this.isPlaying = true;
    this.initContext();

    // If we have custom MP3 audio, attempt playback
    if (this.customAudioUrl) {
      try {
        if (!this.audioEl) {
          this.audioEl = new Audio(this.customAudioUrl);
          this.audioEl.loop = true;
          this.audioEl.volume = 0.85;
        }
        await this.audioEl.play();
        return;
      } catch (err) {
        console.log('Falling back to acoustic generator', err);
      }
    }

    // Play acoustic guitar melody
    if (!this.intervalId) {
      this.playStep();
      this.intervalId = window.setInterval(() => this.playStep(), 360);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public getPlayingState(): boolean {
    return this.isPlaying;
  }
}

export const weddingAudio = new WeddingAudioEngine();

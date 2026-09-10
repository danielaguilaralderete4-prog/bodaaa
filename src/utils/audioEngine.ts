// Audio engine for the supplied wedding song.

class WeddingAudioEngine {
  private isPlaying: boolean = false;
  private audioEl: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;

  public setCustomAudioUrl(url: string | null) {
    this.customAudioUrl = url;
    if (this.audioEl && url) {
      this.audioEl.src = url;
      this.audioEl.load();
      if (this.isPlaying) {
        void this.audioEl.play().catch(() => {
          this.isPlaying = false;
        });
      }
    }
  }

  public async start() {
    if (!this.customAudioUrl) {
      console.warn('Wedding song is not available yet.');
      return;
    }

    if (!this.audioEl) {
      this.audioEl = new Audio(this.customAudioUrl);
      this.audioEl.loop = true;
      this.audioEl.preload = 'auto';
      this.audioEl.volume = 0.85;
    }

    await this.audioEl.play();
    this.isPlaying = true;
  }

  public stop() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
  }

  public getPlayingState(): boolean {
    return this.isPlaying;
  }
}

export const weddingAudio = new WeddingAudioEngine();

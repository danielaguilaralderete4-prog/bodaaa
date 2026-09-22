// Audio engine for the supplied wedding song.

type VolumeChangeCallback = (message: string) => void;

class WeddingAudioEngine {
  private isPlaying: boolean = false;
  private audioEl: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;
  private hasPlayedOnce: boolean = false; // Track first play
  private normalVolume: number = 0.85;
  private backgroundVolume: number = 0.25;
  private onVolumeChange: VolumeChangeCallback | null = null;

  public setVolumeChangeCallback(callback: VolumeChangeCallback | null) {
    this.onVolumeChange = callback;
  }

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
      this.audioEl.volume = this.normalVolume;

      // Listener for when the song ends (first play completes)
      this.audioEl.addEventListener('ended', this.handleSongEnded);
    }

    await this.audioEl.play();
    this.isPlaying = true;
  }

  private handleSongEnded = () => {
    if (!this.hasPlayedOnce) {
      this.hasPlayedOnce = true;
      // After first play completes, lower the volume for subsequent loops
      if (this.audioEl) {
        this.audioEl.volume = this.backgroundVolume;
        // Trigger callback to show toast
        if (this.onVolumeChange) {
          this.onVolumeChange('🎵 Canción en modo ambientación');
        }
      }
    }
  };

  public stop() {
    this.isPlaying = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
  }

  public getPlayingState(): boolean {
    return this.isPlaying;
  }

  public resetPlayState() {
    this.hasPlayedOnce = false;
    if (this.audioEl) {
      this.audioEl.volume = this.normalVolume;
    }
  }
}

export const weddingAudio = new WeddingAudioEngine();

export class MusicEngine {
  private audioElement: HTMLAudioElement | null = null;
  private currentGenre: string = "lofi";

  private musicUrls: Record<string, string> = {
    lofi: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
    nature: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3",
    ambient: "https://www.bensound.com/bensound-music/bensound-memories.mp3",
    focus: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
  };

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.src = this.musicUrls[this.currentGenre];
  }

  play(genre: string, volume: number) {
    if (!this.audioElement) return;

    if (this.currentGenre !== genre || !this.audioElement.src) {
      this.currentGenre = genre;
      this.audioElement.src = this.musicUrls[genre] || this.musicUrls.lofi;
    }

    this.audioElement.volume = volume;
    this.audioElement.play().catch(() => {
      console.log("Music playback requires user interaction");
    });
  }

  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  cleanup() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = "";
    }
  }
}

export function playTimerAlarm() {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1);

  setTimeout(() => {
    audioContext.close();
  }, 1500);
}

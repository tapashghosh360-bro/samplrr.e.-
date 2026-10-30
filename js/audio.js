// Luxury Web Audio API sound designer
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  toggleSound() {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      this.playChime(523.25, 0.08); // C5 welcome chime
    }
    return this.soundEnabled;
  }

  playChime(freq = 659.25, gainLevel = 0.04) {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;
    
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      
      gain.gain.setValueAtTime(gainLevel, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.45);
    } catch (e) {
      // Ignore audio glitches gracefully
    }
  }

  playSoftClick() {
    this.playChime(440.00, 0.03); // A4 soft click
  }

  playSuccess() {
    if (!this.soundEnabled) return;
    this.playChime(587.33, 0.05); // D5
    setTimeout(() => this.playChime(880.00, 0.06), 120); // A5
  }
}

export const soundManager = new SoundManager();

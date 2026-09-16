/**
 * Web Audio API Acoustic Siren & Speech Alert Synthesizer.
 * Provides instant sound and voice early-warning announcements
 * for field operations and NDRF command stations with zero external assets.
 */

class AudioAlertBroadcaster {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a dual-tone acoustic early-warning chime.
   */
  public playAlertChime(severity: 'warning' | 'advisory' = 'warning') {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Two oscillator pulses for tactical emergency siren
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = severity === 'warning' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(severity === 'warning' ? 880 : 660, now);
      osc.frequency.exponentialRampToValueAtTime(severity === 'warning' ? 440 : 520, now + 0.35);
      osc.frequency.setValueAtTime(severity === 'warning' ? 880 : 660, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(severity === 'warning' ? 440 : 520, now + 0.75);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch (e) {
      console.warn('AudioContext alert playback not permitted or unavailable:', e);
    }
  }

  /**
   * Broadcasts a voice warning directive via browser SpeechSynthesis.
   */
  public speakDirective(text: string, lang: 'en' | 'hi' = 'en') {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = 0.9;
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  }
}

export const alertBroadcaster = new AudioAlertBroadcaster();

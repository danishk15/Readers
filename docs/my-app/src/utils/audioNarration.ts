/**
 * Intelligent Multi-Language Audio Narration & Neural TTS Engine
 * Supports Urdu, Hindi, Arabic, Persian, English, Spanish, French, German, and all languages.
 * Provides sentence-by-sentence playback, live phrase highlighting, pause/resume, and audio fallbacks.
 */

export interface NarrationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIdx: number;
  totalSentences: number;
  currentSentenceText: string;
  langCode: string;
  speed: number;
}

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isNative: boolean;
  quality: 'neural' | 'standard';
}

/**
 * Cleanly splits text into naturally speakable sentence chunks across multiple scripts.
 */
export function splitTextIntoSentences(text: string, langCode: string = 'en'): string[] {
  if (!text) return [];

  // Punctuation for multiple languages:
  // Urdu: '۔', '؟', '!'
  // Hindi: '।', '॥', '?', '!'
  // Arabic: '؟', '!', '.'
  // Western: '.', '!', '?', ';'
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ۔ ')
    .trim();

  // Split regex respecting Urdu, Hindi, Arabic, and English sentence boundaries
  const rawParts = normalized.split(/([۔।॥.!?؟;\n]+)/g);
  const sentences: string[] = [];

  let current = '';
  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (part.match(/^[۔।॥.!?؟;\n\s]+$/)) {
      current += part;
      if (current.trim().length > 3) {
        sentences.push(current.trim());
        current = '';
      }
    } else {
      current += (current ? ' ' : '') + part;
    }
  }

  if (current.trim().length > 0) {
    sentences.push(current.trim());
  }

  // Sub-chunk any remaining huge sentences over 200 characters to prevent browser engine cutoff
  const finalSentences: string[] = [];
  for (const s of sentences) {
    if (s.length <= 220) {
      finalSentences.push(s);
    } else {
      const words = s.split(/\s+/);
      let chunk = '';
      for (const w of words) {
        if ((chunk + ' ' + w).length > 180) {
          if (chunk) finalSentences.push(chunk.trim());
          chunk = w;
        } else {
          chunk += (chunk ? ' ' : '') + w;
        }
      }
      if (chunk.trim()) finalSentences.push(chunk.trim());
    }
  }

  return finalSentences.filter(s => s.trim().length > 1);
}

/**
 * Best voice resolver matching target language code
 */
export function getBestVoiceForLanguage(langCode: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const code = langCode.toLowerCase().slice(0, 2);

  // Exact country match (e.g. ur-PK, ur-IN, hi-IN, ar-SA, en-US)
  const exactMatches = voices.filter(v => v.lang.toLowerCase().startsWith(code));

  if (exactMatches.length > 0) {
    // Prioritize natural / neural / premium voices
    const neural = exactMatches.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Neural') || 
      v.name.includes('Online') || 
      v.name.includes('Google')
    );
    if (neural) return neural;
    return exactMatches[0];
  }

  // Script-based fallback for related languages
  if (code === 'ur') {
    // Urdu fallback: Hindi or Arabic voice if Urdu voice is not installed on the OS
    const hiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
    if (hiVoice) return hiVoice;
    const arVoice = voices.find(v => v.lang.toLowerCase().startsWith('ar'));
    if (arVoice) return arVoice;
  }

  if (code === 'hi') {
    // Hindi fallback
    const urVoice = voices.find(v => v.lang.toLowerCase().startsWith('ur'));
    if (urVoice) return urVoice;
    const inVoice = voices.find(v => v.lang.toLowerCase().includes('-in'));
    if (inVoice) return inVoice;
  }

  if (code === 'fa') {
    // Persian fallback: Arabic voice
    const arVoice = voices.find(v => v.lang.toLowerCase().startsWith('ar'));
    if (arVoice) return arVoice;
  }

  // Default English fallback
  const defaultEn = voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0];
  return defaultEn || null;
}

/**
 * Audio Narration Controller Class
 */
export class AudioNarrationController {
  private sentences: string[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private langCode: string = 'en';
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private keepAliveTimer: any = null;
  private onStateChange: ((state: NarrationState) => void) | null = null;
  private audioFallback: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }
  }

  public subscribe(callback: (state: NarrationState) => void) {
    this.onStateChange = callback;
    this.emit();
  }

  private emit() {
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        currentSentenceIdx: this.currentIndex,
        totalSentences: this.sentences.length,
        currentSentenceText: this.sentences[this.currentIndex] || '',
        langCode: this.langCode,
        speed: this.rate
      });
    }
  }

  public loadText(text: string, langCode: string = 'en', startIdx: number = 0) {
    this.stop();
    this.langCode = langCode;
    this.sentences = splitTextIntoSentences(text, langCode);
    this.currentIndex = Math.max(0, Math.min(startIdx, this.sentences.length - 1));
    this.emit();
  }

  public setSpeed(speed: number) {
    this.rate = Math.max(0.5, Math.min(speed, 2.5));
    this.emit();
  }

  public setVoice(voice: SpeechSynthesisVoice | null) {
    this.selectedVoice = voice;
  }

  public play(startIdx?: number) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (startIdx !== undefined) {
      this.currentIndex = Math.max(0, Math.min(startIdx, this.sentences.length - 1));
    }

    if (this.sentences.length === 0) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.startKeepAlive();
    this.speakCurrentSentence();
    this.emit();
  }

  public pause() {
    if (typeof window === 'undefined') return;
    this.isPaused = true;
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    if (this.audioFallback) {
      this.audioFallback.pause();
    }
    this.emit();
  }

  public resume() {
    if (typeof window === 'undefined') return;
    this.isPaused = false;
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      this.speakCurrentSentence();
    }
    this.emit();
  }

  public stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.stopKeepAlive();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.audioFallback) {
      try {
        this.audioFallback.pause();
        this.audioFallback.currentTime = 0;
      } catch {}
    }
    this.emit();
  }

  public nextSentence() {
    if (this.currentIndex < this.sentences.length - 1) {
      this.currentIndex++;
      if (this.isPlaying) {
        this.speakCurrentSentence();
      } else {
        this.emit();
      }
    } else {
      this.stop();
    }
  }

  public prevSentence() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      if (this.isPlaying) {
        this.speakCurrentSentence();
      } else {
        this.emit();
      }
    }
  }

  public jumpToSentence(idx: number) {
    this.currentIndex = Math.max(0, Math.min(idx, this.sentences.length - 1));
    if (this.isPlaying) {
      this.speakCurrentSentence();
    } else {
      this.emit();
    }
  }

  private speakCurrentSentence() {
    if (!this.isPlaying || this.currentIndex >= this.sentences.length) {
      this.stop();
      return;
    }

    const phrase = this.sentences[this.currentIndex];
    if (!phrase || !phrase.trim()) {
      this.nextSentence();
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // Resolve voice
    const voices = window.speechSynthesis.getVoices();
    const voice = this.selectedVoice || getBestVoiceForLanguage(this.langCode, voices);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || this.langCode;
    } else {
      utterance.lang = this.langCode;
    }

    utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        this.nextSentence();
      }
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error on sentence:', e);
      if (this.isPlaying && !this.isPaused) {
        // Attempt audio streaming fallback for Urdu/Hindi if OS voice fails
        this.tryAudioFallback(phrase, this.langCode, () => {
          this.nextSentence();
        });
      }
    };

    window.speechSynthesis.speak(utterance);
    this.emit();
  }

  private tryAudioFallback(phrase: string, lang: string, onDone: () => void) {
    try {
      const cleanLang = lang.slice(0, 2);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${cleanLang}&client=tw-ob&q=${encodeURIComponent(phrase.slice(0, 150))}`;
      
      if (this.audioFallback) {
        this.audioFallback.pause();
      }
      this.audioFallback = new Audio(url);
      this.audioFallback.playbackRate = this.rate;
      this.audioFallback.onended = () => {
        onDone();
      };
      this.audioFallback.onerror = () => {
        onDone();
      };
      this.audioFallback.play().catch(() => onDone());
    } catch {
      onDone();
    }
  }

  // Workaround for Chrome/Edge 15s freeze bug
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis && this.isPlaying && !this.isPaused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 12000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}

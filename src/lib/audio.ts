// Simple Web Audio API synthesizer for game sound effects

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

function playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') audioCtx.resume()

  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime)

  gain.gain.setValueAtTime(vol, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)

  osc.connect(gain)
  gain.connect(audioCtx.destination)

  osc.start()
  osc.stop(audioCtx.currentTime + duration)
}

export let isSoundEnabled = typeof window !== 'undefined' ? localStorage.getItem('bhao_sound') !== 'false' : true

export function toggleSound() {
  isSoundEnabled = !isSoundEnabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('bhao_sound', String(isSoundEnabled))
  }
  return isSoundEnabled
}

export function playSound(effect: 'draw' | 'play' | 'attack' | 'defend' | 'win' | 'lose') {
  if (!audioCtx || !isSoundEnabled) return

  switch (effect) {
    case 'draw':
      playTone(400, 'sine', 0.1, 0.05)
      setTimeout(() => playTone(600, 'sine', 0.1, 0.05), 50)
      break
    case 'play':
      playTone(300, 'triangle', 0.1, 0.1)
      setTimeout(() => playTone(800, 'triangle', 0.15, 0.1), 100)
      break
    case 'attack':
      playTone(150, 'sawtooth', 0.3, 0.15)
      setTimeout(() => playTone(100, 'sawtooth', 0.4, 0.15), 100)
      break
    case 'defend':
      playTone(800, 'square', 0.1, 0.05)
      setTimeout(() => playTone(1200, 'square', 0.2, 0.05), 100)
      break
    case 'win':
      [400, 500, 600, 800, 1000].forEach((f, i) => {
        setTimeout(() => playTone(f, 'sine', 0.3, 0.1), i * 150)
      })
      break
    case 'lose':
      [300, 250, 200, 150].forEach((f, i) => {
        setTimeout(() => playTone(f, 'sawtooth', 0.4, 0.1), i * 200)
      })
      break
  }
}

class AudioManager {
  private ctx: AudioContext | null = null;

  private init() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext init failed", e);
    }
  }

  public playThump() {
    if (!isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch(e) {}
  }

  public playSwoosh() {
    if (!isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.3; 
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.3);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start();
    } catch(e) {}
  }

  public playChaChing() {
    if (!isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    try {
      const playNote = (freq: number, delay: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, this.ctx!.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.3, this.ctx!.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + delay + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(this.ctx!.currentTime + delay);
        osc.stop(this.ctx!.currentTime + delay + 0.3);
      };

      playNote(1200, 0);
      playNote(1600, 0.1);
    } catch(e) {}
  }
}

export const audio = new AudioManager();

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessBeep() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // First tone (A5)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(880, now);
  
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.06, now + 0.03);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.12);

  // Second tone (E6)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1320, now + 0.06);
  
  gain2.gain.setValueAtTime(0.001, now + 0.06);
  gain2.gain.linearRampToValueAtTime(0.08, now + 0.09);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.06);
  osc2.stop(now + 0.22);
}

export function playErrorBuzz() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, now);
  
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

export function playSirenTone() {
  const ctx = getAudioContext();
  if (!ctx) return () => {};

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = "triangle";
  osc.frequency.setValueAtTime(600, now);
  
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  // Frequency sweep via LFO
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 2; // 2Hz oscillation
  lfoGain.gain.value = 150; // swing frequency by 150Hz
  
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  
  lfo.start(now);
  osc.start(now);
  
  return () => {
    try {
      const stopTime = ctx.currentTime;
      gain.gain.cancelScheduledValues(stopTime);
      gain.gain.setValueAtTime(gain.gain.value, stopTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.15);
      setTimeout(() => {
        osc.stop();
        lfo.stop();
      }, 200);
    } catch (e) {}
  };
}

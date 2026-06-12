/*
  Synthesized sfx via Web Audio API: zero assets, instant load.
  API mirrors a sample-based player so a recorded pack can replace this later.
*/

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(v: boolean) {
  muted = v;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  startAt: number,
  duration: number,
  type: OscillatorType = "sine",
  gainPeak = 0.18
) {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + startAt;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sfx = {
  click() {
    tone(660, 0, 0.06, "triangle", 0.08);
  },
  correct() {
    tone(660, 0, 0.12, "sine");
    tone(880, 0.09, 0.18, "sine");
  },
  wrong() {
    tone(196, 0, 0.22, "sawtooth", 0.12);
    tone(147, 0.1, 0.28, "sawtooth", 0.1);
  },
  complete() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, "triangle"));
  },
  streak() {
    tone(784, 0, 0.1, "square", 0.07);
    tone(988, 0.1, 0.1, "square", 0.07);
    tone(1175, 0.2, 0.25, "square", 0.09);
  },
  leagueUp() {
    [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3, "triangle"));
  },
};

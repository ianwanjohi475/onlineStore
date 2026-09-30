/**
 * SIR VERT "added to cart" sound.
 *
 * Synthesised live with the Web Audio API — no audio file, so there is nothing
 * to license: a soft "pop" followed by a bright two-note rising chime
 * (E6 → B6) with a gentle shimmer. Under half a second, quiet, and original.
 */

const KEY = "sv_sound";
let ctx: AudioContext | null = null;

export function soundEnabled() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage blocked — ignore */
  }
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(ac: AudioContext, out: AudioNode, freq: number, start: number, dur: number, type: OscillatorType, peak: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(gain).connect(out);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function playCartSound() {
  if (!soundEnabled()) return;
  const ac = audio();
  if (!ac) return;
  try {
    const t = ac.currentTime + 0.01;
    const master = ac.createGain();
    master.gain.value = 0.55;
    master.connect(ac.destination);

    // 1. soft "pop" — a quick downward pitch sweep
    const pop = ac.createOscillator();
    const popGain = ac.createGain();
    pop.type = "sine";
    pop.frequency.setValueAtTime(520, t);
    pop.frequency.exponentialRampToValueAtTime(140, t + 0.07);
    popGain.gain.setValueAtTime(0.0001, t);
    popGain.gain.exponentialRampToValueAtTime(0.35, t + 0.005);
    popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    pop.connect(popGain).connect(master);
    pop.start(t);
    pop.stop(t + 0.1);

    // 2. rising two-note chime with a quiet octave shimmer
    tone(ac, master, 1318.5, t + 0.06, 0.22, "triangle", 0.22); // E6
    tone(ac, master, 1975.5, t + 0.14, 0.34, "triangle", 0.2); // B6
    tone(ac, master, 3951, t + 0.14, 0.18, "sine", 0.04); // shimmer
  } catch {
    /* audio not available — stay silent */
  }
}

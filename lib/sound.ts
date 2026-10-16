/**
 * Audio Synthesizer for tactile UI sound effects using Web Audio API.
 * Requires zero external audio files and runs with sub-millisecond latency.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a subtle, clean tactile pop when a card is lifted/picked up.
 */
export function playCardPickupSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Upward micro-pitch glide (160Hz -> 320Hz) over 35ms
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

    // Subtle volume envelope with fast decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignore audio playback errors gracefully
  }
}

/**
 * Play a rich, satisfying, tactile snap when a card is dropped into a swimlane.
 */
export function playCardDropSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Primary tactile snap (triangle wave)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();

    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(260, now);
    snapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.055);

    snapGain.gain.setValueAtTime(0.001, now);
    snapGain.gain.linearRampToValueAtTime(0.12, now + 0.005);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);

    snapOsc.start(now);
    snapOsc.stop(now + 0.075);

    // 2. Subtle low-end thump for weight (sine wave)
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();

    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(110, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    thumpGain.gain.setValueAtTime(0.001, now);
    thumpGain.gain.linearRampToValueAtTime(0.09, now + 0.008);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    thumpOsc.start(now);
    thumpOsc.stop(now + 0.095);
  } catch {
    // Ignore audio playback errors gracefully
  }
}

/**
 * Play a gentle double-tap error tone when a move is invalid (e.g. unresolved blocker).
 */
export function playCardErrorSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    [0, 0.08].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now + offset);

      gain.gain.setValueAtTime(0.001, now + offset);
      gain.gain.linearRampToValueAtTime(0.06, now + offset + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.055);
    });
  } catch {
    // Ignore audio playback errors gracefully
  }
}

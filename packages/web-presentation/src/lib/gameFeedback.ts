// Feedback sutil opcional (Web Audio API sin dependencias) y log interno de errores de guardado.

export type UiSoundKind = 'tab' | 'turn' | 'atn' | 'select' | 'error';

const SOUND_PREF_KEY = 'LA_ROSCA_SOUND_ENABLED';
let sharedAudioCtx: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SOUND_PREF_KEY) !== 'false';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SOUND_PREF_KEY, enabled ? 'true' : 'false');
}

function resolveAudioCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

function getAudioContext(): AudioContext | null {
  const Ctx = resolveAudioCtor();
  if (!Ctx) return null;
  if (!sharedAudioCtx) sharedAudioCtx = new Ctx();
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => undefined);
  }
  return sharedAudioCtx;
}

const SOUND_PROFILES: Record<UiSoundKind, { freq: number; endFreq: number; dur: number; gain: number }> = {
  tab: { freq: 520, endFreq: 640, dur: 0.045, gain: 0.025 },
  select: { freq: 440, endFreq: 550, dur: 0.06, gain: 0.03 },
  atn: { freq: 490, endFreq: 740, dur: 0.11, gain: 0.045 },
  turn: { freq: 330, endFreq: 495, dur: 0.14, gain: 0.05 },
  error: { freq: 220, endFreq: 165, dur: 0.12, gain: 0.045 }
};

export function playUiSound(kind: UiSoundKind): void {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const profile = SOUND_PROFILES[kind];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(profile.freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(profile.endFreq, ctx.currentTime + profile.dur);
    gain.gain.setValueAtTime(profile.gain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + profile.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + profile.dur);
  } catch {
    // Bloqueo de autoplay o entorno sin WebAudio: degradacion silenciosa.
  }
}

export function reportSaveFailure(scope: string, error: unknown): string {
  console.error(`[LA ROSCA · ${scope}]`, error);
  if (scope === 'import') {
    return 'No pudimos cargar ese código de partida. Verificá que esté completo y probá de nuevo.';
  }
  return 'No se pudo guardar la partida en este dispositivo. Podés reintentar sin perder tu progreso actual.';
}

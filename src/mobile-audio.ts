// Mobile build deliberately has no audio or ASMR sound-pack behavior.
export const soundEffects = {
  setSoundEnabled: (_enabled: boolean) => {},
  isEnabled: () => false,
  setAmbientSoundscape: (_soundscape: unknown, _volume?: number) => {},
  setAmbientVolume: (_volume: number) => {},
  playReleaseSound: () => {},
  playClickSound: () => {},
  playTypingSound: (_pack?: unknown, _note?: unknown, _key?: string, _isSpace?: boolean) => {},
  playDeleteSound: () => {},
  playSaveSound: () => {},
  playShatterSound: () => {},
  vibrate: (_pattern?: number | number[]) => {},
};

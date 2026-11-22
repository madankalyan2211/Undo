// Audio Synthesizer & Soundscapes for Mobile (Touch sounds removed)
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export class MobileSoundEffects {
  private currentAmbientSound: Audio.Sound | null = null;
  private isSoundEnabled = true;

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  // Touch click sound intentionally removed
  public playClickSound() {
    // Touch sound removed
    return;
  }

  public async playReleaseSound() {
    if (!this.isSoundEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
  }

  public async playDeleteSound() {
    if (!this.isSoundEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // ignore
    }
  }
}

export const mobileSoundEffects = new MobileSoundEffects();

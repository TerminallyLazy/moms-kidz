"use client"

class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {}
  private enabled: boolean = true
  private volume: number = 0.5

  constructor() {
    // Initialize sounds
    this.sounds = {
      achievement: new Audio('/sounds/achievement.mp3'),
      levelUp: new Audio('/sounds/level-up.mp3'),
      points: new Audio('/sounds/points.mp3'),
      streak: new Audio('/sounds/streak.mp3'),
      challenge: new Audio('/sounds/challenge.mp3'),
      notification: new Audio('/sounds/notification.mp3'),
    }

    // Set initial volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume
    })
  }

  private async ensureLoaded(sound: HTMLAudioElement): Promise<void> {
    if (sound.readyState < 2) { // HAVE_CURRENT_DATA
      return new Promise((resolve) => {
        sound.addEventListener('canplaythrough', () => resolve(), { once: true })
        sound.load()
      })
    }
  }

  async play(soundName: keyof typeof this.sounds): Promise<void> {
    if (!this.enabled) return

    const sound = this.sounds[soundName]
    if (!sound) return

    try {
      await this.ensureLoaded(sound)
      sound.currentTime = 0
      await sound.play()
    } catch (error) {
      console.error(`Failed to play sound: ${soundName}`, error)
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    localStorage.setItem('soundEnabled', enabled.toString())
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume
    })
    localStorage.setItem('soundVolume', this.volume.toString())
  }

  isEnabled(): boolean {
    return this.enabled
  }

  getVolume(): number {
    return this.volume
  }

  // Load preferences from localStorage
  loadPreferences(): void {
    const soundEnabled = localStorage.getItem('soundEnabled')
    if (soundEnabled !== null) {
      this.enabled = soundEnabled === 'true'
    }

    const soundVolume = localStorage.getItem('soundVolume')
    if (soundVolume !== null) {
      this.setVolume(parseFloat(soundVolume))
    }
  }
}

// Create singleton instance
const soundManager = new SoundManager()

// Load preferences when the module is imported
if (typeof window !== 'undefined') {
  soundManager.loadPreferences()
}

export { soundManager }

// Sound effect hooks
export function useGamificationSounds() {
  const playAchievementSound = async () => {
    await soundManager.play('achievement')
  }

  const playLevelUpSound = async () => {
    await soundManager.play('levelUp')
  }

  const playPointsSound = async () => {
    await soundManager.play('points')
  }

  const playStreakSound = async () => {
    await soundManager.play('streak')
  }

  const playChallengeSound = async () => {
    await soundManager.play('challenge')
  }

  const playNotificationSound = async () => {
    await soundManager.play('notification')
  }

  return {
    playAchievementSound,
    playLevelUpSound,
    playPointsSound,
    playStreakSound,
    playChallengeSound,
    playNotificationSound,
    setEnabled: soundManager.setEnabled.bind(soundManager),
    setVolume: soundManager.setVolume.bind(soundManager),
    isEnabled: soundManager.isEnabled.bind(soundManager),
    getVolume: soundManager.getVolume.bind(soundManager),
  }
}

// Sound effect types
export type GamificationSoundEffect = 
  | 'achievement'
  | 'levelUp'
  | 'points'
  | 'streak'
  | 'challenge'
  | 'notification'
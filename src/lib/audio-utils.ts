import { logger } from './logger'

export class AudioUtils {
  private static readonly MAX_AUDIO_SIZE = 100 * 1024 * 1024 // 100MB
  private static readonly ALLOWED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/webm']

  /**
   * Get audio duration
   */
  static async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio()
        const url = URL.createObjectURL(file)
        
        audio.addEventListener('loadedmetadata', () => {
          URL.revokeObjectURL(url)
          resolve(Math.round(audio.duration))
        })

        audio.addEventListener('error', (error) => {
          URL.revokeObjectURL(url)
          reject(error)
        })

        audio.src = url
      } catch (error) {
        logger.error('Error getting audio duration:', error)
        reject(error)
      }
    })
  }

  /**
   * Validate audio file
   */
  static async validateAudio(file: File): Promise<boolean> {
    try {
      if (file.size > this.MAX_AUDIO_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${this.MAX_AUDIO_SIZE / (1024 * 1024)}MB`)
      }

      if (!this.ALLOWED_FORMATS.includes(file.type)) {
        throw new Error('Invalid audio format. Supported formats: MP3, WAV, WebM')
      }

      // Try to get duration to validate file is playable
      await this.getAudioDuration(file)

      return true
    } catch (error) {
      logger.error('Audio validation failed:', error)
      return false
    }
  }

  /**
   * Format duration
   */
  static formatDuration(seconds: number): string {
    try {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60

      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
      }
      return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
    } catch (error) {
      logger.error('Error formatting duration:', error)
      return '0:00'
    }
  }

  /**
   * Create waveform data
   */
  static async createWaveformData(file: File, samples: number = 100): Promise<number[]> {
    return new Promise((resolve, reject) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const reader = new FileReader()

        reader.onload = async () => {
          try {
            const audioData = await audioContext.decodeAudioData(reader.result as ArrayBuffer)
            const channelData = audioData.getChannelData(0)
            const blockSize = Math.floor(channelData.length / samples)
            const waveform = []

            for (let i = 0; i < samples; i++) {
              const start = blockSize * i
              let sum = 0

              for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(channelData[start + j])
              }

              waveform.push(sum / blockSize)
            }

            // Normalize values between 0 and 1
            const max = Math.max(...waveform)
            const normalizedWaveform = waveform.map(w => w / max)

            resolve(normalizedWaveform)
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      } catch (error) {
        logger.error('Error creating waveform data:', error)
        reject(error)
      }
    })
  }

  /**
   * Record audio
   */
  static async startRecording(): Promise<MediaRecorder> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      logger.info('Audio recording started')
      return mediaRecorder
    } catch (error) {
      logger.error('Error starting audio recording:', error)
      throw error
    }
  }

  /**
   * Stop recording
   */
  static stopRecording(mediaRecorder: MediaRecorder): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const chunks: Blob[] = []

        mediaRecorder.addEventListener('dataavailable', (e) => {
          chunks.push(e.data)
        })

        mediaRecorder.addEventListener('stop', () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          logger.info('Audio recording stopped')
          resolve(blob)
        })

        mediaRecorder.stop()
      } catch (error) {
        logger.error('Error stopping audio recording:', error)
        reject(error)
      }
    })
  }

  /**
   * Extract audio metadata
   */
  static async getMetadata(file: File): Promise<{
    duration: number
    format: string
    size: number
    bitrate?: number
  }> {
    try {
      const duration = await this.getAudioDuration(file)
      const bitrate = file.size * 8 / duration // bits per second

      return {
        duration,
        format: file.type,
        size: file.size,
        bitrate: Math.round(bitrate)
      }
    } catch (error) {
      logger.error('Error getting audio metadata:', error)
      throw error
    }
  }

  /**
   * Check if browser supports audio recording
   */
  static isRecordingSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  /**
   * Create audio preview URL
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Revoke preview URL
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
  }
}

export default AudioUtils
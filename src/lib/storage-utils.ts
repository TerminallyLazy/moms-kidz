import { supabase } from './supabase'
import { logger } from './logger'

interface UploadOptions {
  bucket: string
  path: string
  contentType?: string
  maxSize?: number // in bytes
}

export class StorageUtils {
  private static readonly DEFAULT_MAX_SIZE = 100 * 1024 * 1024 // 100MB
  private static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  private static readonly ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/webm']

  /**
   * Upload a file to storage
   */
  static async uploadFile(
    file: File,
    options: UploadOptions
  ): Promise<{ url: string; path: string }> {
    try {
      // Validate file size
      const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE
      if (file.size > maxSize) {
        throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`)
      }

      // Validate content type if specified
      if (options.contentType) {
        if (options.contentType.startsWith('image/') && !this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
          throw new Error('Invalid image type. Allowed types: JPEG, PNG, WebP')
        }
        if (options.contentType.startsWith('audio/') && !this.ALLOWED_AUDIO_TYPES.includes(file.type)) {
          throw new Error('Invalid audio type. Allowed types: MP3, WAV, WebM')
        }
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomString}.${fileExtension}`
      const filePath = `${options.path}/${fileName}`

      // Upload file
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path)

      if (urlError) throw urlError

      logger.info('File uploaded successfully', {
        bucket: options.bucket,
        path: data.path,
        size: file.size,
        type: file.type
      })

      return {
        url: publicUrl,
        path: data.path
      }
    } catch (error) {
      logger.error('Error uploading file:', error)
      throw error
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(
    files: File[],
    options: UploadOptions
  ): Promise<Array<{ url: string; path: string }>> {
    return Promise.all(files.map(file => this.uploadFile(file, options)))
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) throw error

      logger.info('File deleted successfully', {
        bucket,
        path
      })
    } catch (error) {
      logger.error('Error deleting file:', error)
      throw error
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(bucket: string, path: string) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit: 1,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        })

      if (error) throw error
      if (!data.length) throw new Error('File not found')

      return data[0]
    } catch (error) {
      logger.error('Error getting file metadata:', error)
      throw error
    }
  }

  /**
   * Create a signed URL for temporary access
   */
  static async createSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

      if (error) throw error
      if (!data?.signedUrl) throw new Error('Failed to create signed URL')

      return data.signedUrl
    } catch (error) {
      logger.error('Error creating signed URL:', error)
      throw error
    }
  }

  /**
   * Move a file within storage
   */
  static async moveFile(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath)

      if (error) throw error

      logger.info('File moved successfully', {
        bucket,
        fromPath,
        toPath
      })
    } catch (error) {
      logger.error('Error moving file:', error)
      throw error
    }
  }

  /**
   * Copy a file within storage
   */
  static async copyFile(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .copy(fromPath, toPath)

      if (error) throw error

      logger.info('File copied successfully', {
        bucket,
        fromPath,
        toPath
      })
    } catch (error) {
      logger.error('Error copying file:', error)
      throw error
    }
  }

  /**
   * List files in a bucket directory
   */
  static async listFiles(
    bucket: string,
    path: string = '',
    options: {
      limit?: number
      offset?: number
      sortBy?: { column: string; order: 'asc' | 'desc' }
    } = {}
  ) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, options)

      if (error) throw error

      return data
    } catch (error) {
      logger.error('Error listing files:', error)
      throw error
    }
  }
}

export default StorageUtils

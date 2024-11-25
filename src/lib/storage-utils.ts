import { supabase } from './supabase'
import { ImageUtils } from './image-utils'
import { logger } from './logger'

export class StorageUtils {
  /**
   * Upload file to Supabase storage
   */
  static async uploadFile(
    file: File,
    options: {
      bucket?: string;
      path?: string;
      upsert?: boolean;
      compress?: boolean;
      generateThumbnail?: boolean;
    } = {}
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    try {
      const {
        bucket = 'public',
        path = '',
        upsert = false,
        compress = true,
        generateThumbnail = false
      } = options

      // Process file before upload
      let processedFile: File | Blob = file
      if (compress && ImageUtils.isImage(file)) {
        processedFile = await ImageUtils.compressImage(file)
      }

      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop() || ImageUtils.getExtensionFromMimeType(file.type)
      const filename = `${timestamp}.${extension}`
      const fullPath = path ? `${path}/${filename}` : filename

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, processedFile, {
          upsert,
          contentType: file.type
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      // Generate and upload thumbnail if requested
      let thumbnailUrl: string | undefined
      if (generateThumbnail && ImageUtils.isImage(file)) {
        const thumbnail = await ImageUtils.generateThumbnail(file)
        const thumbnailPath = path ? `${path}/thumbnails/${filename}` : `thumbnails/${filename}`
        
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from(bucket)
          .upload(thumbnailPath, thumbnail, {
            upsert,
            contentType: 'image/jpeg'
          })

        if (!thumbnailError && thumbnailData) {
          const { data: { publicUrl: thumbUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(thumbnailData.path)
          thumbnailUrl = thumbUrl
        }
      }

      return { url: publicUrl, thumbnailUrl }
    } catch (error) {
      logger.error('Error uploading file', error as Error, {
        filename: file.name,
        size: file.size,
        type: file.type
      })
      throw error
    }
  }

  /**
   * Delete file from Supabase storage
   */
  static async deleteFile(
    path: string,
    options: {
      bucket?: string;
      deleteThumbnail?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const {
        bucket = 'public',
        deleteThumbnail = false
      } = options

      // Delete main file
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) throw error

      // Delete thumbnail if requested
      if (deleteThumbnail) {
        const thumbnailPath = path.replace(/^(.+)\/([^\/]+)$/, '$1/thumbnails/$2')
        await supabase.storage
          .from(bucket)
          .remove([thumbnailPath])
          .catch(error => logger.warn('Error deleting thumbnail', error))
      }
    } catch (error) {
      logger.error('Error deleting file', error as Error, { path })
      throw error
    }
  }

  /**
   * Get file metadata from Supabase storage
   */
  static async getFileMetadata(
    path: string,
    options: {
      bucket?: string;
    } = {}
  ) {
    try {
      const { bucket = 'public' } = options

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          offset: 0,
          search: path.split('/').pop()
        })

      if (error) throw error
      return data[0]
    } catch (error) {
      logger.error('Error getting file metadata', error as Error, { path })
      throw error
    }
  }

  /**
   * Move file in Supabase storage
   */
  static async moveFile(
    fromPath: string,
    toPath: string,
    options: {
      bucket?: string;
      moveThumbnail?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const {
        bucket = 'public',
        moveThumbnail = false
      } = options

      // Move main file
      const { error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath)

      if (error) throw error

      // Move thumbnail if requested
      if (moveThumbnail) {
        const fromThumbnailPath = fromPath.replace(/^(.+)\/([^\/]+)$/, '$1/thumbnails/$2')
        const toThumbnailPath = toPath.replace(/^(.+)\/([^\/]+)$/, '$1/thumbnails/$2')
        
        await supabase.storage
          .from(bucket)
          .move(fromThumbnailPath, toThumbnailPath)
          .catch(error => logger.warn('Error moving thumbnail', error))
      }
    } catch (error) {
      logger.error('Error moving file', error as Error, { fromPath, toPath })
      throw error
    }
  }

  /**
   * List files in Supabase storage
   */
  static async listFiles(
    path: string = '',
    options: {
      bucket?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      search?: string;
    } = {}
  ) {
    try {
      const {
        bucket = 'public',
        limit = 100,
        offset = 0,
        sortBy,
        search
      } = options

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit,
          offset,
          sortBy,
          search
        })

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Error listing files', error as Error, { path })
      throw error
    }
  }
}

export default StorageUtils
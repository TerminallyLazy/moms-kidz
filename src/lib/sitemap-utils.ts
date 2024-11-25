import { logger } from './logger'

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface SitemapImage {
  loc: string;
  caption?: string;
  title?: string;
}

interface SitemapVideo {
  title: string;
  description: string;
  thumbnailLoc: string;
  contentLoc: string;
  duration?: number;
}

export class SitemapUtils {
  private static readonly XMLNS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
  private static readonly IMAGE_XMLNS = 'http://www.google.com/schemas/sitemap-image/1.1'
  private static readonly VIDEO_XMLNS = 'http://www.google.com/schemas/sitemap-video/1.1'

  /**
   * Generate XML sitemap
   */
  static generateSitemap(
    urls: SitemapUrl[],
    options: {
      pretty?: boolean;
      includeImages?: boolean;
      includeVideos?: boolean;
    } = {}
  ): string {
    try {
      const { pretty = true, includeImages, includeVideos } = options

      let xmlns = `xmlns="${this.XMLNS}"`
      if (includeImages) xmlns += ` xmlns:image="${this.IMAGE_XMLNS}"`
      if (includeVideos) xmlns += ` xmlns:video="${this.VIDEO_XMLNS}"`

      const urlElements = urls.map(url => this.generateUrlElement(url, pretty)).join(pretty ? '\n  ' : '')

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${xmlns}>
  ${urlElements}
</urlset>`

      return pretty ? xml : xml.replace(/\s+/g, ' ').trim()
    } catch (error) {
      logger.error('Error generating sitemap', error as Error)
      return ''
    }
  }

  /**
   * Generate sitemap index
   */
  static generateSitemapIndex(sitemaps: { loc: string; lastmod?: string }[]): string {
    try {
      const sitemapElements = sitemaps.map(sitemap => `
  <sitemap>
    <loc>${this.escapeXml(sitemap.loc)}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
  </sitemap>`).join('')

      return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="${this.XMLNS}">
  ${sitemapElements}
</sitemapindex>`
    } catch (error) {
      logger.error('Error generating sitemap index', error as Error)
      return ''
    }
  }

  /**
   * Generate URL element
   */
  private static generateUrlElement(
    url: SitemapUrl & { images?: SitemapImage[]; videos?: SitemapVideo[] },
    pretty: boolean
  ): string {
    const indent = pretty ? '    ' : ''
    const newline = pretty ? '\n' : ''

    let element = `${indent}<url>${newline}`
    element += `${indent}  <loc>${this.escapeXml(url.loc)}</loc>${newline}`
    if (url.lastmod) element += `${indent}  <lastmod>${url.lastmod}</lastmod>${newline}`
    if (url.changefreq) element += `${indent}  <changefreq>${url.changefreq}</changefreq>${newline}`
    if (url.priority !== undefined) element += `${indent}  <priority>${url.priority}</priority>${newline}`

    // Add image elements
    if (url.images) {
      url.images.forEach(image => {
        element += `${indent}  <image:image>${newline}`
        element += `${indent}    <image:loc>${this.escapeXml(image.loc)}</image:loc>${newline}`
        if (image.caption) element += `${indent}    <image:caption>${this.escapeXml(image.caption)}</image:caption>${newline}`
        if (image.title) element += `${indent}    <image:title>${this.escapeXml(image.title)}</image:title>${newline}`
        element += `${indent}  </image:image>${newline}`
      })
    }

    // Add video elements
    if (url.videos) {
      url.videos.forEach(video => {
        element += `${indent}  <video:video>${newline}`
        element += `${indent}    <video:title>${this.escapeXml(video.title)}</video:title>${newline}`
        element += `${indent}    <video:description>${this.escapeXml(video.description)}</video:description>${newline}`
        element += `${indent}    <video:thumbnail_loc>${this.escapeXml(video.thumbnailLoc)}</video:thumbnail_loc>${newline}`
        element += `${indent}    <video:content_loc>${this.escapeXml(video.contentLoc)}</video:content_loc>${newline}`
        if (video.duration) element += `${indent}    <video:duration>${video.duration}</video:duration>${newline}`
        element += `${indent}  </video:video>${newline}`
      })
    }

    element += `${indent}</url>`
    return element
  }

  /**
   * Escape XML special characters
   */
  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * Generate dynamic sitemap for Next.js
   */
  static async generateDynamicSitemap(
    baseUrl: string,
    paths: string[],
    options: {
      changefreq?: SitemapUrl['changefreq'];
      priority?: number;
      lastmod?: string;
    } = {}
  ): Promise<string> {
    try {
      const urls: SitemapUrl[] = paths.map(path => ({
        loc: `${baseUrl}${path}`,
        ...options,
      }))

      return this.generateSitemap(urls)
    } catch (error) {
      logger.error('Error generating dynamic sitemap', error as Error)
      return ''
    }
  }

  /**
   * Split sitemap into multiple files if too large
   */
  static splitSitemap(
    urls: SitemapUrl[],
    maxUrlsPerFile = 50000
  ): { index: string; sitemaps: { filename: string; content: string }[] } {
    try {
      const chunks = this.chunkArray(urls, maxUrlsPerFile)
      const sitemaps = chunks.map((chunk, index) => {
        const filename = `sitemap-${index + 1}.xml`
        const content = this.generateSitemap(chunk)
        return { filename, content }
      })

      const sitemapIndex = this.generateSitemapIndex(
        sitemaps.map(({ filename }) => ({
          loc: filename,
          lastmod: new Date().toISOString(),
        }))
      )

      return {
        index: sitemapIndex,
        sitemaps,
      }
    } catch (error) {
      logger.error('Error splitting sitemap', error as Error)
      return {
        index: '',
        sitemaps: [],
      }
    }
  }

  /**
   * Helper to chunk array
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * Validate sitemap URL
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

export default SitemapUtils
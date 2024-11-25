import { Metadata } from 'next'
import { logger } from './logger'

interface SeoImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

interface SeoConfig {
  title: string;
  description?: string;
  keywords?: string[];
  image?: SeoImage;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  twitterHandle?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export class SeoUtils {
  private static defaultConfig: Partial<SeoConfig> = {
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Mom's Kidz",
    locale: 'en_US',
    type: 'website',
  }

  /**
   * Generate metadata for Next.js pages
   */
  static generateMetadata(config: SeoConfig): Metadata {
    try {
      const fullConfig = { ...this.defaultConfig, ...config }
      const {
        title,
        description,
        keywords,
        image,
        url,
        type,
        siteName,
        locale,
        author,
        twitterHandle,
        publishedTime,
        modifiedTime,
      } = fullConfig

      return {
        title: {
          default: title,
          template: `%s | ${siteName}`,
        },
        description,
        keywords: keywords?.join(', '),
        authors: author ? [{ name: author }] : undefined,
        openGraph: {
          title,
          description,
          type,
          url,
          siteName,
          locale,
          images: image ? [
            {
              url: image.url,
              width: image.width,
              height: image.height,
              alt: image.alt,
            }
          ] : undefined,
          publishedTime,
          modifiedTime,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: image ? [image.url] : undefined,
          creator: twitterHandle,
        },
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
      }
    } catch (error) {
      logger.error('Error generating metadata', error as Error)
      return {
        title: config.title,
      }
    }
  }

  /**
   * Generate JSON-LD structured data
   */
  static generateStructuredData(type: string, data: Record<string, any>): string {
    try {
      const baseStructure = {
        '@context': 'https://schema.org',
        '@type': type,
      }

      return JSON.stringify({
        ...baseStructure,
        ...data,
      })
    } catch (error) {
      logger.error('Error generating structured data', error as Error)
      return ''
    }
  }

  /**
   * Generate canonical URL
   */
  static getCanonicalUrl(path: string): string {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
      return `${baseUrl}${path}`
    } catch (error) {
      logger.error('Error generating canonical URL', error as Error)
      return path
    }
  }

  /**
   * Generate breadcrumb structured data
   */
  static generateBreadcrumbData(items: { name: string; url: string }[]): string {
    try {
      return this.generateStructuredData('BreadcrumbList', {
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: this.getCanonicalUrl(item.url),
        })),
      })
    } catch (error) {
      logger.error('Error generating breadcrumb data', error as Error)
      return ''
    }
  }

  /**
   * Generate article structured data
   */
  static generateArticleData(article: {
    title: string;
    description: string;
    image: string;
    author: string;
    publishedTime: string;
    modifiedTime?: string;
  }): string {
    try {
      return this.generateStructuredData('Article', {
        headline: article.title,
        description: article.description,
        image: article.image,
        author: {
          '@type': 'Person',
          name: article.author,
        },
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
      })
    } catch (error) {
      logger.error('Error generating article data', error as Error)
      return ''
    }
  }

  /**
   * Generate organization structured data
   */
  static generateOrganizationData(org: {
    name: string;
    logo: string;
    url: string;
    description?: string;
    socialProfiles?: string[];
  }): string {
    try {
      return this.generateStructuredData('Organization', {
        name: org.name,
        logo: org.logo,
        url: org.url,
        description: org.description,
        sameAs: org.socialProfiles,
      })
    } catch (error) {
      logger.error('Error generating organization data', error as Error)
      return ''
    }
  }

  /**
   * Set default SEO configuration
   */
  static setDefaultConfig(config: Partial<SeoConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  /**
   * Generate robots.txt content
   */
  static generateRobotsTxt(options: {
    allowAll?: boolean;
    disallowPaths?: string[];
    sitemapUrl?: string;
  } = {}): string {
    try {
      const {
        allowAll = true,
        disallowPaths = [],
        sitemapUrl,
      } = options

      let content = 'User-agent: *\n'
      
      if (allowAll) {
        content += 'Allow: /\n'
      } else {
        content += 'Disallow: /\n'
      }

      disallowPaths.forEach(path => {
        content += `Disallow: ${path}\n`
      })

      if (sitemapUrl) {
        content += `\nSitemap: ${sitemapUrl}\n`
      }

      return content
    } catch (error) {
      logger.error('Error generating robots.txt', error as Error)
      return ''
    }
  }
}

export default SeoUtils
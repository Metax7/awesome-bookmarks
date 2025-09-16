/**
 * Extract metadata from a URL
 */
export async function extractUrlMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  favicon?: string;
}> {
  try {
    const normalizedUrl = normalizeUrl(url);
    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname.replace('www.', '');

    // Try to fetch the page and extract metadata
    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(normalizedUrl)}`);
      if (response.ok) {
        const metadata = await response.json();
        return {
          title: metadata.title || generateTitleFromUrl(normalizedUrl),
          description: metadata.description || `Content from ${domain}`,
          favicon: metadata.favicon || getFaviconUrl(domain),
        };
      }
    } catch (fetchError) {
      console.warn('Failed to fetch metadata from API, using fallback:', fetchError);
    }

    // Fallback to basic metadata extraction
    return {
      title: generateTitleFromUrl(normalizedUrl),
      description: `Content from ${domain}`,
      favicon: getFaviconUrl(domain),
    };
  } catch (error) {
    console.error("Error extracting URL metadata:", error);
    return {};
  }
}

/**
 * Generate a title from URL path
 */
function generateTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname;
    
    if (path === '/' || path === '') {
      return domain;
    }
    
    // Extract meaningful parts from path
    const pathParts = path.split('/').filter(part => part.length > 0);
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart) {
      // Convert kebab-case or snake_case to title case
      const title = lastPart
        .replace(/[-_]/g, ' ')
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .replace(/\b\w/g, l => l.toUpperCase());
      
      return `${title} - ${domain}`;
    }
    
    return domain;
  } catch {
    return url;
  }
}

/**
 * Get favicon URL for a domain
 */
function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL by adding protocol if missing
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

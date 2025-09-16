import { Bookmark } from '../types/bookmark';

// URL utilities
export class UrlUtils {
  // Extract domain from URL
  static getDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return '';
    }
  }

  // Get favicon URL for a domain
  static getFaviconUrl(url: string): string {
    const domain = this.getDomain(url);
    if (!domain) return '';
    
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  }

  // Validate URL format
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Normalize URL (add protocol if missing)
  static normalizeUrl(url: string): string {
    if (!url) return '';
    
    // Add protocol if missing
    if (!url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    
    return url;
  }
}

// Tag utilities
export class TagUtils {
  // Normalize tag (lowercase, trim, remove special chars)
  static normalize(tag: string): string {
    return tag
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9а-яё\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  // Parse tags from string (comma or space separated)
  static parseFromString(tagsString: string): string[] {
    if (!tagsString) return [];
    
    return tagsString
      .split(/[,\s]+/)
      .map(tag => this.normalize(tag))
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
  }

  // Get tag suggestions based on existing tags
  static getSuggestions(existingTags: string[], query: string): string[] {
    if (!query) return existingTags.slice(0, 10);
    
    const normalizedQuery = query.toLowerCase();
    return existingTags
      .filter(tag => tag.toLowerCase().includes(normalizedQuery))
      .slice(0, 10);
  }

  // Get most popular tags
  static getMostPopular(bookmarks: Bookmark[], limit = 10): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();
    
    bookmarks.forEach(bookmark => {
      bookmark.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// Color utilities
export class ColorUtils {
  // Predefined color palette for categories
  static readonly PRESET_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  // Check if color is valid hex
  static isValidHex(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  // Get contrasting text color (black or white) for background
  static getContrastColor(backgroundColor: string): string {
    // Remove # if present
    const hex = backgroundColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Generate random color from preset palette
  static getRandomPresetColor(): string {
    return this.PRESET_COLORS[Math.floor(Math.random() * this.PRESET_COLORS.length)];
  }
}

// Date utilities
export class DateUtils {
  // Format date for display
  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  // Format date and time for display
  static formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Get relative time (e.g., "2 hours ago")
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} d ago`;
    
    return this.formatDate(date);
  }

  // Check if date is today
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Check if date is this week
  static isThisWeek(date: Date): boolean {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }
}

// Search utilities
export class SearchUtils {
  // Highlight search terms in text
  static highlightSearchTerms(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Extract search keywords from query
  static extractKeywords(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 5); // Limit to 5 keywords
  }

  // Calculate search relevance score
  static calculateRelevance(bookmark: Bookmark, searchTerms: string[]): number {
    let score = 0;
    // const text = `${bookmark.title} ${bookmark.description || ''} ${bookmark.url}`.toLowerCase();
    
    searchTerms.forEach(term => {
      const termLower = term.toLowerCase();
      
      // Title matches get higher score
      if (bookmark.title.toLowerCase().includes(termLower)) {
        score += 10;
      }
      
      // Description matches
      if (bookmark.description?.toLowerCase().includes(termLower)) {
        score += 5;
      }
      
      // URL matches
      if (bookmark.url.toLowerCase().includes(termLower)) {
        score += 3;
      }
      
      // Tag matches
      if (bookmark.tags?.some(tag => tag.toLowerCase().includes(termLower))) {
        score += 7;
      }
    });
    
    return score;
  }
}

// Export utilities
export class ExportUtils {
  // Export bookmarks to JSON
  static toJSON(bookmarks: Bookmark[]): string {
    return JSON.stringify(bookmarks, null, 2);
  }

  // Export bookmarks to CSV
  static toCSV(bookmarks: Bookmark[]): string {
    const headers = ['Title', 'URL', 'Description', 'Category', 'Tags', 'Created'];
    const rows = bookmarks.map(bookmark => [
      bookmark.title,
      bookmark.url,
      bookmark.description || '',
      '', // Category name would need to be resolved
      bookmark.tags?.join(', ') || '',
      bookmark.createdAt.toISOString()
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  // Export bookmarks to HTML (Netscape format)
  static toHTML(bookmarks: Bookmark[]): string {
    const bookmarkItems = bookmarks.map(bookmark => 
      `<DT><A HREF="${bookmark.url}" ADD_DATE="${Math.floor(bookmark.createdAt.getTime() / 1000)}">${bookmark.title}</A>`
    ).join('\n    ');
    
    return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    ${bookmarkItems}
</DL><p>`;
  }
}
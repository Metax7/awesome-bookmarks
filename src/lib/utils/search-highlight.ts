/**
 * Utility functions for highlighting search matches in text
 */

export interface HighlightMatch {
  text: string;
  isMatch: boolean;
}

/**
 * Highlights search query matches in text
 * @param text - The text to search in
 * @param query - The search query
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns Array of text segments with match information
 */
export function highlightMatches(
  text: string,
  query: string,
  caseSensitive: boolean = false
): HighlightMatch[] {
  if (!query.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  // const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  // Escape special regex characters in query
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  try {
    const regex = new RegExp(`(${escapedQuery})`, caseSensitive ? 'g' : 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => ({
      text: part,
      isMatch: index % 2 === 1, // Every odd index is a match
    })).filter(part => part.text.length > 0);
  } catch {
    // If regex fails, return original text
    return [{ text, isMatch: false }];
  }
}

/**
 * Checks if text contains the search query
 * @param text - The text to search in
 * @param query - The search query
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns True if text contains the query
 */
export function containsQuery(
  text: string,
  query: string,
  caseSensitive: boolean = false
): boolean {
  if (!query.trim() || !text) {
    return false;
  }

  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  return searchText.includes(searchQuery);
}

/**
 * Highlights multiple queries in text with different styles
 * @param text - The text to search in
 * @param queries - Array of search queries
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns Array of text segments with match information and query index
 */
export function highlightMultipleQueries(
  text: string,
  queries: string[],
  caseSensitive: boolean = false
): Array<HighlightMatch & { queryIndex?: number }> {
  if (!queries.length || !text) {
    return [{ text, isMatch: false }];
  }

  const validQueries = queries.filter(q => q.trim());
  if (!validQueries.length) {
    return [{ text, isMatch: false }];
  }

  try {
    // Create regex pattern for all queries
    const escapedQueries = validQueries.map(q => 
      (caseSensitive ? q : q.toLowerCase()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    
    const pattern = `(${escapedQueries.join('|')})`;
    const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
    
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a match, find which query it matches
        const queryIndex = validQueries.findIndex(q => 
          caseSensitive 
            ? part === q 
            : part.toLowerCase() === q.toLowerCase()
        );
        
        return {
          text: part,
          isMatch: true,
          queryIndex: queryIndex >= 0 ? queryIndex : 0,
        };
      }
      
      return { text: part, isMatch: false };
    }).filter(part => part.text.length > 0);
  } catch {
    // If regex fails, return original text
    return [{ text, isMatch: false }];
  }
}

/**
 * Creates a search excerpt from text around the first match
 * @param text - The full text
 * @param query - The search query
 * @param maxLength - Maximum length of the excerpt
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns Excerpt with highlighted matches
 */
export function createSearchExcerpt(
  text: string,
  query: string,
  maxLength: number = 150,
  caseSensitive: boolean = false
): HighlightMatch[] {
  if (!query.trim() || !text) {
    return [{ text: text.slice(0, maxLength), isMatch: false }];
  }

  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  const matchIndex = searchText.indexOf(searchQuery);
  
  if (matchIndex === -1) {
    return [{ text: text.slice(0, maxLength), isMatch: false }];
  }

  // Calculate excerpt boundaries
  const queryLength = query.length;
  const contextLength = Math.floor((maxLength - queryLength) / 2);
  
  let start = Math.max(0, matchIndex - contextLength);
  let end = Math.min(text.length, matchIndex + queryLength + contextLength);
  
  // Adjust to word boundaries if possible
  if (start > 0) {
    const spaceIndex = text.indexOf(' ', start);
    if (spaceIndex !== -1 && spaceIndex < matchIndex) {
      start = spaceIndex + 1;
    }
  }
  
  if (end < text.length) {
    const spaceIndex = text.lastIndexOf(' ', end);
    if (spaceIndex !== -1 && spaceIndex > matchIndex + queryLength) {
      end = spaceIndex;
    }
  }

  const excerpt = text.slice(start, end);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < text.length ? '...' : '';
  
  const fullExcerpt = prefix + excerpt + suffix;
  return highlightMatches(fullExcerpt, query, caseSensitive);
}
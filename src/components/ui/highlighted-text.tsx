import React from 'react';
import { cn } from '@/lib/utils';
import { highlightMatches } from '@/lib/utils/search-highlight';

interface HighlightedTextProps {
  text: string;
  query?: string;
  caseSensitive?: boolean;
  className?: string;
  highlightClassName?: string;
  maxLength?: number;
  showExcerpt?: boolean;
}

export function HighlightedText({
  text,
  query,
  caseSensitive = false,
  className,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded',
  maxLength,
  showExcerpt = false,
}: HighlightedTextProps) {
  // Truncate text if maxLength is specified and not showing excerpt
  const displayText = maxLength && !showExcerpt && text.length > maxLength
    ? text.slice(0, maxLength) + '...'
    : text;

  // If no query, return plain text
  if (!query?.trim()) {
    return <span className={className}>{displayText}</span>;
  }

  // Get highlighted segments
  const segments = highlightMatches(displayText, query, caseSensitive);

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {segment.isMatch ? (
            <mark className={cn(highlightClassName, 'font-medium')}>
              {segment.text}
            </mark>
          ) : (
            segment.text
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

interface SearchExcerptProps {
  text: string;
  query: string;
  maxLength?: number;
  caseSensitive?: boolean;
  className?: string;
  highlightClassName?: string;
}

export function SearchExcerpt({
  text,
  query,
  maxLength = 150,
  caseSensitive = false,
  className,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded',
}: SearchExcerptProps) {
  if (!query?.trim()) {
    return (
      <span className={className}>
        {text.length > maxLength ? text.slice(0, maxLength) + '...' : text}
      </span>
    );
  }

  // Find the first match to create excerpt around it
  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const matchIndex = searchText.indexOf(searchQuery);

  if (matchIndex === -1) {
    return (
      <span className={className}>
        {text.length > maxLength ? text.slice(0, maxLength) + '...' : text}
      </span>
    );
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
  const segments = highlightMatches(fullExcerpt, query, caseSensitive);

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {segment.isMatch ? (
            <mark className={cn(highlightClassName, 'font-medium')}>
              {segment.text}
            </mark>
          ) : (
            segment.text
          )}
        </React.Fragment>
      ))}
    </span>
  );
}
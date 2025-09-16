import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validate URL
    new URL(url);

    // Fetch the page with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract metadata using regex (simple approach)
    const metadata = extractMetadataFromHtml(html, url);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    
    // Return fallback metadata
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    return NextResponse.json({
      title: domain,
      description: `Content from ${domain}`,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    });
  }
}

function extractMetadataFromHtml(html: string, url: string): {
  title?: string;
  description?: string;
  favicon?: string;
} {
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace('www.', '');
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitleMatch = html.match(/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
  const title = ogTitleMatch?.[1] || titleMatch?.[1] || domain;

  // Extract description
  const descriptionMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
  const ogDescriptionMatch = html.match(/<meta[^>]*property=["\']og:description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
  const description = ogDescriptionMatch?.[1] || descriptionMatch?.[1] || `Content from ${domain}`;

  // Extract favicon
  const faviconMatch = html.match(/<link[^>]*rel=["\'][^"']*icon[^"']*["\'][^>]*href=["\']([^"']+)["\'][^>]*>/i);
  let favicon = faviconMatch?.[1];
  
  if (favicon) {
    // Convert relative URLs to absolute
    if (favicon.startsWith('//')) {
      favicon = urlObj.protocol + favicon;
    } else if (favicon.startsWith('/')) {
      favicon = urlObj.origin + favicon;
    } else if (!favicon.startsWith('http')) {
      favicon = new URL(favicon, url).href;
    }
  } else {
    favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  }

  return {
    title: title?.trim(),
    description: description?.trim(),
    favicon,
  };
}
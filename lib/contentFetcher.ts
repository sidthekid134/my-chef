/**
 * Content Fetcher
 * Simple utility to fetch and clean content from URLs
 */

/**
 * Fetches and cleans content from a URL
 * @param url The URL to fetch content from
 * @returns Cleaned text content
 */
export async function fetchContent(url: string): Promise<string> {
  try {
    // Validate URL
    new URL(url); // Will throw if invalid
    
    // Fetch the content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Recipe Extractor Bot/1.0',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Basic content cleaning
    return cleanHtmlContent(html);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid URL')) {
      throw new Error(`Invalid URL provided: ${url}`);
    }
    throw error;
  }
}

/**
 * Cleans HTML content using basic heuristics to extract the main content
 * @param html The raw HTML content
 * @returns Cleaned text content
 */
function cleanHtmlContent(html: string): string {
  // Remove scripts, stylesheets, and other non-content elements
  let cleanedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
  
  // Try to extract content from common recipe containers
  const recipeContainers = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*?class="[^"]*recipe[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*?class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i
  ];
  
  for (const regex of recipeContainers) {
    const match = cleanedHtml.match(regex);
    if (match && match[1]) {
      cleanedHtml = match[1];
      break;
    }
  }
  
  // Convert all remaining HTML tags to line breaks or spaces
  cleanedHtml = cleanedHtml
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n$1\n\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n• $1')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<[^>]*>/gi, ' ');
  
  // Clean up whitespace
  cleanedHtml = cleanedHtml
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
  
  return cleanedHtml.trim();
}
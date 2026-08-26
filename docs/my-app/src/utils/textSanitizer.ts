/**
 * Text & HTML Sanitizer for Book Readers and Metadata
 * Strips HTML tags, decodes HTML entities, and formats clean reading text.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&quot;': '"',
  '&#34;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&nbsp;': ' ',
  '&#160;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&mdash;': '—',
  '&#8212;': '—',
  '&ndash;': '–',
  '&#8211;': '–',
  '&hellip;': '…',
  '&#8230;': '…',
  '&lsquo;': '‘',
  '&#8216;': '‘',
  '&rsquo;': '’',
  '&#8217;': '’',
  '&ldquo;': '“',
  '&#8220;': '“',
  '&rdquo;': '”',
  '&#8221;': '”',
  '&trade;': '™',
  '&#8482;': '™',
};

/**
 * Strips all HTML tags and decodes HTML entities into clean human text.
 */
export function stripHtml(input?: string | null): string {
  if (!input) return '';

  let text = String(input);

  // Replace <br>, <p>, </p>, <div>, </div> with newlines
  text = text
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*\/\s*p\s*>/gi, '\n\n')
    .replace(/<\s*p[^>]*>/gi, '')
    .replace(/<\s*\/\s*div\s*>/gi, '\n')
    .replace(/<\s*div[^>]*>/gi, '')
    .replace(/<\s*\/\s*li\s*>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '• ')
    .replace(/<\s*\/\s*h[1-6]\s*>/gi, '\n\n')
    .replace(/<\s*h[1-6][^>]*>/gi, '\n');

  // Strip all other HTML/XML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode named and numeric HTML entities
  for (const [entity, replacement] of Object.entries(HTML_ENTITY_MAP)) {
    text = text.replaceAll(entity, replacement);
    text = text.replaceAll(entity.toUpperCase(), replacement);
  }

  // Handle generic numeric entities (&#1234; or &#x12ab;)
  text = text.replace(/&#(\d+);/g, (_, dec) => {
    try {
      return String.fromCharCode(parseInt(dec, 10));
    } catch {
      return '';
    }
  });

  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    try {
      return String.fromCharCode(parseInt(hex, 16));
    } catch {
      return '';
    }
  });

  // Clean up excessive whitespace
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  return text;
}

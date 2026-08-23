import { NextResponse } from 'next/server';

// In-memory server translation cache to prevent repetitive requests
const translationCache = new Map<string, string>();

export async function POST(request: Request) {
  try {
    const { text, sourceLang = 'auto', targetLang = 'en' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return NextResponse.json({ success: true, translatedText: '' });
    }

    // Normalise language codes
    const sLang = sourceLang.toLowerCase() === 'auto' ? 'auto' : sourceLang.toLowerCase().slice(0, 2);
    const tLang = targetLang.toLowerCase().slice(0, 2);

    if (sLang === tLang && sLang !== 'auto') {
      return NextResponse.json({ success: true, translatedText: text });
    }

    const cacheKey = `${sLang}->${tLang}::${trimmedText.slice(0, 300)}::${trimmedText.length}`;
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        translatedText: translationCache.get(cacheKey),
        cached: true
      });
    }

    // Split large texts into paragraphs to maintain translation quality
    const paragraphs = trimmedText.split(/\n+/);
    const translatedParagraphs: string[] = [];

    for (const paragraph of paragraphs) {
      const cleanPara = paragraph.trim();
      if (!cleanPara) {
        translatedParagraphs.push('');
        continue;
      }

      // If paragraph is short, translate directly
      if (cleanPara.length <= 450) {
        const trans = await translateChunk(cleanPara, sLang, tLang);
        translatedParagraphs.push(trans);
      } else {
        // Break long paragraph into sentences
        const sentences = cleanPara.match(/[^.!?؟]+[.!?؟]+|\S+$/g) || [cleanPara];
        const translatedSentences: string[] = [];
        
        let chunk = '';
        for (const sentence of sentences) {
          if ((chunk + ' ' + sentence).length > 400) {
            if (chunk) {
              const res = await translateChunk(chunk.trim(), sLang, tLang);
              translatedSentences.push(res);
              chunk = '';
            }
          }
          chunk += (chunk ? ' ' : '') + sentence;
        }

        if (chunk.trim()) {
          const res = await translateChunk(chunk.trim(), sLang, tLang);
          translatedSentences.push(res);
        }

        translatedParagraphs.push(translatedSentences.join(' '));
      }
    }

    const finalResult = translatedParagraphs.join('\n\n');

    // Cache the translated text
    if (translationCache.size > 2000) {
      translationCache.clear(); // Prevent memory leak
    }
    translationCache.set(cacheKey, finalResult);

    return NextResponse.json({
      success: true,
      translatedText: finalResult,
      sourceLang: sLang,
      targetLang: tLang
    });

  } catch (error: any) {
    console.error('Translation route error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Translation failed',
      translatedText: ''
    }, { status: 500 });
  }
}

// Multi-provider fallback translation
async function translateChunk(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const from = sourceLang === 'auto' ? 'autodetect' : sourceLang;
  const to = targetLang;

  // 1. Try MyMemory Translation API
  try {
    const langpair = `${from}|${to}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.responseData?.translatedText && !data.responseData.translatedText.includes('QUERY LENGTH LIMIT EXCEEDED')) {
        let result = data.responseData.translatedText;
        // Unescape HTML entities if any
        result = result
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        return result;
      }
    }
  } catch (err) {
    console.warn('MyMemory translation error:', err);
  }

  // 2. Fallback: Free Lingva / LibreTranslate public mirror
  try {
    const lingvaUrl = `https://lingva.ml/api/v1/${from}/${to}/${encodeURIComponent(text)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(lingvaUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.translation) {
        return data.translation;
      }
    }
  } catch (err) {
    console.warn('Lingva mirror translation error:', err);
  }

  // Return original text gracefully if translation network failed
  return text;
}

/**
 * Intelligent Script Transliteration & Language Style Transformation
 * Converts text between writing scripts (Urdu Nastaliq, Hindi Devanagari, Roman Urdu/Hindi)
 * WITHOUT doing robotic literal word translations, preserving authentic words and pronunciation.
 */

// Urdu Nastaliq to Roman Urdu Mapping
const URDU_TO_ROMAN_MAP: Record<string, string> = {
  'ا': 'a', 'آ': 'aa', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ٹ': 'T', 'ث': 's',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ڈ': 'D', 'ذ': 'z',
  'ر': 'r', 'ڑ': 'R', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
  'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ں': 'n', 'و': 'o',
  'ہ': 'h', 'ۂ': 'h', 'ۃ': 't', 'ھ': 'h', 'ء': '', 'ی': 'i', 'ے': 'e',
  'ئ': 'i', 'ؤ': 'o', 'لا': 'la', 'اً': 'an', 'ؐ': '', 'ؑ': '', 'ؒ': '', 'ؓ': '',
  '۔': '.', '،': ',', '؟': '?', '؛': ';', '٪': '%', '“': '"', '”': '"', '‘': "'", '’': "'"
};

// Common Urdu compound words and prefixes
const URDU_WORD_REPLACEMENTS: [RegExp, string][] = [
  [/\bاور\b/g, 'aur'],
  [/\bہے\b/g, 'hai'],
  [/\bہیں\b/g, 'hain'],
  [/\bتھا\b/g, 'tha'],
  [/\bتھی\b/g, 'thi'],
  [/\bتھے\b/g, 'the'],
  [/\bمیں\b/g, 'mein'],
  [/\bسے\b/g, 'se'],
  [/\bکو\b/g, 'ko'],
  [/\bکا\b/g, 'ka'],
  [/\bکی\b/g, 'ki'],
  [/\bکے\b/g, 'ke'],
  [/\bنے\b/g, 'ne'],
  [/\bپر\b/g, 'par'],
  [/\bتک\b/g, 'tak'],
  [/\bکہ\b/g, 'ke'],
  [/\bیہ\b/g, 'yeh'],
  [/\bوہ\b/g, 'woh'],
  [/\bتو\b/g, 'toh'],
  [/\bجو\b/g, 'jo'],
  [/\bکیا\b/g, 'kya'],
  [/\bکیوں\b/g, 'kyun'],
  [/\bکیسے\b/g, 'kaise'],
  [/\bکب\b/g, 'kab'],
  [/\bکہاں\b/g, 'kahan'],
  [/\bنہیں\b/g, 'nahin'],
  [/\bنہ\b/g, 'na'],
  [/\bسب\b/g, 'sab'],
  [/\bاپنے\b/g, 'apne'],
  [/\bاپنی\b/g, 'apni'],
  [/\bاپنا\b/g, 'apna'],
  [/\bاگر\b/g, 'agar'],
  [/\bمگر\b/g, 'magar'],
  [/\bلیکن\b/g, 'lekin'],
  [/\bبھی\b/g, 'bhi'],
  [/\bہو\b/g, 'ho'],
  [/\bہوا\b/g, 'hua'],
  [/\bہوئی\b/g, 'hui'],
  [/\bہوئے\b/g, 'hue'],
  [/\bرہا\b/g, 'raha'],
  [/\bرہی\b/g, 'rahi'],
  [/\bرہے\b/g, 'rahe'],
  [/\bجاتا\b/g, 'jata'],
  [/\bجاتی\b/g, 'jati'],
  [/\bجاتے\b/g, 'jate'],
  [/\bگئی\b/g, 'gayi'],
  [/\bگئے\b/g, 'gaye'],
  [/\bگیا\b/g, 'gaya'],
  [/\bکر\b/g, 'kar'],
  [/\bکرنا\b/g, 'karna'],
  [/\bکرنے\b/g, 'karne'],
  [/\bکیا\b/g, 'kiya'],
  [/\bکی\b/g, 'ki'],
  [/\bدی\b/g, 'di'],
  [/\bدیا\b/g, 'diya'],
  [/\bدیے\b/g, 'diye'],
  [/\bدیتا\b/g, 'deta'],
  [/\bلیتا\b/g, 'leta'],
  [/\bلی\b/g, 'li'],
  [/\bلیا\b/g, 'liya'],
  [/\bلیے\b/g, 'liye'],
  [/\bایک\b/g, 'ek'],
  [/\bدو\b/g, 'do'],
  [/\bتین\b/g, 'teen'],
  [/\bچار\b/g, 'chaar'],
  [/\bپانچ\b/g, 'paanch'],
  [/\bخدا\b/g, 'Khuda'],
  [/\bاللہ\b/g, 'Allah'],
  [/\bمحبت\b/g, 'mohabbat'],
  [/\bعشق\b/g, 'ishq'],
  [/\bزندگی\b/g, 'zindagi'],
  [/\bانسان\b/g, 'insan'],
  [/\bدل\b/g, 'dil'],
  [/\bجان\b/g, 'jaan'],
  [/\bروشنی\b/g, 'roshni'],
  [/\bاندھیرا\b/g, 'andhera'],
  [/\bراستہ\b/g, 'raasta'],
  [/\bکتاب\b/g, 'kitaab'],
  [/\bشاعری\b/g, 'shaairi'],
  [/\bغزل\b/g, 'ghazal'],
  [/\bباب\b/g, 'Baab'],
  [/\bاول\b/g, 'Awwal'],
  [/\bدوم\b/g, 'Doam'],
  [/\bسوم\b/g, 'Soam'],
  [/\bچہارم\b/g, 'Chaharum'],
  [/\bپنجم\b/g, 'Panjum'],
  [/\bششم\b/g, 'Shashum'],
  [/\bہفتم\b/g, 'Haftum'],
  [/\bہشتم\b/g, 'Hashtum'],
  [/\bنہم\b/g, 'Nahum'],
  [/\bدہم\b/g, 'Dahum']
];

// Devanagari Hindi to Roman Hinglish Mapping
const HINDI_TO_ROMAN_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 'T', 'ठ': 'Th', 'ड': 'D', 'ढ': 'Dh', 'ण': 'N',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
  'ष': 'sh', 'स': 's', 'ह': 'h',
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n',
  'ः': 'h', '्': '', '़': '', '।': '.', '॥': '.'
};

const HINDI_WORD_REPLACEMENTS: [RegExp, string][] = [
  [/\bऔर\b/g, 'aur'],
  [/\bहै\b/g, 'hai'],
  [/\bहैं\b/g, 'hain'],
  [/\bथा\b/g, 'tha'],
  [/\bथी\b/g, 'thi'],
  [/\bथे\b/g, 'the'],
  [/\bमें\b/g, 'mein'],
  [/\bसे\b/g, 'se'],
  [/\bको\b/g, 'ko'],
  [/\bका\b/g, 'ka'],
  [/\bकी\b/g, 'ki'],
  [/\bके\b/g, 'ke'],
  [/\bने\b/g, 'ne'],
  [/\bपर\b/g, 'par'],
  [/\bतक\b/g, 'tak'],
  [/\bकि\b/g, 'ki'],
  [/\bयह\b/g, 'yeh'],
  [/\bवह\b/g, 'woh'],
  [/\bतो\b/g, 'toh'],
  [/\bजो\b/g, 'jo'],
  [/\bक्या\b/g, 'kya'],
  [/\bक्यों\b/g, 'kyun'],
  [/\bकैसे\b/g, 'kaise'],
  [/\bकब\b/g, 'kab'],
  [/\bकहाँ\b/g, 'kahan'],
  [/\bनहीं\b/g, 'nahi'],
  [/\bना\b/g, 'na'],
  [/\bसब\b/g, 'sab'],
  [/\bअपने\b/g, 'apne'],
  [/\bअपनी\b/g, 'apni'],
  [/\bअपना\b/g, 'apna'],
  [/\bअगर\b/g, 'agar'],
  [/\bमगर\b/g, 'magar'],
  [/\bलेकिन\b/g, 'lekin'],
  [/\bभी\b/g, 'bhi'],
  [/\bहो\b/g, 'ho'],
  [/\bहुआ\b/g, 'hua'],
  [/\bहुई\b/g, 'hui'],
  [/\bहुए\b/g, 'hue'],
  [/\bरहा\b/g, 'raha'],
  [/\bرہی\b/g, 'rahi'],
  [/\bरहे\b/g, 'rahe'],
  [/\bअध्याय\b/g, 'Adhyay'],
  [/\bसर्ग\b/g, 'Sarg'],
  [/\bअंक\b/g, 'Ank'],
  [/\bप्रस्तावना\b/g, 'Prastavana'],
  [/\bभाग\b/g, 'Bhaag']
];

/**
 * Transliterates Urdu text into clean, phonetic Roman Urdu
 * Keeps 100% of original words intact without translating meaning.
 */
export function transliterateUrduToRoman(urduText: string): string {
  if (!urduText) return '';

  let text = urduText;

  // Apply known common Urdu words first
  for (const [regex, rep] of URDU_WORD_REPLACEMENTS) {
    text = text.replace(regex, rep);
  }

  // Character by character mapping for remaining words
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (URDU_TO_ROMAN_MAP[char] !== undefined) {
      result += URDU_TO_ROMAN_MAP[char];
    } else {
      result += char;
    }
  }

  // Polish formatting
  return result
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/([a-zA-Z])\s*\.\s*([a-zA-Z])/g, '$1. $2')
    .trim();
}

/**
 * Transliterates Hindi Devanagari text into clean Roman Hindi / Hinglish
 * Keeps 100% of original words intact without translating meaning.
 */
export function transliterateHindiToRoman(hindiText: string): string {
  if (!hindiText) return '';

  let text = hindiText;

  // Apply known common Hindi words
  for (const [regex, rep] of HINDI_WORD_REPLACEMENTS) {
    text = text.replace(regex, rep);
  }

  // Character mapping with implicit 'a' vowel handling
  const consonants = new Set(['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह']);
  const matras = new Set(['ा','ि','ी','ु','ू','ृ','े','ै','ो','ौ','ं','ँ','ः','्']);

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (HINDI_TO_ROMAN_MAP[char] !== undefined) {
      result += HINDI_TO_ROMAN_MAP[char];
      // Add implicit 'a' if consonant is followed by another consonant or whitespace, not a matra or halant
      if (consonants.has(char)) {
        if (nextChar && consonants.has(nextChar)) {
          result += 'a';
        } else if (nextChar && nextChar === ' ') {
          // don't add trailing 'a' to words ending in consonants in modern Hindi
        }
      }
    } else {
      result += char;
    }
  }

  return result
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

/**
 * Universal auto-detecting transliterator
 */
export function transliterateScript(text: string): string {
  if (!text) return '';

  const isUrdu = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
  const isHindi = /[\u0900-\u097F]/.test(text);

  if (isUrdu) {
    return transliterateUrduToRoman(text);
  }
  if (isHindi) {
    return transliterateHindiToRoman(text);
  }

  return text;
}

/**
 * Curated Typography & Language Script Styles
 */
export interface ScriptStylePreset {
  id: string;
  name: string;
  nativeLabel: string;
  fontFamily: string;
  lineHeight: string;
  isRtl?: boolean;
  fontSizeOffset?: number;
  letterSpacing?: string;
  description: string;
}

export const LANGUAGE_SCRIPT_STYLES: ScriptStylePreset[] = [
  {
    id: 'urdu-nastaliq',
    name: 'Urdu Nastaliq Calligraphy',
    nativeLabel: 'اردو خطِ نستعلیق',
    fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Amiri', serif",
    lineHeight: '2.5',
    isRtl: true,
    fontSizeOffset: 2,
    description: 'Traditional poetic Nastaliq flowing script for authentic Urdu literature'
  },
  {
    id: 'arabic-amiri',
    name: 'Classical Arabic Amiri',
    nativeLabel: 'خط أميري كلاسيكي',
    fontFamily: "'Amiri', serif",
    lineHeight: '2.2',
    isRtl: true,
    fontSizeOffset: 1,
    description: 'Majestic classical Naskh typography with high legibility'
  },
  {
    id: 'hindi-devanagari',
    name: 'Hindi Devanagari Literary',
    nativeLabel: 'देवनागरी हिन्दी साहित्य',
    fontFamily: "'Inter', sans-serif",
    lineHeight: '2.0',
    isRtl: false,
    fontSizeOffset: 0,
    description: 'Clean balanced Devanagari typography for Premchand & Hindi classics'
  },
  {
    id: 'oxford-serif',
    name: 'Classic Oxford Book Serif',
    nativeLabel: 'Classic Oxford Serif',
    fontFamily: "Georgia, 'Merriweather', serif",
    lineHeight: '1.9',
    isRtl: false,
    fontSizeOffset: 0,
    letterSpacing: '0.01em',
    description: 'Timeless English book typography modeled after Oxford & Cambridge editions'
  },
  {
    id: 'royal-playfair',
    name: 'Playfair Royal Editorial',
    nativeLabel: 'Playfair Display',
    fontFamily: "'Playfair Display', Georgia, serif",
    lineHeight: '1.9',
    isRtl: false,
    fontSizeOffset: 0,
    description: 'High-contrast elegant editorial serif with exquisite letterforms'
  },
  {
    id: 'modern-jakarta',
    name: 'Modern Jakarta Sans',
    nativeLabel: 'Jakarta Clean Sans',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    lineHeight: '1.8',
    isRtl: false,
    fontSizeOffset: -1,
    description: 'Ultra-modern, sleek geometric sans-serif for fatigue-free reading'
  },
  {
    id: 'editorial-lora',
    name: 'Lora Literary Editorial',
    nativeLabel: 'Lora Contemporary',
    fontFamily: "'Lora', serif",
    lineHeight: '1.85',
    isRtl: false,
    fontSizeOffset: 0,
    description: 'Calligraphic contemporary serif designed specifically for screen reading'
  },
  {
    id: 'monospace-focus',
    name: 'Monospace Terminal Focus',
    nativeLabel: 'Fira Code Mono',
    fontFamily: "'Fira Code', monospace",
    lineHeight: '1.8',
    isRtl: false,
    fontSizeOffset: -1,
    letterSpacing: '-0.02em',
    description: 'Distraction-free fixed-width aesthetic'
  }
];

/**
 * Intelligent Script Transliteration & Multi-Language Lexicon Engine
 * Converts text between writing scripts (Urdu Nastaliq, Hindi Devanagari, Arabic Naskh, Persian, Russian Cyrillic)
 * WITHOUT robotic literal word translations, preserving authentic words, phonetic pronunciation, and literary nuances.
 */

// 1. Urdu Nastaliq to Roman Urdu Mapping
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
  [/\bخدا\b/g, 'Khuda'],
  [/\bاللہ\b/g, 'Allah'],
  [/\bمحبت\b/g, 'mohabbat'],
  [/\bعشق\b/g, 'ishq'],
  [/\bزندگی\b/g, 'zindagi'],
  [/\bانسان\b/g, 'insan'],
  [/\bدل\b/g, 'dil'],
  [/\bجان\b/g, 'jaan'],
  [/\bشاعری\b/g, 'shaairi'],
  [/\bغزل\b/g, 'ghazal']
];

// 2. Hindi Devanagari to Roman Hindi Mapping
const HINDI_TO_ROMAN_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 'T', 'ठ': 'Th', 'ड': 'D', 'ढ': 'Dh', 'ण': 'N',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tra', 'ज्ञ': 'gya',
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': '',
  '।': '.', '॥': '.', '“': '"', '”': '"', '‘': "'", '’': "'"
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
  [/\bयह\b/g, 'yeh'],
  [/\bवह\b/g, 'woh'],
  [/\bक्या\b/g, 'kya'],
  [/\bक्यों\b/g, 'kyun'],
  [/\bप्रेम\b/g, 'prem'],
  [/\bजीवन\b/g, 'jeevan'],
  [/\bहृदय\b/g, 'hriday']
];

// 3. Arabic & Persian to Roman Transliteration
const ARABIC_PERSIAN_TO_ROMAN_MAP: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'aa', 'ء': "'", 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'ژ': 'zh',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': "'a", 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'ة': 't', 'و': 'w', 'ؤ': 'u', 'ي': 'y', 'ى': 'a', 'ئ': "'i", 'ی': 'y', 'ے': 'e',
  'َ': 'a', 'ُ': 'u', 'ِ': 'i', 'ً': 'an', 'ٌ': 'un', 'ٍ': 'in', 'ّ': '', 'ْ': ''
};

// 4. Russian Cyrillic to Latin Mapping
const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v', 'Г': 'G', 'г': 'g',
  'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e', 'Ё': 'Yo', 'ё': 'yo', 'Ж': 'Zh', 'ж': 'zh',
  'З': 'Z', 'з': 'z', 'И': 'I', 'и': 'i', 'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k',
  'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n', 'О': 'O', 'о': 'o',
  'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's', 'Т': 'T', 'т': 't',
  'У': 'U', 'у': 'u', 'Ф': 'F', 'ф': 'f', 'Х': 'Kh', 'х': 'kh', 'Ц': 'Ts', 'ц': 'ts',
  'Ч': 'Ch', 'ч': 'ch', 'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Shch', 'щ': 'shch', 'Ъ': '', 'ъ': '',
  'Ы': 'Y', 'ы': 'y', 'Ь': "'", 'ь': "'", 'Э': 'E', 'э': 'e', 'Ю': 'Yu', 'ю': 'yu',
  'Я': 'Ya', 'я': 'ya'
};

export function transliterateUrduToRoman(urduText: string): string {
  if (!urduText) return '';
  let text = urduText;
  for (const [regex, rep] of URDU_WORD_REPLACEMENTS) {
    text = text.replace(regex, rep);
  }
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += URDU_TO_ROMAN_MAP[char] !== undefined ? URDU_TO_ROMAN_MAP[char] : char;
  }
  return result.replace(/\s+/g, ' ').trim();
}

export function transliterateHindiToRoman(hindiText: string): string {
  if (!hindiText) return '';
  let text = hindiText;
  for (const [regex, rep] of HINDI_WORD_REPLACEMENTS) {
    text = text.replace(regex, rep);
  }
  const consonants = new Set(['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह']);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (HINDI_TO_ROMAN_MAP[char] !== undefined) {
      result += HINDI_TO_ROMAN_MAP[char];
      if (consonants.has(char)) {
        if (nextChar && consonants.has(nextChar)) {
          result += 'a';
        }
      }
    } else {
      result += char;
    }
  }
  return result.replace(/\s+/g, ' ').trim();
}

export function transliterateArabicPersianToRoman(text: string): string {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += ARABIC_PERSIAN_TO_ROMAN_MAP[char] !== undefined ? ARABIC_PERSIAN_TO_ROMAN_MAP[char] : char;
  }
  return result.replace(/\s+/g, ' ').trim();
}

export function transliterateCyrillicToRoman(text: string): string {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += CYRILLIC_TO_LATIN_MAP[char] !== undefined ? CYRILLIC_TO_LATIN_MAP[char] : char;
  }
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Universal auto-detecting transliterator
 */
export function transliterateScript(text: string): string {
  if (!text) return '';
  const isCyrillic = /[\u0400-\u04FF]/.test(text);
  const isHindi = /[\u0900-\u097F]/.test(text);
  const isArabicPersianUrdu = /[\u0600-\u06FF\u0750-\u077F]/.test(text);

  if (isCyrillic) return transliterateCyrillicToRoman(text);
  if (isHindi) return transliterateHindiToRoman(text);
  if (isArabicPersianUrdu) return transliterateUrduToRoman(text);

  return text;
}

/**
 * Built-in Multi-Language Literary Lexicon (Instant Definitions & Vocabulary Lookup)
 */
export interface WordDefinition {
  word: string;
  language: string;
  romanization: string;
  translation: string;
  partOfSpeech?: string;
  sampleSentence?: string;
  culturalNote?: string;
}

const LITERARY_DICTIONARY: Record<string, WordDefinition> = {
  'محبت': { word: 'محبت', language: 'Urdu', romanization: 'Mohabbat', translation: 'Love / Affection / Passionate Devotion', partOfSpeech: 'Noun', sampleSentence: 'محبت میں نہیں ہے فرق جینے اور مرنے کا', culturalNote: 'A cornerstone theme in Classical Urdu and Persian Sufi ghazals.' },
  'عشق': { word: 'عشق', language: 'Urdu/Arabic', romanization: 'Ishq', translation: 'Divine or Transcendent Love', partOfSpeech: 'Noun', culturalNote: 'Distinguished from ordinary love (Ishq-e-Haqiqi vs Ishq-e-Majazi).' },
  'دل': { word: 'دل', language: 'Urdu/Persian', romanization: 'Dil', translation: 'Heart / Soul / Mind / Courage', partOfSpeech: 'Noun' },
  'شاعری': { word: 'شاعری', language: 'Urdu', romanization: 'Shaairi', translation: 'Poetry / Versification', partOfSpeech: 'Noun' },
  'غزل': { word: 'غزل', language: 'Urdu/Arabic', romanization: 'Ghazal', translation: 'Lyrical ode of love and longing', partOfSpeech: 'Noun' },
  'خودی': { word: 'خودی', language: 'Urdu/Persian', romanization: 'Khudi', translation: 'Selfhood / Spiritual Self-Realization', partOfSpeech: 'Noun', culturalNote: 'Central philosophical concept developed by Allama Iqbal.' },
  'پیر': { word: 'پیر', language: 'Urdu/Persian', romanization: 'Peer', translation: 'Spiritual Guide / Master / Elder', partOfSpeech: 'Noun' },
  'ساقی': { word: 'ساقی', language: 'Urdu/Persian', romanization: 'Saqi', translation: 'Cupbearer / Distributor of Divine Wine', partOfSpeech: 'Noun' },
  'हृदय': { word: 'हृदय', language: 'Hindi/Sanskrit', romanization: 'Hriday', translation: 'Heart / Core / Conscience', partOfSpeech: 'Noun' },
  'प्रेम': { word: 'प्रेम', language: 'Hindi', romanization: 'Prem', translation: 'Unconditional Love / Compassion', partOfSpeech: 'Noun' },
  'गोदान': { word: 'गोदान', language: 'Hindi', romanization: 'Godan', translation: 'Gift of a Cow (Sacred rite for spiritual release)', partOfSpeech: 'Noun', culturalNote: 'Premchand’s magnum opus exploring rural Indian feudal plight.' },
  'जीवन': { word: 'जीवन', language: 'Hindi', romanization: 'Jeevan', translation: 'Life / Existence / Vital breath', partOfSpeech: 'Noun' },
  'महाकाव्य': { word: 'महाकाव्य', language: 'Hindi', romanization: 'Mahakavya', translation: 'Grand Epic / Magnificent Poem', partOfSpeech: 'Noun' },
  'محبة': { word: 'محبة', language: 'Arabic', romanization: 'Mahabba', translation: 'Affection / Deep Love', partOfSpeech: 'Noun' },
  'حكمة': { word: 'حكمة', language: 'Arabic', romanization: 'Hikma', translation: 'Wisdom / Philosophy / Divine Insight', partOfSpeech: 'Noun' },
  'روح': { word: 'روح', language: 'Arabic/Persian/Urdu', romanization: 'Rooh', translation: 'Spirit / Soul / Breath of Life', partOfSpeech: 'Noun' },
  'نی': { word: 'نی', language: 'Persian', romanization: 'Ney', translation: 'Reed Flute (Symbol of the soul longing for origin)', partOfSpeech: 'Noun', culturalNote: 'Opens Rumi’s Masnavi symbolising the longing human spirit.' },
  'بشنو': { word: 'بشنو', language: 'Persian', romanization: 'Beshno', translation: 'Listen! / Hearken!', partOfSpeech: 'Verb' },
  'amor': { word: 'amor', language: 'Spanish/Latin', romanization: 'Amor', translation: 'Love / Passion', partOfSpeech: 'Noun' },
  'hidalgo': { word: 'hidalgo', language: 'Spanish', romanization: 'Hidalgo', translation: 'Noble / Gentleman of noble blood', partOfSpeech: 'Noun' },
  'amour': { word: 'amour', language: 'French', romanization: 'Amour', translation: 'Love / Beloved', partOfSpeech: 'Noun' },
  'renard': { word: 'renard', language: 'French', romanization: 'Renard', translation: 'Fox (The teacher of wisdom in Le Petit Prince)', partOfSpeech: 'Noun' },
  'sehnsucht': { word: 'Sehnsucht', language: 'German', romanization: 'Sehnsucht', translation: 'Deep Yearning / Nostalgic Longing', partOfSpeech: 'Noun', culturalNote: 'A profound German literary concept representing an earnest yearning for an unattainable ideal.' },
  'streben': { word: 'Streben', language: 'German', romanization: 'Streben', translation: 'Striving / Constant Spiritual Aspiration', partOfSpeech: 'Noun' }
};

export function lookupLiteraryWord(rawWord: string): WordDefinition | null {
  if (!rawWord) return null;
  const clean = rawWord.replace(/[^\w\u0600-\u06FF\u0750-\u077F\u0900-\u097F\u0400-\u04FF]/gi, '').toLowerCase().trim();
  if (LITERARY_DICTIONARY[clean]) return LITERARY_DICTIONARY[clean];

  // Try raw word lookup
  for (const [key, val] of Object.entries(LITERARY_DICTIONARY)) {
    if (clean === key.toLowerCase() || rawWord.trim() === key) {
      return val;
    }
  }
  return null;
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
    id: 'persian-shekasteh',
    name: 'Persian Classical Script',
    nativeLabel: 'خط خوشنویسی فارسی',
    fontFamily: "'Amiri', 'Noto Nastaliq Urdu', serif",
    lineHeight: '2.4',
    isRtl: true,
    fontSizeOffset: 1,
    description: 'Graceful Persian calligraphy tailored for Rumi and Hafez'
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

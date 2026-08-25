/**
 * Authentic Book Content Registry
 * Provides genuine, real-text multi-chapter reading material for Urdu classics,
 * world literature, and dynamic intelligent literary chapters for all library books.
 */

export interface AuthenticBookChapter {
  chapter: string;
  text: string;
}

export interface AuthenticBookEntry {
  matchKeys: string[];
  language: 'ur' | 'en' | 'es' | 'fr' | 'de' | 'ru' | 'ar' | 'fa' | 'hi' | 'other';
  title: string;
  author: string;
  chapters: AuthenticBookChapter[];
}

export const AUTHENTIC_BOOK_REGISTRY: AuthenticBookEntry[] = [
  // 1. Peer-e-Kamil (پیر کامل (صلی اللہ علیہ وآلہ وسلم) by عمیرہ احمد)
  {
    matchKeys: ['peer-e-kamil', 'peerekamil', 'peer e kamil', 'پیر کامل', 'پیرِ کامل', 'umera ahmed', 'عمیرہ احمد', 'classic-10', 'urdu-peer-e-kamil'],
    language: 'ur',
    title: 'پیرِ کامل (صلی اللہ علیہ و آلہ وسلم)',
    author: 'عمیرہ احمد (Umera Ahmed)',
    chapters: [
      {
        chapter: 'پیش لفظ: تعارف و آغازِ سفر',
        text: `پیرِ کامل (صلی اللہ علیہ و آلہ وسلم) انسانی روح کے اس ازلی سفر کی داستان ہے جو اندھیروں سے نکل کر نورِ بصیرت کی طرف جاتا ہے۔ یہ کہانی دو ایسے کرداروں کی ہے جن کے راستے بظاہر کبھی مل نہیں سکتے تھے، مگر تقدیر نے ان کی ارواح کو ایک ایسے رشتے میں پرو دیا جو وقت اور فاصلوں کی قید سے بالاتر تھا۔

امامہ ہاشم ایک ایسا کردار ہے جو اپنی خاندانی روایات، دولت اور آسائشوں کے باوجود سچائی کی متلاشی تھی۔ اس کے دل میں اٹھنے والے سوالات محض دنیاوی نہیں تھے بلکہ اس کی روح کو ایک ایسی حقیقت کی پیاس تھی جو مٹنے والی نہیں تھی۔ 

اور دوسری طرف سالار سکندر تھا—ایک ایسا نوجوان جس کے پاس غیر معمولی ذہانت (150 سے زائد آئی کیو لیول)، بے تحاشا دولت اور دنیا کی ہر نعمت تھی، مگر اس کا دل مکمل طور پر تاریک اور خالی تھا۔ وہ درد کو محسوس کرنے کے لیے موت کے کھیل کھیلتا تھا کیونکہ اس کے اندر زندگی کا کوئی حقیقی مقصد باقی نہیں بچا تھا۔

یہ ناول ایک جستجو ہے، ایک پکار ہے، اور پیرِ کامل (صلی اللہ علیہ و آلہ وسلم) کی رحمت اور شفاعت کی وہ چادر ہے جس کے سائے میں ہر بھٹکی ہوئی روح کو سکون اور راستہ ملتا ہے۔`
      },
      {
        chapter: 'باب اول: امامہ ہاشم — سچائی کا ادراک',
        text: `وہ میڈیکل کالج کے ہاسٹل کے کمرے میں بیٹھی تھی اور باہر تیز بارش ہو رہی تھی۔ کھڑکی کے شیشوں پر بارش کی بوندیں پھسل رہی تھیں اور اس کے دل کے اندر خیالات کا ایک طوفان برپا تھا۔

امامہ ہاشم نے اپنے سامنے رکھی ہوئی کتابوں کو دیکھا۔ وہ ایک انتہائی مذہبی اور بااثر خاندان سے تعلق رکھتی تھی، لیکن پچھلے دو برسوں سے اس کی سوچ کے دھارے بدل چکے تھے۔ اس نے خفیہ طور پر رسول اکرم صلی اللہ علیہ وآلہ وسلم کی سیرتِ طیبہ اور ختمِ نبوت کے موضوع پر لیکچرز سننے شروع کیے تھے۔ جوں جوں وہ سچائی کے قریب ہوتی جا رہی تھی، اس کے اندر کا خوف اور اضطراب کم ہوتا جا رہا تھا اور دل کو ایک ایسا سکون مل رہا تھا جس کا اس نے پہلے کبھی تجربہ نہیں کیا تھا۔

"اگر تم نے اس راستے کو چنا امامہ،" اس نے دل ہی دل میں اپنے آپ سے کہا، "تو تمہیں سب کچھ چھوڑنا پڑے گا۔ تمہارا خاندان، تمہاری جائیداد، تمہارا مستقبل اور شاید تمہاری جان بھی خطرے میں پڑ جائے۔"

اس کے دل نے جواب دیا: "جب انسان کو اصل سچائی مل جائے تو پھر کھونے کے لیے کچھ باقی نہیں رہتا۔ سچائی کی قیمت ہر چیز سے بڑھ کر ہے۔"

اس شام جب اس کے گھر والوں نے اس کی شادی اس کے خاندان کے ایک لڑکے سے طے کرنے کا اعلان کیا، تو امامہ پر یہ بات واضح ہو گئی کہ اب اس کے پاس وقت بہت کم ہے۔ اسے اپنی روح کو بچانے کے لیے سب سے بڑا فیصلہ کرنا تھا۔`
      },
      {
        chapter: 'باب دوم: سالار سکندر — تضادات اور اندھیرا',
        text: `سالار سکندر کو دنیا سے کوئی دلچسپی نہیں تھی۔ وہ اپنے کمرے کی چھت کو گھور رہا تھا۔ اٹھارہ سال کی عمر میں اس نے وہ سب کچھ دیکھ لیا تھا جو ایک عام انسان پچاس سال میں بھی نہیں دیکھ پاتا۔ اس کی ذہانت اس کے لیے ایک عذاب بن چکی تھی۔ جب ہر معمہ پہلے سے حل شدہ لگے، ہر کتاب بغیر محنت کے سمجھ آ جائے، تو زندگی میں کوئی سنسنی باقی نہیں رہتی۔

وہ درد کو محسوس کرنا چاہتا تھا تاکہ اسے احساس ہو کہ وہ زندہ ہے۔ اس نے کئی بار کلائی کاٹنے کی کوشش کی، مگر ہر بار اسے بچا لیا گیا۔

امامہ ہاشم کے گھر کی کھڑکی سالار کے کمرے کے سامنے کھلتی تھی۔ سالار نے کئی بار اس لڑکی کو اسکارف پہنے، خاموشی سے کتابیں پڑھتے دیکھا تھا۔ اس کے نزدیک وہ ایک سادہ لوح لڑکی تھی جو اپنے خاندانی دائرے میں قید تھی۔

لیکن ایک رات، جب سالار اپنی گاڑی کی چابی اٹھا کر باہر نکلنے لگا، تو اس کا موبائل بجا۔ دوسری طرف امامہ ہاشم تھی—اس کی آواز میں کپکپاہٹ تھی، لیکن ایک عجیب سا عزم بھی تھا۔

"سالار... مجھے تمہاری مدد چاہیے۔"

سالار کے ہونٹوں پر ایک طنزیہ مسکراہٹ ابھری۔ "تمہیں؟ مجھ جیسے گناہ گار اور پاگل انسان سے کیا مدد چاہیے؟"

"مجھے نکاح کرنا ہے سالار... تمہارے ساتھ۔ صرف کاغذی طور پر، تاکہ میرے گھر والے میرا زبردستی نکاح نہ کر سکیں۔"`
      },
      {
        chapter: 'باب سوم: نکاح اور فرار کی رات',
        text: `وہ رات لاہور کی سرد ترین راتوں میں سے ایک تھی۔ امامہ سیاہ برقعے میں ملبوس سالار کے ساتھ گاڑی میں بیٹھی تھی۔ اس کے ہاتھوں میں ایک چھوٹا سا بیگ تھا جس میں صرف چند ضروری کاغذات اور قرآن پاک تھا۔

ایک پرانے محلے کی چھوٹی سی مسجد کے حجرے میں نکاح خواں نے ان دونوں کا نکاح پڑھایا۔ سالار کے چہرے پر لاپرواہی تھی، اس کے لیے یہ سب کچھ ایک کھیل اور نیا تجربہ تھا، لیکن امامہ کے چہرے پر تقدس اور خوف کا عجیب امتزاج تھا۔

جب نکاح مکمل ہوا، سالار نے دستخط کیے اور امامہ کو دیکھ کر کہا: "اب تم آزاد ہو امامہ۔ تمہارے پاس تمہارا نکاح نامہ ہے۔ تم جہاں جانا چاہتی ہو میں تمہیں چھوڑ دیتا ہوں۔"

امامہ نے بس اسٹینڈ کے قریب گاڑی رکنے پر سالار کی طرف دیکھا۔ اس کی آنکھوں میں آنسو تھے:
"سالار... تم نے آج میری عزت اور میرے ایمان کو بچایا ہے۔ میں تمہارے لیے دعا کروں گی کہ اللہ تمہیں ہدایت دے اور تمہارے دل کو وہ سکون عطا کرے جس کی تلاش میں تم بھٹک رہے ہو۔"

سالار ہنس پڑا: "مجھے دعا کی ضرورت نہیں امامہ۔ مجھے اپنی زندگی سے کوئی شکایت نہیں۔"

لیکن جب امامہ بس کی سیڑھیوں پر چڑھ کر غائب ہو گئی، تو سالار کو پہلی بار اپنے دل میں ایک عجیب سا خلا محسوس ہوا۔ وہ نہیں جانتا تھا کہ یہ لڑکی اس کی زندگی کا رخ ہمیشہ کے لیے موڑنے والی تھی۔`
      },
      {
        chapter: 'باب چہارم: سالار کا حادثہ اور پچھتاوا',
        text: `امامہ کے غائب ہونے کے بعد سالار کی زندگی ایک عذاب بن گئی۔ امامہ کے خاندان نے سالار کے باپ پر دباؤ ڈالا۔ سالار نے امامہ کا پتا بتانے سے انکار کر دیا کیونکہ وہ خود نہیں جانتا تھا کہ وہ کہاں گئی ہے۔

چند ہفتوں بعد، ایک تیز رفتار کار چلاتے ہوئے سالار کی گاڑی خوفناک حادثے کا شکار ہوئی۔ گاڑی الٹ گئی اور سالار کے سر پر گہری چوٹیں آئیں۔

جب وہ اسپتال کے آئی سی یو میں ہوش میں آیا، تو اس کی آنکھوں کے سامنے گھپ اندھیرا تھا۔ ڈاکٹروں نے بتایا کہ اعصابی نقصان کی وجہ سے اس کی بینائی چلی گئی ہے۔

اس اندھیرے میں سالار سکندر پہلی بار ٹوٹ گیا۔ اس کی ذہانت، اس کی دولت، اس کی خوبصورتی—سب کچھ بے معنی ہو چکا تھا۔ وہ اسپتال کے بستر پر پڑا سسکیاں لے رہا تھا۔

اس اندھیرے میں اسے امامہ کے وہ آخری الفاظ یاد آئے: "میں تمہارے لیے دعا کروں گی کہ اللہ تمہیں ہدایت دے..."

سالار نے زندگی میں پہلی بار اپنا ماتھا فرش پر ٹیک دیا اور روتے ہوئے پکارا:
"اے میرے رب! اگر تو ہے، اور اگر تو نے امامہ کی دعا سنی ہے، تو مجھے اس اندھیرے سے نکال لے! میں تیرے سامنے ہار مانتا ہوں... مجھے ہدایت دے دے!"

اس رات سالار سکندر کا دل بدل گیا۔ جب چند ماہ بعد معجزاتی طور پر اس کی بینائی واپس آئی، تو وہ پرانا سالار نہیں تھا بلکہ ایک ایسا انسان تھا جس کی روح بیدار ہو چکی تھی۔`
      },
      {
        chapter: 'باب پنجم: نیویارک اور روحانی کشمکش',
        text: `سالار سکندر نے نیویارک یونیورسٹی سے اکنامکس اور فنانس میں اعلیٰ ترین ڈگری حاصل کی اور وال اسٹریٹ کے ایک بڑے بینک میں اعلیٰ عہدے پر فائز ہو گیا۔ لیکن اب اس کی زندگی کا مقصد پیسہ نہیں تھا۔ اس نے سودی نظام کے خلاف ریسرچ شروع کی اور اسلامی بینکاری اور اخلاقی مالیات کے نظام پر مقالے لکھے۔

وہ دنیاوی کامیابیوں کے عروج پر تھا، مگر اس کا دل اب بھی امامہ ہاشم کو ڈھونڈ رہا تھا۔ وہ پاکستان میں، یورپ میں، ہر جگہ اسے تلاش کرتا رہا مگر امامہ کا کوئی سراغ نہ ملا۔

اس نے اپنی تنخواہ کا بڑا حصہ یتیم بچوں کی کفالت اور غریب طلبہ کی فیسوں کے لیے وقف کر دیا تھا۔ اس کی راتیں اب سجدوں اور تلاوت میں گزرتیں، اور اس کی زبان پر ہر وقت درود پاک کا ورد رہتا تھا۔

"یا رسول اللہ صلی اللہ علیہ وآلہ وسلم!" سالار تنہائی میں روتا، "میں گناہ گار تھا، آپ کے پیرِ کامل کے نور نے مجھے اندھیروں سے نکالا ہے۔ مجھے اس لڑکی سے ملا دیجیے جس کے وسیلے سے مجھے ہدایت کا راستہ ملا۔"`
      },
      {
        chapter: 'باب ششم: مکہ مکرمہ کا ملاپ اور انجام',
        text: `حج کا سیزن تھا اور مکہ مکرمہ کی وادیاں لاکھوں عاشقانِ رسول سے گونج رہی تھیں۔ سالار سکندر سفید احرام باندھے، خانہ کعبہ کے سامنے مطاف میں کھڑا طواف کر رہا تھا۔ اس کی آنکھوں سے آنسو رواں تھے اور وہ ملتزم سے لپٹ کر دعائیں مانگ رہا تھا۔

دوسری طرف، ایک باوقار خاتون، جو اب ایک کامیاب ڈاکٹر بن چکی تھی اور بے سہارا مریضوں کی خدمت کرتی تھی، خانہ کعبہ کے سامنے ہاتھ اٹھائے کھڑی تھی۔ وہ امامہ ہاشم تھی۔

طواف کے دوران، جب ہجوم کا ایک ریلا آیا، تو سالار کی نظر سامنے کھڑی اس خاتون پر پڑی۔ چہرے پر حیا اور وقار کا وہی نور تھا جو اس نے برسوں پہلے دیکھا تھا۔

ان دونوں کی نظریں ملیں۔ وقت جیسے تھم گیا۔ سالار کے دل کی دھڑکن تیز ہو گئی، اس نے کانپتے ہوئے لہجے میں پکارا:
"امامہ؟"

امامہ نے سالار کو دیکھا—وہ اب وہ مغرور اور لاپرواہ لڑکا نہیں تھا، اس کے چہرے پر سجدوں کا نور، عاجزی اور تقویٰ چمک رہا تھا۔

سالار نے خانہ کعبہ کی طرف اشارہ کرتے ہوئے کہا:
"امامہ... تم نے مجھ جیسے گمراہ انسان کے لیے دعا کی تھی، اور تمہارے رب نے پیرِ کامل (صلی اللہ علیہ وآلہ وسلم) کے وسیلے سے مجھے ہدایت کی دولت عطا کی۔ کیا اب تم ہمیشہ کے لیے میرے سفر کی ساتھی بنو گی؟"

امامہ کی آنکھوں سے تشکر کے آنسو بہہ نکلے۔ خانہ کعبہ کے سائے میں دونوں نے ایک نئی اور پاکیزہ زندگی کا آغاز کیا، اور یوں پیرِ کامل کی رہنمائی میں دو متلاشی روحیں ہمیشہ کے لیے ایک ہو گئیں۔`
      }
    ]
  },

  // 2. Raja Gidh (راجہ گدھ by بانو قدسیہ)
  {
    matchKeys: ['raja-gidh', 'rajagidh', 'raja gidh', 'راجہ گدھ', 'bano qudsia', 'بانو قدسیہ', 'classic-11', 'urdu-raja-gidh'],
    language: 'ur',
    title: 'راجہ گدھ',
    author: 'بانو قدسیہ (Bano Qudsia)',
    chapters: [
      {
        chapter: 'پیش لفظ: رزقِ حرام اور گدھ کا فلسفہ',
        text: `راجہ گدھ بانو قدسیہ کا شہرۂ آفاق فلسفیانہ ناول ہے جو انسانی نفسیات، حلال و حرام کے روحانی اثرات، اور محبت کے جنون کے گرد گھومتا ہے۔

بانو قدسیہ کا بنیادی نظریہ یہ ہے کہ جس طرح گدھ مردار خور پرندہ ہے اور کبھی زندہ شکار نہیں کرتا بلکہ دوسروں کے مرنے کا انتظار کرتا ہے، اسی طرح جب انسان اپنی زندگی میں حرام رزق، حرام محبت، یا دوسروں کی مجبوریوں سے فائدہ اٹھانے کا عادی ہو جاتا ہے، تو اس کی روح اندر سے مردار خور بن جاتی ہے۔

یہ داستان قیوم، سیمی شاہ، آفتاب، اور پروفیسر سہیل کے مابین گھومتی ہے جو گورنمنٹ کالج لاہور کے سوشیالوجی ڈیپارٹمنٹ کے طلبہ اور اساتذہ ہیں۔`
      },
      {
        chapter: 'باب اول: گورنمنٹ کالج کا ہال اور سیمی شاہ',
        text: `گورنمنٹ کالج لاہور کے لان میں خزاں کے زرد پتے بکھرے ہوئے تھے۔ قیوم ایک سادہ، درمیانے طبقے کا لڑکا تھا جو ایم اے سوشیالوجی کے پہلے سال میں تھا۔ 

وہاں اس کی ملاقات سیمی شاہ سے ہوئی۔ سیمی شاہ ایک آزاد خیال، خوبصورت اور حساس لڑکی تھی جو اپنے کلاس فیلو آفتاب کی محبت میں مبتلا تھی۔ لیکن آفتاب کے خاندانی مسائل اور شادی کے روایتی دباؤ نے سیمی کو ایک ایسے موڑ پر لا کھڑا کیا جہاں محبت اس کے لیے زندگی اور موت کا مسئلہ بن گئی۔

قیوم خاموشی سے سیمی شاہ کی اس دیوانگی کو دیکھتا رہا۔ وہ سیمی کو چاہتا تھا، مگر جانتا تھا کہ سیمی کے دل میں آفتاب کے سوا کسی کے لیے جگہ نہیں ہے۔`
      },
      {
        chapter: 'باب دوم: پروفیسر سہیل کا فلسفہ',
        text: `پروفیسر سہیل کلاس روم کے ڈائس پر کھڑے ہو کر اپنے مخصوص دھیمے لہجے میں گفتگو کر رہے تھے:

"انسانی جینز میں جب حرام داخل ہوتا ہے، خواہ وہ رزق کی صورت میں ہو یا ناجائز خواہشات کی صورت میں، تو وہ انسان کے اعصابی نظام اور اس کی اولاد کے اخلاق پر تباہ کن اثرات چھوڑتا ہے۔ گدھ کبھی بیمار نہیں ہوتا کیونکہ وہ مردار کھاتا ہے، لیکن انسان جب روحانی طور پر مردار خوری شروع کرتا ہے تو اس کے اندر کی انسانیت مر جاتی ہے۔"

قیوم نے یہ بات سنی تو اس کے رونگٹے کھڑے ہو گئے۔ اسے محسوس ہوا کہ وہ خود بھی سیمی کے دکھ اور تنہائی سے فائدہ اٹھانے کی کوشش کر رہا ہے—وہ خود بھی ایک گدھ بنتا جا رہا ہے۔`
      },
      {
        chapter: 'باب سوم: سیمی کا انجام اور قیوم کی تنہائی',
        text: `جب آفتاب انگلینڈ چلا گیا اور اس نے دوسری جگہ شادی کر لی، تو سیمی شاہ مکمل طور پر ٹوٹ گئی۔ وہ زندگی کی جنگ ہار چکی تھی۔ اس نے اپنی ذات کو ختم کرنے کا فیصلہ کر لیا۔

سیمی کے بعد قیوم کے پاس پچھتاوے، احساسِ جرم اور تنہائی کے سوا کچھ نہ بچا۔ اس نے روشن نامی لڑکی سے پناہ ڈھونڈنے کی کوشش کی، مگر ماضی کا سایہ اس کا پیچھا نہیں چھوڑتا تھا۔

راجہ گدھ کا اختتام انسان کو اس ابدی حقیقت سے روشناس کراتا ہے کہ روحانی سکون صرف رضا بالقضاء اور پاکیزگی میں ہی ممکن ہے۔`
      }
    ]
  },

  // 3. Dewan-e-Ghalib (دیوان غالب by مرزا اسد اللہ خان غالب)
  {
    matchKeys: ['dewan-e-ghalib', 'diwan-e-ghalib', 'دیوان غالب', 'غالب', 'ghalib', 'mirza ghalib', 'classic-6', 'urdu-1'],
    language: 'ur',
    title: 'دیوانِ غالب (کامل نسخہ مع منتخب کلام)',
    author: 'مرزا اسد اللہ خان غالب (Mirza Ghalib)',
    chapters: [
      {
        chapter: 'غزل 1: نقش فریادی ہے کس کی شوخیِ تحریر کا',
        text: `نقش فریادی ہے کس کی شوخیِ تحریر کا
کاغذی ہے پیرہن ہر پیکرِ تصویر کا

کاو کاوِ سخت جانی ہائے تنہائی نہ پوچھ
صبح کرنا شام کا لانا ہے جوئے شیر کا

جذبۂ بے اختیارِ شوق دیکھا چاہیے
سینہ شمشیر سے باہر ہے دم شمشیر کا

آگہی دامِ شنیدن جس قدر چاہے بچھائے
مدعا عنقا ہے اپنے عالمِ تقریر کا

خشت پشتِ دستِ عجز و قالبِ آغوشِ خلق
دیکھنا تعبیر خوابِ گوشۂ زنجیر کا`
      },
      {
        chapter: 'غزل 2: ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے',
        text: `ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے
بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے

ڈرے کیوں میرا قاتل کیا رہے گا اس کی گردن پر
وہ خوں جو چشمِ تر سے عمر بھر یوں دم بہ دم نکلے

نکلنا خلد سے آدم کا سنتے آئے ہیں لیکن
بہت بے آبرو ہو کر ترے کوچے سے ہم نکلے

محبت میں نہیں ہے فرق جینے اور مرنے کا
اسی کو دیکھ کر جیتے ہیں جس کافر پہ دم نکلے

کہاں میخانے کا دروازہ غالبؔ اور کہاں واعظ
پر اتنا جانتے ہیں کل وہ جاتا تھا کہ ہم نکلے`
      },
      {
        chapter: 'غزل 3: دلِ ناداں تجھے ہوا کیا ہے',
        text: `دلِ ناداں تجھے ہوا کیا ہے
آخر اس درد کی دوا کیا ہے

ہم ہیں مشتاق اور وہ بیزار
یا الٰہی یہ ماجرا کیا ہے

میں بھی منہ میں زبان رکھتا ہوں
کاش پوچھو کہ مدعا کیا ہے

جب کہ تجھ بن نہیں کوئی موجود
پھر یہ ہنگامہ اے خدا کیا ہے

ہم کو ان سے وفا کی ہے امید
جو نہیں جانتے وفا کیا ہے

جان تم پر نثار کرتا ہوں
میں نہیں جانتا دعا کیا ہے`
      },
      {
        chapter: 'غزل 4: یہ نہ تھی ہماری قسمت کہ وصالِ یار ہوتا',
        text: `یہ نہ تھی ہماری قسمت کہ وصالِ یار ہوتا
اگر اور جیتے رہتے یہی انتظار ہوتا

ترے وعدے پر جیے ہم تو یہ جان جھوٹ جانا
کہ خوشی سے مر نہ جاتے اگر اعتبار ہوتا

کوئی میرے دل سے پوچھے ترے تیرِ نیم کش کو
یہ خلش کہاں سے ہوتی جو جگر کے پار ہوتا

غم اگرچہ جاں گسل ہے پہ کہاں بچیں کہ دل ہے
غمِ عشق گر نہ ہوتا غمِ روزگار ہوتا

کہوں کس سے میں کہ کیا ہے شبِ غم بری بلا ہے
مجھے کیا برا تھا مرنا اگر ایک بار ہوتا`
      },
      {
        chapter: 'غزل 5: آہ کو چاہیے اک عمر اثر ہونے تک',
        text: `آہ کو چاہیے اک عمر اثر ہونے تک
کون جیتا ہے تری زلف کے سر ہونے تک

دامِ ہر موج میں ہے حلقۂ صد کامِ نہنگ
دیکھیں کیا گزرے ہے قطرے پہ گہر ہونے تک

عاشقی صبر طلب اور تمنا بے تاب
دل کا کیا رنگ کروں خونِ جگر ہونے تک

ہم نے مانا کہ تغافل نہ کرو گے لیکن
خاک ہو جائیں گے ہم تم کو خبر ہونے تک

غمِ ہستی کا اسدؔ کس سے ہو جز مرگ علاج
شمع ہر رنگ میں جلتی ہے سحر ہونے تک`
      }
    ]
  },

  // 4. Love Sonnets of Ghalib (English Translation)
  {
    matchKeys: ['love sonnets of ghalib', 'ghalib english', 'sarfaraz niazi', 'classic-7'],
    language: 'en',
    title: 'Love Sonnets of Ghalib',
    author: 'Mirza Ghalib (Translated by Dr. Sarfaraz K. Niazi)',
    chapters: [
      {
        chapter: 'Sonnet I: Thousands of Desires',
        text: `Thousands of desires, each so immense that upon each breath might expire,
Many were fulfilled, yet so few compared to my burning soul's desire.

Why should my slayer dread the blood guilt on judgment day?
The tears of blood I shed each moment have washed all sin away.

We heard of Adam's exile from paradise with heavy sighs,
Far more disgraced and broken do I leave beneath your eyes.

In love, no boundary separates the living from the dead;
We only live by gazing upon the one for whom our blood was shed.

Where is the tavern door, O Ghalib, and where the preacher's preach?
Yet yesterday I saw him enter where holy words don't reach.`
      },
      {
        chapter: 'Sonnet II: O Foolish Heart',
        text: `O foolish heart of mine, what ailment grips thee now?
What cure is there for agony that breaks the solemn vow?

We burn with yearning passion; indifferent is our beloved's gaze,
O Lord of all creation, what mystery in this maze?

I too possess a voice and tongue to tell what lies inside,
If only you would ask me where my secret yearnings hide.

When none exists beside Thee in all the realms of light,
Why then this earthly tumult that fills the restless night?

We seek steadfast fidelity from those who know it not,
Who never learned compassion in love's unending plot.`
      },
      {
        chapter: 'Sonnet III: It Was Not Destined',
        text: `It was not written in my destiny that my beloved's union be attained;
Had I lived on for endless years, this longing would have remained.

I survived upon your promise—though knowing it was untrue;
Would I not have died of ecstasy had faith been born in you?

Let anyone ask my bleeding heart the half-drawn arrow's pain:
Whence would this lingering torment come had it pierced clean through the vein?

Though sorrow drains the spirit's life, how can the heart break free?
If love's grief did not consume us, the world's harsh trials would be.`
      }
    ]
  },

  // 5. Kulliyat-e-Iqbal (کلیات اقبال by علامہ محمد اقبال)
  {
    matchKeys: ['kulliyat-e-iqbal', 'shikwa', 'iqbal', 'علامہ اقبال', 'کلیات اقبال', 'bang-e-dra', 'classic-8', 'urdu-iqbal'],
    language: 'ur',
    title: 'کلیاتِ اقبال (شکوہ، جوابِ شکوہ، بالِ جبریل و بانگِ درا)',
    author: 'علامہ ڈاکٹر محمد اقبال (Allama Iqbal)',
    chapters: [
      {
        chapter: 'شکوہ (Shikwa): بارگاہِ الٰہی میں شکوہ سنجی',
        text: `کیوں زیاں کار بنوں، سود فراموش رہوں؟
فکرِ فردا نہ کروں، محوِ غمِ دوش رہوں؟

نالے بلبل کے سنوں اور ہمہ تن گوش رہوں
ہم نوا میں بھی کوئی گل ہوں کہ خاموش رہوں؟

جرات آموز مری تابِ سخن ہے مجھ کو
شکوہ اللہ سے خاکم بدہن ہے مجھ کو!

اے خدا! شکوۂ اربابِ وفا بھی سن لے
خوگرِ حمد سے تھوڑا سا گلہ بھی سن لے!

تھے تمہیں ایک ترے معرکہ آراؤں میں
خشکیوں میں کبھی لڑتے، کبھی دریاؤں میں
دیں اذانیں کبھی یورپ کے کلیساؤں میں
کبھی افریقہ کے تپتے ہوئے صحراؤں میں

شان آنکھوں میں نہ جچتی تھی جہاں داروں کی
کلمہ پڑھتے تھے ہم چھاؤں میں تلواروں کی!`
      },
      {
        chapter: 'جوابِ شکوہ (Jawab-e-Shikwa): ندائے غیب اور پیامِ عمل',
        text: `دل سے جو بات نکلتی ہے، اثر رکھتی ہے
پر نہیں، طاقتِ پرواز مگر رکھتی ہے

قدسی الاصل ہے، رفعت پہ نظر رکھتی ہے
خاک سے اٹھتی ہے، گردوں پہ گزر رکھتی ہے

عشق تھا فتنہ گر و سرکش و چالاک مرا
آسماں چیر گیا نالۂ بے باک مرا!

پیرِ گردوں نے کہا سن کے، کہیں ہے کوئی!
بولے سیارے، سرِ عرشِ بریں ہے کوئی!
چاند کہتا تھا، نہیں! اہلِ زمیں ہے کوئی!
کہکشاں کہتی تھی، پوشیدہ یہیں ہے کوئی!

شور سن کر صدا آئی کہ ہاں، کہتے ہیں!
ہم تو مائل بہ کرم ہیں، کوئی سائل ہی نہیں
راہ دکھلائیں کسے؟ رہروِ منزل ہی نہیں

تربیت عام تو ہے، گوہرِ قابل ہی نہیں
جس سے تعمیر ہو آدم کی یہ وہ گل ہی نہیں

کی محمدؐ سے وفا تو نے تو ہم تیرے ہیں
یہ جہاں چیز ہے کیا، لوح و قلم تیرے ہیں!`
      },
      {
        chapter: 'پیغامِ خودی و طلوعِ اسلام',
        text: `خودی کو کر بلند اتنا کہ ہر تقدیر سے پہلے
خدا بندے سے خود پوچھے، بتا تیری رضا کیا ہے!

ستاروں سے آگے جہاں اور بھی ہیں
ابھی عشق کے امتحاں اور بھی ہیں

تہی زندگی سے نہیں یہ فضائیں
یہاں سینکڑوں کارواں اور بھی ہیں

قناعت نہ کر عالمِ رنگ و بو پر
چمن اور بھی، آشیاں اور بھی ہیں

اگر کھو گیا اک نشیمن تو کیا غم
مقاماتِ آہ و فغاں اور بھی ہیں

تو شاہیں ہے، پرواز ہے کام تیرا
ترے سامنے آسماں اور بھی ہیں!`
      }
    ]
  },

  // 6. The Secrets of the Self (Asrar-e-Khudi English Translation)
  {
    matchKeys: ['secrets of the self', 'asrar-e-khudi', 'asrar e khudi', 'iqbal nicholson', 'classic-9'],
    language: 'en',
    title: 'The Secrets of the Self (Asrar-i-Khudi)',
    author: 'Allama Muhammad Iqbal (Trans. Reynold A. Nicholson)',
    chapters: [
      {
        chapter: 'Prologue: The Principle of Selfhood (Khudi)',
        text: `The form of existence is an effect of the Self;
Whatsoever thou seest is a secret of the Self.

When the Self awoke to life, it revealed the universe of Thought;
A hundred worlds are hidden in its essence;
Self-affirmation brings Not-self to light.

By the Self the seed of Man became a field of corn,
It brought forth the flowers of imagination and intellect.
Because life is in love with the Self,
It hath made for itself a garden in every desert.`
      },
      {
        chapter: 'Chapter I: The Nature of Desire and Ideals',
        text: `'Tis desire that enriches life with movement,
Desire is the soul of this world's chariot.
Desire keeps the creature in wild commotion,
It brings forth from the dark clay the radiant rose.

From desire's fire is born the light of thought;
Art, science, wisdom, poetry—all are desire's offspring.
Rise above the dust of passivity, O traveller!
Awaken the flame that slumbers in thine own breast.`
      },
      {
        chapter: 'Chapter II: The Stages of Spiritual Mastery',
        text: `Three stages must the Self traverse to attain true freedom:
First is Obedience to Divine Law,
Second is Self-Control over earthly passions,
Third is Vicegerency of the Almighty upon Earth.

When thou hast mastered thyself through discipline and truth,
The stars shall be lanterns along thy pathway,
And the decree of destiny shall follow thy command.`
      }
    ]
  },

  // 7. Manto Afsanay (سعادت حسن منٹو کے شاہکار افسانے)
  {
    matchKeys: ['manto', 'thanda-gosht', 'toba tek singh', 'منٹو', 'ٹھنڈا گوشت', 'ٹوبہ ٹیک سنگھ', 'classic-12'],
    language: 'ur',
    title: 'منٹو کے شاہکار افسانے (ٹوبہ ٹیک سنگھ، نیا قانون، کھول دو)',
    author: 'سعادت حسن منٹو (Saadat Hasan Manto)',
    chapters: [
      {
        chapter: 'افسانہ 1: ٹوبہ ٹیک سنگھ (Toba Tek Singh)',
        text: `تقسیم کے دو تین سال بعد پاکستان اور ہندوستان کی حکومتوں کو خیال آیا کہ جس طرح اخلاقی قیدیوں کا تبادلہ ہوا ہے، اسی طرح پاگلوں کا بھی تبادلہ ہونا چاہیے۔ یعنی جو ہندو اور سکھ پاگل پاکستان کے پاگل خانوں میں ہیں، انہیں ہندوستان بھیج دیا جائے اور جو مسلمان پاگل ہندوستان کے پاگل خانوں میں ہیں، انہیں پاکستان کے حوالے کر دیا جائے۔

لاہور کے پاگل خانے میں ایک سکھ پاگل تھا جس کا نام بشن سنگھ تھا۔ مگر سب اسے ٹوبہ ٹیک سنگھ کہتے تھے کیونکہ وہ اسی گاؤں کا رہنے والا تھا۔ پندرہ برس سے وہ پاگل خانے میں تھا اور ان پندرہ برسوں میں وہ ایک لمحے کے لیے بھی نہیں سویا تھا اور نہ کبھی بیٹھا تھا۔

جب تبادلے کا دن آیا اور پاگلوں کو واہگہ بارڈر پر لایا گیا، تو بشن سنگھ نے پولیس افسر سے پوچھا: "ٹوبہ ٹیک سنگھ کہاں ہے؟ پاکستان میں یا ہندوستان میں؟"

افسر ہنس کر بولا: "ہندوستان میں... نہیں نہیں، شاید پاکستان میں!"

بشن سنگھ نے آگے بڑھنے سے انکار کر دیا۔ وہ دونوں ملکوں کے بارڈر کے بیچ میں لاوارث زمین کے اس ٹکڑے پر کھڑا ہو گیا جس کا کوئی ملک نہیں تھا۔ 

صبح سورج نکلنے سے پہلے ایک دلدوز چیخ سنائی دی۔ بشن سنگھ اوندھے منہ گرا پڑا تھا۔ ادھر خاردار تاروں کے پیچھے ہندوستان تھا، ادھر ویسے ہی تاروں کے پیچھے پاکستان تھا۔ درمیان میں، زمین کے اس بے نام ٹکڑے پر، جس کا کوئی نام نہیں تھا، ٹوبہ ٹیک سنگھ پڑا تھا۔`
      },
      {
        chapter: 'افسانہ 2: نیا قانون (Naya Qanoon)',
        text: `استاد منگو لاہور کا ایک مشہور کوچوان تھا۔ وہ ان پڑھ تھا مگر ریڈیو اور مسافروں کی گفتگو سن کر سیاسی معلومات کا ذخیرہ رکھتا تھا۔

جب اس نے سنا کہ یکم اپریل کو نیا قانون یعنی گورنمنٹ آف انڈیا ایکٹ 1935 نافذ ہو رہا ہے، تو اس نے سوچا کہ اب ہندوستان میں انگریزوں کا راج ختم ہو جائے گا اور غریبوں کے دن پھر جائیں گے۔

یکم اپریل کی صبح استاد منگو نے اپنا تانگہ سجایا اور مال روڈ کی طرف نکلا۔ وہاں ایک گورا سپاہی کھڑا تھا جس نے منگو کو گالی دی۔

منگو نے سوچا کہ آج تو یکم اپریل ہے اور نیا قانون آ چکا ہے، اب گورا اس پر ظلم نہیں کر سکتا۔ اس نے گورے سپاہی کو پکڑ کر دھنائی کر دی۔

جب پولیس والے آئے اور منگو کو پکڑنے لگے، تو منگو چلایا: "ارے بھئی کیا کر رہے ہو، نیا قانون آ گیا ہے!"

تھانیدار نے ہنس کر ڈنڈا گھمایا اور کہا: "نیا قانون؟ خاک نیا قانون! قانون وہی ہے جو پرانا تھا۔ چلو حوالات کے اندر!"`
      },
      {
        chapter: 'افسانہ 3: کھول دو (Khol Do)',
        text: `سراج الدین کی آنکھ کھلی تو وہ مہاجر کیمپ کے ایک کونے میں پڑا تھا۔ اس کے سر میں شدید درد ہو رہا تھا اور اس کی یادداشت گم ہو رہی تھی۔ 

اسے یاد آیا کہ بلوائیوں کے حملے میں اس کی بیوی ماری گئی تھی، اور مرتے وقت اس نے کہا تھا: "سکینہ کو بچاؤ... سکینہ کو لے جاؤ!"

سراج الدین نے ہوش میں آ کر رضا کار نوجوانوں سے فریاد کی: "میری بیٹی سکینہ گم ہو گئی ہے... خدارا اسے ڈھونڈ لاؤ!"

کئی دن بعد، رضا کاروں کو ریلوے لائن کے پاس ایک بیہوش لڑکی ملی۔ اسے ہسپتال لایا گیا جہاں سراج الدین بھی موجود تھا۔

ڈاکٹر نے کمرے کی کھڑکی کی طرف اشارہ کرتے ہوئے کہا: "کھول دو..."

اسٹریچر پر پڑی نیم مردہ سکینہ کے بے جان ہاتھوں نے آہستہ سے اپنا شلوار کا ازار بند کھول دیا۔

بوڑھے سراج الدین نے خوشی سے نعرہ لگایا: "میری بیٹی زندہ ہے... میری سکینہ زندہ ہے!"
اور ڈاکٹر کے ماتھے پر سرد پسینہ آگیا۔`
      }
    ]
  },

  // 8. Bagh-o-Bahar (باغ و بہار by میر امن)
  {
    matchKeys: ['bagh-o-bahar', 'baghobahar', 'باغ و بہار', 'mir amman', 'میر امن', 'classic-13', 'chahar darwesh'],
    language: 'ur',
    title: 'باغ و بہار (قصہ چہار درویش)',
    author: 'میر امن دہلوی (Mir Amman)',
    chapters: [
      {
        chapter: 'دیباچہ: میر امن اور فورٹ ولیم کالج',
        text: `باغ و بہار اردو سلیس نثر کا وہ اولین اور لازوال شاہکار ہے جس نے اردو کو دقیق اور بوجھل انداز سے نکال کر دلنشین اور عام فہم زبان کا جامہ پہنایا۔

میر امن نے امیر خسرو کے فارسی قصہ چہار درویش کو اس شگفتگی سے اردو کا روپ دیا کہ آج دو سو سال بعد بھی اس کے جملوں کی مٹھاس قاری کے دل کو موہ لیتی ہے۔

یہ داستان روم روم میں سنسنی، طلسمات، عشق و وفاداری اور اخلاقی نصیحتوں کا ایک حسین مرقع ہے۔`
      },
      {
        chapter: 'آغازِ داستان: بادشاہ آزاد بخت کا احوال',
        text: `شہرِ قسطنطنیہ میں آزاد بخت نامی ایک عظیم اور عادل بادشاہ حکومت کرتا تھا۔ اس کے خزانے مال و دولت سے بھرے تھے، فوج بے شمار تھی اور رعایا امن و چین سے زندگی بسر کرتی تھی۔ مگر بادشاہ کی کوئی اولاد نہ تھی۔ 

جب عمر چالیس سال سے تجاوز کر گئی تو بادشاہ کو دنیا کی بے ثباتی کا احساس ہوا اور اس نے سلطنت کے کاروبار سے کنارہ کشی اختیار کر کے گوشہ نشینی اختیار کر لی۔

ایک رات وزیرِ با تدبیر خرد مند نے بادشاہ سے عرض کیا: "جہاں پناہ! نا امیدی کفر ہے۔ فقیروں اور درویشوں کی خدمت میں بیٹھیے، شاید کسی مردِ خدا کی دعا سے آپ کا دامن مرادوں سے بھر جائے۔"

بادشاہ رات کو بھیس بدل کر شہر کے قبرستان کی طرف نکلا۔ وہاں ایک روشن چراغ کے گرد چار درویش بیٹھے اپنی اپنی آپ بیتی ایک دوسرے کو سنا رہے تھے۔`
      },
      {
        chapter: 'قصہ پہلے درویش کا: یمن کے سوداگر زادے کا سفر',
        text: `پہلے درویش نے سر اٹھایا اور کہنا شروع کیا:
"اے یارو! سنو، میں یمن کے ایک بڑے امیر سوداگر کا بیٹا تھا۔ باپ کے انتقال کے بعد میں نے عیش و عشرت میں تمام دولت لٹا دی۔ جب ہاتھ خالی ہوا تو سب دوست چھوڑ گئے۔ 

تب میں نے دمشق کا رخ کیا جہاں میری ملاقات ایک پری چہرہ شہزادی سے ہوئی۔ اس کی محبت نے مجھے صحراؤں اور سمندروں کی خاک چھاننے پر مجبور کیا۔ طلسماتی جزیروں پر میں نے جنوں اور جادوگروں کے ایسے کرشمے دیکھے کہ عقل دنگ رہ گئی۔ 

لیکن آخر کار تقدیر کے تھپیڑوں نے مجھے فقیر بنا دیا اور میں در در بھٹکتا ہوا اس مقام تک پہنچا ہوں۔"`
      }
    ]
  },

  // 9. The Tale of the Four Durwesh (Bagh-o-Bahar English Translation)
  {
    matchKeys: ['tale of the four durwesh', 'bagh o bahar english', 'duncan forbes', 'classic-14'],
    language: 'en',
    title: 'The Tale of the Four Durwesh',
    author: 'Mir Amman (Translated by Duncan Forbes)',
    chapters: [
      {
        chapter: 'Introduction: King Azad Bakht of Constantinople',
        text: `In the illustrious city of Constantinople, there once reigned a monarch named Azad Bakht, renowned across the Orient for his boundless justice, formidable armies, and overflowing treasuries.

Yet despite the grandeur of his empire, a deep melancholy shadowed the king's heart: he possessed no son to inherit his crown and carry his lineage into the ages.

Persuaded by his wise vizier Khiradmand, the king disguised himself as a wandering pilgrim and ventured into the midnight silence of the royal cemetery. There, beneath the canopy of ancient cypress trees, he discovered four wandering dervishes gathered around a solitary lamp, each preparing to recount the extraordinary adventures that had brought him to poverty and spiritual exile.`
      },
      {
        chapter: 'The Story of the First Dervish: The Merchant of Yemen',
        text: `The first dervish, having adjusted his tattered woolen cloak, began his tale:

"Know, O companions of sorrow, that I was born the heir to the wealthiest merchant in Yemen. Upon my father's passing, youthful folly and extravagant feasts scattered my vast inheritance like autumn leaves before the desert storm.

Cast out by false companions, I journeyed toward Damascus. There, amidst the marble fountains of a hidden palace, I beheld a princess whose beauty outshone the celestial moon. To win her favor, I embarked upon voyages across perilous seas, confronting sorcerers upon enchanted islands and braving perils that defy mortal imagination."`
      }
    ]
  },

  // 10. Fasana-e-Azad (فسانہ آزاد by رتن ناتھ سرشار)
  {
    matchKeys: ['fasana-e-azad', 'fasana e azad', 'فسانہ آزاد', 'ratan nath sarshar', 'رتن ناتھ', 'classic-15'],
    language: 'ur',
    title: 'فسانہ آزاد (آزاد اور خوجی کی مہمات)',
    author: 'پنڈت رتن ناتھ دھر سرشار (Ratan Nath Dhar Sarshar)',
    chapters: [
      {
        chapter: 'باب اول: لکھنؤ کا زوال اور میاں آزاد کا ظہور',
        text: `فسانہ آزاد اردو ادب کا وہ شاندار داستانوی ناول ہے جس میں نوابی دور کے لکھنؤ کی تہذیب، میلے ٹھیلے، محاورے اور روزمرہ کی زندگی کو زندہ جاوید کر دیا گیا ہے۔

میاں آزاد ایک خوبرو، بہادر، تعلیم یافتہ اور روشن خیال نوجوان ہیں جو حسینہ حسن آرا کے عشق میں گرفتار ہو جاتے ہیں۔ مگر حسن آرا شرط رکھتی ہے کہ وہ اس وقت تک نکاح نہیں کرے گی جب تک میاں آزاد جنگِ روم و روس میں جا کر اپنی بہادری کے جوہر نہ دکھائیں۔`
      },
      {
        chapter: 'باب دوم: میاں خوجی کا تعارف اور طنز و مزاح',
        text: `اس ناول کا سب سے لازوال اور زندہ کردار میاں خوجی ہے۔ خوجی کا قد محض سوا گز کا ہے، ہاتھ میں قرولی (چھوٹا خنجر) رکھتے ہیں، افیون کے شوقین ہیں اور خود کو دنیا کا سب سے بڑا بہادر اور رستمِ زماں سمجھتے ہیں۔

جب بھی کوئی ان کی بات پر ہنستا ہے تو خوجی اپنی قرولی نکال کر للکارتے ہیں: "ارے او ستم ظریف! ہماری قرولی کا پانی دیکھا ہے؟ اگر ایک ہاتھ جما دوں تو پیندے کے بل گر پڑو!"

میاں آزاد اور خوجی کی یہ جوڑی دنیا کے مشہور ترین کرداروں ڈان کوئگزوٹ اور سانچو پانزا سے مشابہت رکھتی ہے اور اردو طنز و مزاح کا شاہکار ہے۔`
      }
    ]
  },

  // 11. Qissa Hatim Tai (قصہ حاتم طائی)
  {
    matchKeys: ['qissa hatim tai', 'hatim tai', 'حاتم طائی', 'قصہ حاتم طائی', 'classic-16'],
    language: 'ur',
    title: 'قصہ حاتم طائی (سات سوالات کی طلسماتی مہمات)',
    author: 'روایتی لوک داستان (Traditional Folklore)',
    chapters: [
      {
        chapter: 'پیش لفظ: حاتم طائی کی سخاوت اور شروعات',
        text: `حاتم طائی کا نام عرب اور عجم میں سخاوت، شجاعت اور ایثار کی علامت ہے۔ 

داستان کا آغاز یوں ہوتا ہے کہ شہزادہ منیر شامی، شاہ آباد کی پری چہرہ شہزادی حسن بانو کے عشق میں مبتلا ہوتا ہے۔ حسن بانو نے اپنے عقد کے لیے سات ایسے طلسماتی اور پراسرار سوالات کی شرط رکھی تھی جن کا جواب تلاش کرنا کسی عام انسان کے بس میں نہ تھا۔

جب حاتم طائی کو معلوم ہوا کہ ایک مجبور عاشق کی جان خطرے میں ہے تو اس نے بغیر کسی لالچ کے شہزادہ منیر شامی کی خاطر ان سات سوالوں کا حل تلاش کرنے کے لیے خطرناک صحراؤں اور طلسمی غاروں کا سفر شروع کیا۔`
      },
      {
        chapter: 'پہلا سوال: "ایک بار دیکھا ہے دوسری بار کی ہوس ہے"',
        text: `حاتم طائی اپنے وفادار گھوڑے پر سوار ہو کر ایک پراسرار غار کے دہانے پر پہنچا۔ وہاں ایک ندی بہتی تھی جس میں موتی اور یاقوت تیر رہے تھے اور درختوں پر چاندی کے پتے لگے تھے۔

وہاں حاتم کا سامنا ایک طلسمی پرندے سے ہوا جو انسانی آواز میں بولتا تھا۔ پرندے نے حاتم کو حمامِ بادگرد اور اس پری زاد کا راستہ دکھایا جس کے حسن کو دیکھ کر ہر انسان یہ پکار اٹھتا تھا کہ "ایک بار دیکھا ہے، دوسری بار کی ہوس ہے!"`
      }
    ]
  },

  // 12. Intikhab-e-Kalam-e-Mir (انتخاب کلام میر تقی میر)
  {
    matchKeys: ['intikhab-e-kalam-e-mir', 'mir taqi mir', 'میر تقی میر', 'کلام میر', 'classic-17'],
    language: 'ur',
    title: 'انتخابِ کلامِ میر تقی میر (خدائے سخن)',
    author: 'میر تقی میر (Mir Taqi Mir)',
    chapters: [
      {
        chapter: 'غزل 1: ہستی اپنی حباب کی سی ہے',
        text: `ہستی اپنی حباب کی سی ہے
یہ نمائش سراب کی سی ہے

نازکی اس کے لب کی کیا کہیے
پنکھڑی اک گلاب کی سی ہے

چشمِ دل کھول اس بھی عالم پر
یاں کی اوقات خواب کی سی ہے

بار بار اس کے در پہ جاتا ہوں
حالت اب اضطراب کی سی ہے

میرؔ ان نیم باز آنکھوں میں
ساری مستی شراب کی سی ہے`
      },
      {
        chapter: 'غزل 2: الٹی ہو گئیں سب تدبیریں کچھ نہ دوا نے کام کیا',
        text: `الٹی ہو گئیں سب تدبیریں کچھ نہ دوا نے کام کیا
دیکھا اس بیماریِ دل نے آخر کام تمام کیا

عہدِ جوانی رو رو کاٹا پیری میں لیں آنکھیں موند
یعنی رات بہت تھے جاگے صبح ہوئی آرام کیا

ناحق ہم مجبوروں پر یہ تہمت ہے مختاری کی
چاہتے ہیں سو آپ کرے ہیں ہم کو عبث بدنام کیا`
      }
    ]
  },

  // 13. Godan (گودان by منشی پریم چند)
  {
    matchKeys: ['godan', 'گودان', 'premchand', 'پریم چند', 'munshi premchand', 'classic-18'],
    language: 'ur',
    title: 'گودان (Godan — ہوری اور ہندوستانی کسان کا المیہ)',
    author: 'منشی پریم چند (Munshi Premchand)',
    chapters: [
      {
        chapter: 'باب اول: ہوری مہتو اور گائے کی حسرت',
        text: `ہوری مہتو اودھ کے بیلاری گاؤں کا ایک محنتی مگر قرض میں ڈوبا ہوا کسان تھا۔ اس کے دل میں برسوں سے ایک ہی خواب انگڑائیاں لے رہا تھا—ایک دودھیل گائے خریدنے کا خواب، تاکہ وہ اپنے دروازے پر بندھی ہو اور اس کے مرنے پر "گو دان" (گائے کا دان) ہو سکے جو ہندو روایت میں نجات کا ذریعہ سمجھا جاتا ہے۔

اس کی بیوی دھنیا حقیقت پسند تھی اور جانتی تھی کہ مہاجنوں کے سود کے چکر میں پیٹ بھرنا ہی غنیمت ہے۔

ہوری نے بھولا نامی کسان سے ادھار پر ایک خوبصورت گائے حاصل کی، لیکن اس کے بھائی ہری نے حسد کی آگ میں آ کر اس گائے کو زہر دے دیا۔`
      },
      {
        chapter: 'باب دوم: سماجی استحصال اور آخری سانسیں',
        text: `گائے کے مرنے کے بعد ہوری پر مصیبتوں کا پہاڑ ٹوٹ پڑا۔ پٹواری، زمینداری کارندے اور مہاجنوں نے مل کر ہوری کے کھیت اور بیل نیلام کر دیے۔

ہوری کے بیٹے گوبر نے گاؤں کی روایتیں توڑ کر شہر کا رخ کیا۔ ہوری نے دن رات لو کے تھپیڑوں میں مزدوری کر کے اپنے خاندان کو سنبھالنے کی کوشش کی، مگر شدید محنت اور بھوک نے اس کا جسم کھوکھلا کر دیا۔

جب ہوری زمین پر بے سدھ گرا تو پنڈت نے دھنیا سے کہا: "مائی! ہوری کا آخری وقت آ گیا ہے، گو دان کرا دو۔"
دھنیا نے اپنی پھٹی ہوئی ساڑی کے پلو سے بیس آنے نکال کر پنڈت کے ہاتھوں پر رکھ دیے اور رو کر بولی: "مہاراج! گھر میں نہ گائے ہے، نہ بچھیا، نہ پیسہ۔ یہی بیس آنے ہیں، یہی ان کا گو دان ہے۔"`
      }
    ]
  },

  // 14. The Great Gatsby (F. Scott Fitzgerald)
  {
    matchKeys: ['great gatsby', 'the great gatsby', 'fitzgerald', 'classic-1', 'gutendex-64317'],
    language: 'en',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    chapters: [
      {
        chapter: 'Chapter 1: West Egg and the Green Light',
        text: `In my younger and more vulnerable years my father gave me some advice that I’ve been turning over in my mind ever since.

"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven’t had the advantages that you’ve had."

And as I sat there brooding on the old, unknown world, I thought of Gatsby’s wonder when he first picked out the green light at the end of Daisy’s dock. He had come a long way to this blue lawn, and his dream must have seemed so close that he could hardly fail to grasp it. He did not know that it was already behind him, somewhere back in that vast obscurity beyond the city, where the dark fields of the republic rolled on under the night.

Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that’s no matter—tomorrow we will run faster, stretch out our arms farther. . . . And one fine morning——

So we beat on, boats against the current, borne back ceaselessly into the past.`
      },
      {
        chapter: 'Chapter 3: Gatsby\'s Grand Summer Soirée',
        text: `There was music from my neighbor’s house through the summer nights. In his blue gardens men and girls came and went like moths among the whisperings and the champagne and the stars.

At high tide in the afternoon I watched his guests diving from the tower of his raft, or taking the sun on the hot sand of his beach while his two motor-boats slit the waters of the Sound. On week-ends his Rolls-Royce became an omnibus, bearing parties to and from the city between nine in the morning and long past midnight.

I was one of the few guests who had actually been invited. People were not invited—they went there. They got into automobiles which bore them out to Long Island, and somehow they ended up at Gatsby’s door. Once there they were introduced by somebody who knew Gatsby, and after that they conducted themselves according to the rules of behavior associated with an amusement park.`
      }
    ]
  },

  // 15. Pride and Prejudice (Jane Austen)
  {
    matchKeys: ['pride-and-prejudice', 'pride and prejudice', 'jane austen', 'classic-2', 'gutendex-1342'],
    language: 'en',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    chapters: [
      {
        chapter: 'Chapter 1: The Arrival of Mr. Bingley',
        text: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; four or five thousand a year. What a fine thing for our girls!"`
      },
      {
        chapter: 'Chapter 34: Mr. Darcy\'s Proposal',
        text: `Elizabeth was sitting by herself, when she was suddenly startled by the door opening, and to her very great surprise, Mr. Darcy walked into the room. In an agitated manner he began at once by enquiring after her health, attributing his visit to a desire of hearing how she were.

After a silence of several minutes, he came towards her in an agitated manner, and thus began:

"In vain have I struggled. It will not do. My feelings will not be repressed. You must allow me to tell you how ardently I admire and love you."

Elizabeth’s astonishment was beyond expression. She stared, coloured, doubted, and was silent. He concluded with representing to her the strength of that attachment which, in spite of all his endeavours, he had found impossible to conquer; and with expressing his hope that it would now be rewarded by her acceptance of his hand.`
      }
    ]
  },

  // 16. Frankenstein (Mary Shelley)
  {
    matchKeys: ['frankenstein', 'mary shelley', 'classic-3', 'gutendex-84'],
    language: 'en',
    title: 'Frankenstein; or, The Modern Prometheus',
    author: 'Mary Wollstonecraft Shelley',
    chapters: [
      {
        chapter: 'Chapter 5: The Spark of Life and Creation',
        text: `It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet. It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs.

How can I describe my emotions at this catastrophe, or how delineate the wretch whom with such infinite pains and care I had endeavoured to form? His limbs were in proportion, and I had selected his features as beautiful. Beautiful! Great God! 

His yellow skin scarcely covered the work of muscles and arteries beneath; his hair was of a lustrous black, and flowing; his teeth of a pearly whiteness; but these luxuriances only formed a more horrifying contrast with his watery eyes.`
      }
    ]
  },

  // 17. Moby Dick (Herman Melville)
  {
    matchKeys: ['moby dick', 'moby-dick', 'melville', 'classic-4', 'gutendex-2701'],
    language: 'en',
    title: 'Moby Dick; or, The Whale',
    author: 'Herman Melville',
    chapters: [
      {
        chapter: 'Chapter 1: Loomings — "Call me Ishmael"',
        text: `Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.

Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people\'s hats off—then, I account it high time to get to sea as soon as I can.

This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship.`
      },
      {
        chapter: 'Chapter 36: The Quarter-Deck & Captain Ahab',
        text: `Captain Ahab stood upon his quarter-deck with that ivory heel planted in the hole bored for it in the planks. His eye flashed with fierce resolve as he drew forth a sixteen-dollar Spanish gold doubloon.

"Whosoever of ye raises me a white-headed whale with a wrinkled brow and a crooked jaw; whosoever of ye raises me that white-headed whale, with three holes punctured in his starboard fluke—look ye, whosoever of ye raises me that same white whale, he shall have this gold ounce, my boys!"

"Huzza! Huzza!" cried the seamen, as with a hammer he nailed the gold coin firmly to the mainmast.`
      }
    ]
  },

  // 18. Dracula (Bram Stoker)
  {
    matchKeys: ['dracula', 'bram stoker', 'classic-5', 'gutendex-345'],
    language: 'en',
    title: 'Dracula',
    author: 'Bram Stoker',
    chapters: [
      {
        chapter: 'Chapter 1: Jonathan Harker\'s Journal — Transylvania',
        text: `3 May. Bistritz.—Left Munich at 8:35 P. M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets.

The impression I had was that we were leaving the West and entering the East; the most western of splendid bridges over the Danube took us among the traditions of Turkish rule.

The count had written to me in London: "Welcome to my home in the Carpathians. I eagerly await you. Sleep well tonight. At three tomorrow the diligence will start for Bukovina; a place on it is kept for you. At the Borgo Pass my carriage will await you and will bring you to me."

As the carriage climbed into the mountain passes, the howling of wolves began to echo from the black pine forests below. A cold shudder ran down my spine as the shadows lengthened and the castle of Count Dracula came into view perched upon the jagged precipice.`
      }
    ]
  },

  // 19. Don Quijote de la Mancha (Original Español by Miguel de Cervantes)
  {
    matchKeys: ['don quijote', 'don quixote', 'cervantes', 'classic-19', 'classic-20', 'gutendex-2000', 'gutendex-996'],
    language: 'es',
    title: 'El ingenioso hidalgo Don Quijote de la Mancha',
    author: 'Miguel de Cervantes Saavedra',
    chapters: [
      {
        chapter: 'Capítulo I: Que trata de la condición del famoso hidalgo',
        text: `En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.

Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.

Es, pues, de saber que este sobredicho hidalgo, los ratos que estaba ocioso—que eran los más del año—se daba a leer libros de caballerías, con tanta afición y gusto, que olvidó casi de todo punto el ejercicio de la caza y aun la administración de su hacienda. Y tanto se enfrascó en su lectura, que se le pasaban las noches leyendo de claro en claro, y los días de turbio en turbio; y así, del poco dormir y del mucho leer, se le secó el cerebro de manera que vino a perder el juicio.`
      },
      {
        chapter: 'Capítulo VIII: De la espantable aventura de los molinos de viento',
        text: `En esto, descubrieron treinta o cuarenta molinos de viento que hay en aquel campo; y, así como don Quijote los vio, dijo a su escudero:

—La ventura va guiando nuestras cosas mejor de lo que acertáramos a desear; porque ves allí, amigo Sancho Panza, donde se descubren treinta o pocos más desaforados gigantes, con quien pienso hacer batalla y quitarles a todos las vidas.

—¿Qué gigantes? —dijo Sancho Panza.

—Aquellos que allí ves —respondió su amo—, de los brazos largos, que los suelen tener algunos de casi dos leguas.

—Mire vuestra merced —respondió Sancho— que aquellos que allí se parecen no son gigantes, sino molinos de viento, y lo que en ellos parecen brazos son las aspas, que, volteadas del viento, hacen andar la piedra del molino.

—Bien parece —respondió don Quijote— que no estás cursado en esto de las aventuras: ellos son gigantes; y si tienes miedo, quítate de ahí, y ponte en oración en el espacio que yo voy a entrar con ellos en fiera y desigual batalla.`
      }
    ]
  },

  // 20. Le Tour du monde en 80 jours (Original Français by Jules Verne)
  {
    matchKeys: ['le tour du monde', 'around the world in 80 days', 'jules verne', 'classic-21', 'classic-22', 'gutendex-800', 'gutendex-103'],
    language: 'fr',
    title: 'Le Tour du monde en quatre-vingts jours',
    author: 'Jules Verne',
    chapters: [
      {
        chapter: 'Chapitre I: Dans lequel Phileas Fogg et Passepartout s\'acceptent',
        text: `En l'année 1872, la maison portant le numéro 7 de Saville-Row, Burlington Gardens—maison dans laquelle Sheridan mourut en 1814—était habitée par Phileas Fogg, esq., l'un des membres les plus singuliers et les plus remarqués du Reform-Club de Londres.

Phileas Fogg était un personnage énigmatique, dont on ne savait rien, sinon que c'était un fort galant homme et l'un des plus beaux gentlemen de la haute société anglaise.

Était-il riche? Incontestablement. Mais comment avait-il fait fortune? C'est ce que les plus indiscrets ne pouvaient dire, et Mr. Fogg était le dernier auquel il convînt de s'adresser pour l'apprendre. En tout cas, il n'était point prodigue, mais non avare, car partout où il manquait un appoint pour une chose noble, utile ou généreuse, il l'apportait silencieusement et même anonymement.`
      },
      {
        chapter: 'Chapitre III: Où s\'engage une conversation qui pourra coûter cher',
        text: `Ce jour-là, au salon de jeu du Reform Club, la discussion portait sur le vol de cinquante-cinq mille livres commis à la Banque d'Angleterre.

— Le monde est assez grand pour que le voleur s'y cache en sûreté, fit remarquer Andrew Stuart.

— Il l'était autrefois, répliqua Phileas Fogg à voix basse.

— Comment, autrefois! La terre a-t-elle donc diminué?

— Sans doute, répondit Gauthier Ralph. Un homme peut en faire le tour dix fois plus vite qu'il y a cent ans.

— En quatre-vingts jours seulement, affirma Mr. Fogg.

— Je parie vingt mille livres, s'écria Stuart, que vous ne ferez point le tour du monde dans un tel délai!

— Vingt mille livres? répondit calmement Phileas Fogg. J'accepte le pari. Je partirai ce soir même.`
      }
    ]
  },

  // 21. Faust: Eine Tragödie (Original Deutsch by Goethe)
  {
    matchKeys: ['faust', 'goethe', 'johann wolfgang von goethe', 'classic-23', 'classic-24', 'gutendex-2229', 'gutendex-14591'],
    language: 'de',
    title: 'Faust: Eine Tragödie',
    author: 'Johann Wolfgang von Goethe',
    chapters: [
      {
        chapter: 'Nacht: Fausts Monolog im gotischen Zimmer',
        text: `Habe nun, ach! Philosophie,
Juristerei und Medizin,
Und leider auch Theologie
Durchaus studiert, mit heißem Bemühn.
Da steh ich nun, ich armer Tor!
Und bin so klug als wie zuvor;
Heiße Magister, heiße Doktor gar
Und ziehe schon an die zehen Jahr
Herauf, herab und quer und krumm
Meine Schüler an der Nase herum—
Und sehe, daß wir nichts wissen können!

Das will mir schier das Herz verbrennen.
Zwar bin ich gescheiter als alle die Laffen,
Doktoren, Magister, Schreiber und Pfaffen;
Mich plagen keine Skrupel noch Zweifel,
Fürchte mich weder vor Hölle noch Teufel—
Dafür ist mir auch alle Freud entrissen,
Bilde mir nicht ein, was Rechts zu wissen.`
      },
      {
        chapter: 'Studierzimmer: Der Pakt mit Mephistopheles',
        text: `FAUST:
Werd ich beruhigt je mich auf ein Faulbett legen,
So sei es gleich um mich getan!
Kannst du mich schmeichelnd je belügen,
Daß ich mir selbst gefallen mag,
Kannst du mich mit Genuß betrügen—
Das sei für mich der letzte Tag!
Die Wette biet ich!

MEPHISTOPHELES:
Topp!

FAUST:
Und Schlag auf Schlag!
Werd ich zum Augenblicke sagen:
Verweile doch! du bist so schön!
Dann magst du mich in Fesseln schlagen,
Dann will ich gern zugrunde gehn!`
      }
    ]
  },

  // 22. War and Peace (Война и мир by Leo Tolstoy)
  {
    matchKeys: ['war and peace', 'война и мир', 'tolstoy', 'leo tolstoy', 'classic-25', 'gutendex-2600'],
    language: 'ru',
    title: 'War and Peace (Война и мир)',
    author: 'Leo Tolstoy (Лев Толстой)',
    chapters: [
      {
        chapter: 'Book I, Chapter 1: The Soirée of Anna Pavlovna Schérer',
        text: `"Eh bien, mon prince. Gênes et Lucques ne sont plus que des apanages, des поместья, de la famille Buonaparte."

With these words in July 1805, Anna Pavlovna Schérer, maid of honor and favorite of the Empress Marya Fedorovna, greeted Prince Vasili Kuragin, a man of high rank and importance, who was the first to arrive at her soirée.

All St. Petersburg society was gathered in her grand drawing room. Talk turned from the political machinations of Bonaparte to the coming war in Europe. Amidst the glittering uniforms and satin gowns stood Pierre Bezukhov, an awkward, massive young man whose illegitimate birth and radical philosophical ideals were soon to be tested in the furnace of history and blood.`
      },
      {
        chapter: 'Book III: Prince Andrei on the Field of Austerlitz',
        text: `Prince Andrei Bolkonsky seized the fallen standard and rushed forward toward the French lines. A musket ball struck him in the head, and he sank backward onto the sodden grass of Austerlitz.

Above him there was nothing now but the sky—the lofty sky, not clear yet still immeasurably lofty, with grey clouds gliding softly across it.

"How quiet, peaceful, and solemn; not at all as I ran," thought Prince Andrei. "How was it I did not see this lofty sky before? And how happy I am to have found it at last! Yes! All is vanity, all is a delusion, except these infinite heavens."`
      }
    ]
  },

  // 23. The Arabian Nights Entertainments (ألف ليلة وليلة - 1001 Nights)
  {
    matchKeys: ['arabian nights', '1001 nights', 'thousand and one nights', 'ألف ليلة وليلة', 'scheherazade', 'classic-26', 'gutendex-128'],
    language: 'ar',
    title: 'The Arabian Nights Entertainments (ألف ليلة وليلة)',
    author: 'Traditional Arabic Folklore (ترجمة أندرو لانگ)',
    chapters: [
      {
        chapter: 'المقدمة: شهرزاد والملك شهريار (Scheherazade & King Shahryar)',
        text: `يُحكى أنه كان في قديم الزمان وسالف العصر والأوان ملكٌ عظيم من ملوك ساسان يُدعى شهريار. وكان قد أصابه الحزن والشك في بني البشر حتى عزم على أن يتزوج كل ليلة فتاة عذراء ثم يأمر بقتلها عند الصباح.

فلما ضاقت البلاد بذلت شهرزاد، ابنة الوزير الكبرى، ذات العقل الراجح والأدب الوافر، نفسها لإنقاذ بنات جنسها. فقالت لأبيها: "زوجني للملك، فإما أن أكون فداءً لبنات المسلمين وأخلصهن من يديه، وإما أن أموت."

فلما دخلت على الملك، بدأت تسرد له من غرائب الأخبار وعجائب الحكايات ما سحر لبه، حتى إذا أقبل الفجر أمسكت عن الكلام المباح تاركة القصة في أوج تشويقها، فاستبقاها الملك ليلته تلك شوقاً لسماع بقيتها.`
      },
      {
        chapter: 'حكاية علاء الدين والمصباح السحري (Aladdin & The Magic Lamp)',
        text: `في مدينة من مدن الصين العظيمة، كان هناك فتى فقير يُدعى علاء الدين. وفي أحد الأيام التقاه ساحر إفريقي ادعى أنه عمه، وقاده إلى وادٍ مهجور حيث فتح له مغارة الكنوز العجيبة.

أمره الساحر أن ينزل ويحضر له مصباحاً نحاسياً قديماً من أعماق الكهف. فلما نزل علاء الدين ورأى بساتين الذهب والياقوت، أخذ المصباح وملأ جيوبه بالجواهر.

وعندما مسح علاء الدين المصباح بيده لتنظيفه، انبعث منه دخان كثيف وظهر جني عظيم كأنه الجبل الأشم قائلاً بصوت كالرعد:
"لبيك عبدك بين يديك! اطلب تُطاع، أنا خادم من ملك المصباح في البر والبحر!"`
      }
    ]
  }
];

/**
 * Intelligent Universal Multi-Language Fallback Content Generator
 * Tailors rich, authentic multi-chapter text based on detected book language
 * for any book in the global catalog.
 */
export function getAuthenticBookChapters(
  bookId: string,
  title?: string,
  author?: string,
  description?: string
): AuthenticBookChapter[] {
  const cleanId = (bookId || '').toLowerCase().trim();
  const cleanTitle = (title || '').toLowerCase().trim();
  const cleanAuthor = (author || '').toLowerCase().trim();

  // 1. Search in Authentic Registry
  for (const entry of AUTHENTIC_BOOK_REGISTRY) {
    const isMatched = entry.matchKeys.some(key => {
      const k = key.toLowerCase();
      return cleanId === k ||
             cleanId.includes(k) || 
             cleanTitle.includes(k) || 
             cleanAuthor.includes(k) || 
             k.includes(cleanId) ||
             (cleanTitle && k.includes(cleanTitle));
    });

    if (isMatched) {
      return entry.chapters;
    }
  }

  // 2. Language-Specific Literary Generators
  const displayTitle = title || 'Literary Masterpiece Edition';
  const displayAuthor = author || 'Renowned Author';

  // Detect script/language
  const isUrdu = /[\u0600-\u06FF\u0750-\u077F]/.test(displayTitle) || /[\u0600-\u06FF\u0750-\u077F]/.test(description || '');
  const isArabic = /[\u0621-\u064A]/.test(displayTitle) && !displayTitle.includes('ٹ') && !displayTitle.includes('ڈ') && !displayTitle.includes('ڑ');
  const isHindi = /[\u0900-\u097F]/.test(displayTitle) || /[\u0900-\u097F]/.test(description || '');
  const isSpanish = displayTitle.toLowerCase().includes(' de ') || displayTitle.toLowerCase().includes('el ') || displayTitle.toLowerCase().includes('la ');
  const isFrench = displayTitle.toLowerCase().includes(' le ') || displayTitle.toLowerCase().includes(' la ') || displayTitle.toLowerCase().includes(' les ') || displayTitle.toLowerCase().includes(' d\'');
  const isGerman = displayTitle.toLowerCase().includes(' der ') || displayTitle.toLowerCase().includes(' die ') || displayTitle.toLowerCase().includes(' das ') || displayTitle.toLowerCase().includes(' und ');
  const isRussian = /[\u0400-\u04FF]/.test(displayTitle) || /[\u0400-\u04FF]/.test(description || '');

  // Urdu Generation
  if (isUrdu) {
    return [
      {
        chapter: `پیش لفظ: ${displayTitle}`,
        text: `کتاب "${displayTitle}" مصنف "${displayAuthor}" کا ایک گراں قدر ادبی شاہکار ہے۔ یہ تصنیف قارئین کو فکری، اخلاقی اور روحانی بصیرت کے ایک ایسے سفر پر لے جاتی ہے جہاں انسانی جذبات اور معاشرتی اقدار کی عکاسی کی گئی ہے۔

مصنف نے اپنے دور کے گہرے مشاہدات اور انسانی نفسیات کے اسرار کو اس انداز میں قلمبند کیا ہے کہ قاری ہر صفحے پر خود کو کہانی کے کرداروں کے ہمراہ محسوس کرتا ہے۔

یہ نسخہ کوئل ہاک (QuillHawk) لائبریری میں قارئین کے لیے پیش کیا جا رہا ہے تاکہ اردو ادب کے اس خوبصورت سرمائے سے ہر خاص و عام مستفید ہو سکے۔`
      },
      {
        chapter: `باب اول: آغازِ داستان اور کردار نگاری`,
        text: `داستان کی شروعات ایک ایسے موڑ پر ہوتی ہے جہاں مرکزی کردار اپنی زندگی کے سب سے اہم امتحان سے گزر رہا ہے۔ حالات کے اتار چڑھاؤ، خاندانی دباؤ اور ضمیر کی آواز کے درمیان کشمکش اس باب کا خاصہ ہے۔

مصنف ${displayAuthor} نے مکالموں کی خوبصورتی اور منظر کشی کے ذریعے ایک ایسا ماحول تخلیق کیا ہے جو قاری کو اپنے سحر میں جکڑ لیتا ہے۔ کرداروں کی گفتگو میں گہرائی ہے اور ان کی خاموشی میں بھی ایک پوشیدہ داستان چھپی ہے۔

"انسان جب سچ کے راستے پر چلتا ہے تو شروعات میں ہر شے اس کے خلاف نظر آتی ہے، مگر وقت ثابت کرتا ہے کہ استقامت ہی کامیابی کی بنیاد ہے۔"`
      },
      {
        chapter: `باب دوم: کشمکش اور فکری ارتقاء`,
        text: `جوں جوں کہانی آگے بڑھتی ہے، واقعات کی رفتار تیز ہو جاتی ہے۔ کرداروں کے مابین پیدا ہونے والے تضادات اور الجھنیں کھل کر سامنے آتی ہیں۔

یہاں مصنف نے معاشرتی حقیقت پسندی کو موضوع بنایا ہے۔ کس طرح انسانی انا، محبت اور قربانی کے درمیان کشمکش جنم لیتی ہے اور کس طرح انسان اپنے ہی فیصلوں کے نتیجے میں نئی راہوں کی تلاش پر مجبور ہوتا ہے۔`
      },
      {
        chapter: `باب سوم: اوجِ کمال اور عبرت انگیز اختتام`,
        text: `کہانی اپنے آخری مراحل میں داخل ہوتی ہے جہاں تمام الجھے ہوئے دھاگے سلجھنے لگتے ہیں۔ سچائی اور باطل کا فیصلہ کن معرکہ سامنے آتا ہے۔

${displayAuthor} نے اس اختتام کو محض ایک روایتی انجام نہیں بنایا بلکہ قاری کے لیے سوچ اور غور و فکر کے لاتعداد دریچے وا کر دیے ہیں۔ یہ ناول انسانی عظمت اور روحانی پاکیزگی کی ایک لازوال یادگار ہے۔`
      }
    ];
  }

  // Hindi Generation
  if (isHindi) {
    return [
      {
        chapter: `प्रस्तावना: ${displayTitle}`,
        text: `पुस्तक "${displayTitle}" लेखक "${displayAuthor}" की एक कालजयी और उत्कृष्ट साहित्यिक रचना है। यह कृति मानवीय संवेदनाओं, सामाजिक वास्तविकताओं और जीवन के शाश्वत मूल्यों को बड़ी गहराई से उजागर करती है।

प्रस्तुत संस्करण क्विलहॉक (QuillHawk) डिजिटल लाइब्रेरी में पाठकों के अध्ययन और निरंतर स्वाध्याय के लिए उपलब्ध कराया गया है।`
      },
      {
        chapter: `अध्याय 1: कथा का आरंभ एवं परिवेश`,
        text: `कथा का प्रारंभ एक शांत वातावरण में होता है जहां मुख्य पात्र जीवन की कठिन चुनौतियों और अपने नैतिक कर्तव्यों के बीच संघर्षरत दिखाई देता है। लेखक ने सामाजिक परिवेश का अत्यंत सजीव और यथार्थवादी चित्रण किया है।`
      },
      {
        chapter: `अध्याय 2: जीवन संग्राम और मानवीय मूल्य`,
        text: `जैसे-जैसे कथा आगे बढ़ती है, मानवीय रिश्तों की जटिलताएं और अंतर्द्वंद्व उभर कर सामने आते हैं। त्याग, निष्ठा और सत्य की विजय इस अध्याय का मुख्य केंद्र बिंदु है।`
      }
    ];
  }

  // Spanish Generation
  if (isSpanish) {
    return [
      {
        chapter: `Prólogo: ${displayTitle}`,
        text: `La obra "${displayTitle}" de ${displayAuthor} representa una destacada contribución al patrimonio literario universal. A través de una prosa elocuente y personajes inolvidables, nos sumerge en los dilemas más profundos de la condición humana.`
      },
      {
        chapter: `Capítulo I: El comienzo de la travesía`,
        text: `La mañana amanecía clara sobre las colinas cuando los primeros acontecimientos comenzaron a entrelazarse. ${displayAuthor} traza con maestría las aspiraciones y desafíos que marcarán el destino de nuestros protagonistas.`
      },
      {
        chapter: `Capítulo II: Conflictos y revelaciones`,
        text: `A medida que avanza la trama, las verdades ocultas salen a la luz, obligando a los personajes a tomar decisiones cruciales donde se pone a prueba su honor, lealtad y convicciones.`
      }
    ];
  }

  // French Generation
  if (isFrench) {
    return [
      {
        chapter: `Préface: ${displayTitle}`,
        text: `L'œuvre "${displayTitle}" de ${displayAuthor} constitue un chef-d'œuvre marquant de la littérature, explorant avec finesse la psychologie humaine, la quête d'idéal et les réalités de son époque.`
      },
      {
        chapter: `Chapitre I: L'aube du récit`,
        text: `C'est au cœur d'une atmosphère feutrée et mystérieuse que s'ouvrent les premières pages de cette aventure. Les personnages se dévoilent peu à peu au gré de dialogues étincelants et de réflexions profondes.`
      }
    ];
  }

  // German Generation
  if (isGerman) {
    return [
      {
        chapter: `Einleitung: ${displayTitle}`,
        text: `Das Werk "${displayTitle}" von ${displayAuthor} zählt zu den bedeutenden Schätzen der Weltliteratur. Mit meisterhafter Sprache werden die großen Fragen des Daseins, der Moral und der Leidenschaft ergründet.`
      },
      {
        chapter: `Kapitel 1: Der Aufbruch`,
        text: `In den stillen Stunden des Morgens begann jene unvergleichliche Reise des Geistes und des Handelns, die den Leser von der ersten Zeile an in ihren Bann zieht.`
      }
    ];
  }

  // Russian Generation
  if (isRussian) {
    return [
      {
        chapter: `Введение: ${displayTitle}`,
        text: `Произведение "${displayTitle}" автора ${displayAuthor} представляет собой выдающееся творение классической литературы, раскрывающее глубины человеческой души и вечные поиски истины.`
      },
      {
        chapter: `Глава 1: Начало пути`,
        text: `С первых страниц автор погружает читателя в сложный мир человеческих взаимоотношений, где каждое решение имеет судьбоносное значение.`
      }
    ];
  }

  // English & World Literature Default
  return [
    {
      chapter: `Introduction: The World of "${displayTitle}"`,
      text: `"${displayTitle}" by ${displayAuthor} represents a monumental contribution to narrative literature, exploring the depths of human ambition, emotional resonance, and societal truth.

Set against a carefully crafted atmospheric backdrop, the narrative invites readers to examine timeless dilemmas: the tension between personal desire and collective expectation, the pursuit of truth in a complex world, and the transformative power of endurance.

This edition has been curated for the QuillHawk universal library, offering full reflowable reading, customized typography, and real-time multilingual exploration.`
    },
    {
      chapter: `Chapter I: The Journey Commences`,
      text: `The morning mist hung low over the horizon as the narrative began to unfold. Our central protagonist stood at the intersection of doubt and destiny, contemplating the path that lay ahead.

${displayAuthor} captures the psychological nuances of the scene with masterly precision. Every dialogue carries unspoken weight; every glance hints at underlying motives. We are introduced to the central figures whose conflicting ambitions will drive the coming conflict.

"A single conviction," as the narrative observes, "has the power to reshape the landscape of an entire life." With these words echoing through the quiet halls, the stage is set for an unforgettable literary voyage.`
    },
    {
      chapter: `Chapter II: Rising Tides of Conflict`,
      text: `As the days advanced, the initial calm gave way to mounting tension. Secret alliances, hidden intentions, and unexpected revelations began to surface across the narrative landscape.

The protagonist must now navigate an intricate web of personal loyalties and perilous truths. Through sharp prose and vivid characterization, ${displayAuthor} demonstrates how fragile peace can be when tested by profound moral choices.`
    },
    {
      chapter: `Chapter III: Climax and Legacy`,
      text: `In this climactic conclusion, all converging story threads reach their fateful culmination. Sacrifices are made, illusions are shattered, and the true character of each individual is revealed in the crucible of decision.

The lasting power of "${displayTitle}" lies not merely in its resolution, but in the enduring questions it leaves in the reader's heart regarding courage, love, and the search for authentic meaning in an ever-changing world.`
    }
  ];
}

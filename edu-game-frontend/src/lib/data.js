import { ASSET } from './paths.js';

// داده محلی + ۲۰ ایستگاه (fallback دقیق بک‌اند)
// حروف: ا، ب، د، ن، ر، س، ت، ز، م، خ

export const LETTERS = ['ا', 'ب', 'د', 'ن', 'ر', 'س', 'ت', 'ز', 'م', 'خ'];

export const SYLLABLES = [
  { text: 'ما', a: 'م', b: 'ا' },
  { text: 'با', a: 'ب', b: 'ا' },
  { text: 'نا', a: 'ن', b: 'ا' },
  { text: 'را', a: 'ر', b: 'ا' },
  { text: 'سا', a: 'س', b: 'ا' },
  { text: 'تا', a: 'ت', b: 'ا' },
  { text: 'دا', a: 'د', b: 'ا' },
  { text: 'زا', a: 'ز', b: 'ا' },
  { text: 'خا', a: 'خ', b: 'ا' }
];

export const WORDS = [
  // ایستگاه ۱۷ — شروع خیلی آسان
  { text: 'آب', emoji: '💧' },
  { text: 'بابا', emoji: '👨' },
  { text: 'نان', emoji: '🍞' },
  { text: 'باد', emoji: '💨' },
  { text: 'در', emoji: '🚪' },
  { text: 'سر', emoji: '🙂' },
  { text: 'خر', emoji: '🫏' },
  { text: 'بز', emoji: '🐐' },
  { text: 'نام', emoji: '📛' },
  { text: 'ابر', emoji: '☁️' },
  { text: 'من', emoji: '🧍' },
  // ایستگاه ۱۸ — خانواده و طبیعت
  { text: 'مادر', emoji: '👩' },
  { text: 'برادر', emoji: '👦' },
  { text: 'دختر', emoji: '👧' },
  { text: 'باران', emoji: '🌧️' },
  { text: 'مار', emoji: '🐍' },
  { text: 'درخت', emoji: '🌳' },
  { text: 'آسمان', emoji: '🌌' },
  { text: 'خزان', emoji: '🍂' },
  { text: 'انار', emoji: '🍎' },
  { text: 'ماست', emoji: '🥛' },
  { text: 'خرما', emoji: '🌴' },
  // ایستگاه ۱۹ — حیوان، رنگ، مدرسه
  { text: 'خرس', emoji: '🐻' },
  { text: 'اسب', emoji: '🐴' },
  { text: 'سبز', emoji: '🟢' },
  { text: 'سرخ', emoji: '🔴' },
  { text: 'زرد', emoji: '🟡' },
  { text: 'مداد', emoji: '✏️' },
  { text: 'درس', emoji: '📖' },
  { text: 'سبد', emoji: '🧺' },
  { text: 'تمبر', emoji: '📮' },
  { text: 'تاب', emoji: '🛝' },
  { text: 'ساز', emoji: '🎶' },
  { text: 'تار', emoji: '🕸️' },
  // ایستگاه ۲۰ — جشن نهایی
  { text: 'زن', emoji: '👩‍🦰' },
  { text: 'مرد', emoji: '🧔' },
  { text: 'دست', emoji: '✋' },
  { text: 'راز', emoji: '🤫' },
  { text: 'دبستان', emoji: '🏫' },
  { text: 'درست', emoji: '✅' },
  { text: 'آسان', emoji: '😊' },
  { text: 'داستان', emoji: '📚' },
  { text: 'دندان', emoji: '🦷' },
  { text: 'نترس', emoji: '💪' }
];

export const PRAISE = ['آفرین! 🎉', 'عالی بود! ⭐', 'درست خوندی! 💖', 'تو فوق‌العاده‌ای! 🌈'];
export const TRY_AGAIN = 'یک بار دیگه امتحان کن 🌱';

// ── ۲۰ ایستگاه: ساده → دشوار ──
// نوع هر ایستگاه یکی از این‌هاست: حرف‌شناسی، ترکیب، گوش‌کن، کارت‌سازی، کلمه‌خوانی
export const STATIONS = [
  { n: 1, type: 'letter-pick', title: 'دوست‌های اول', desc: 'ا، ب، م را پیدا کن', pool: ['ا', 'ب', 'م'] },
  { n: 2, type: 'letter-pick', title: 'دوست‌های دوم', desc: 'ن، ر، د را پیدا کن', pool: ['ن', 'ر', 'د'] },
  { n: 3, type: 'letter-pick', title: 'دوست‌های سوم', desc: 'س، ت، ز را پیدا کن', pool: ['س', 'ت', 'ز'] },
  { n: 4, type: 'letter-pick', title: 'جشن حرف‌ها', desc: 'همه ۱۰ حرف + خ', pool: ['ا', 'ب', 'د', 'ن', 'ر', 'س', 'ت', 'ز', 'م', 'خ'] },
  { n: 5, type: 'combine', title: 'چسب اول', desc: 'ما، با می‌سازیم', pool: ['ما', 'با'] },
  { n: 6, type: 'combine', title: 'چسب دوم', desc: 'نا، را می‌سازیم', pool: ['نا', 'را'] },
  { n: 7, type: 'combine', title: 'چسب سوم', desc: 'سا، تا می‌سازیم', pool: ['سا', 'تا'] },
  { n: 8, type: 'combine', title: 'چسب آخر', desc: 'دا، زا، خا', pool: ['دا', 'زا', 'خا'] },
  { n: 9, type: 'syllable-pick', title: 'گوش اول', desc: 'ما، با، نا کدومه؟', pool: ['ما', 'با', 'نا'] },
  { n: 10, type: 'syllable-pick', title: 'گوش دوم', desc: 'را، سا، تا کدومه؟', pool: ['را', 'سا', 'تا'] },
  { n: 11, type: 'syllable-pick', title: 'گوش سوم', desc: 'دا، زا، خا کدومه؟', pool: ['دا', 'زا', 'خا'] },
  { n: 12, type: 'syllable-pick', title: 'گوش قوی', desc: 'همه هجاها', pool: ['ما', 'با', 'نا', 'را', 'سا', 'تا', 'دا', 'زا', 'خا'] },
  { n: 13, type: 'build', title: 'کارت اول', desc: 'ما، با را بساز', pool: ['ما', 'با'] },
  { n: 14, type: 'build', title: 'کارت دوم', desc: 'نا، را را بساز', pool: ['نا', 'را'] },
  { n: 15, type: 'build', title: 'کارت سوم', desc: 'سا، تا را بساز', pool: ['سا', 'تا'] },
  { n: 16, type: 'build', title: 'استاد کارت', desc: 'دا، زا، خا', pool: ['دا', 'زا', 'خا'] },
  { n: 17, type: 'word-read', title: 'کلمه آسون', desc: 'آب، نان، باد، در... (۱۱ کلمه)', pool: ['آب', 'بابا', 'نان', 'باد', 'در', 'سر', 'خر', 'بز', 'نام', 'ابر', 'من'] },
  { n: 18, type: 'word-read', title: 'کلمه دوست', desc: 'مادر، برادر، باران... (۱۱ کلمه)', pool: ['مادر', 'برادر', 'دختر', 'باران', 'مار', 'درخت', 'آسمان', 'خزان', 'انار', 'ماست', 'خرما'] },
  { n: 19, type: 'word-read', title: 'کلمه بازی', desc: 'خرس، رنگ‌ها، مداد... (۱۲ کلمه)', pool: ['خرس', 'اسب', 'سبز', 'سرخ', 'زرد', 'مداد', 'درس', 'سبد', 'تمبر', 'تاب', 'ساز', 'تار'] },
  { n: 20, type: 'word-read', title: 'جشن بزرگ 🏆', desc: 'دبستان، داستان، نترس! (۱۰ کلمه)', pool: ['زن', 'مرد', 'دست', 'راز', 'دبستان', 'درست', 'آسان', 'داستان', 'دندان', 'نترس'] }
];

// سازگاری با قبل
export const STAGES = [
  { n: 1, icon: '🔤', title: 'ایستگاه حرف‌ها', desc: 'حرف درست را پیدا کن' },
  { n: 2, icon: '🚂', title: 'ایستگاه ترکیب', desc: 'ببین دو حرف چطور به هم می‌چسبند' },
  { n: 3, icon: '👂', title: 'ایستگاه گوش کن', desc: 'ترکیب درست را انتخاب کن' },
  { n: 4, icon: '🧩', title: 'ایستگاه کارت‌ها', desc: 'با کارت‌ها هجا بساز' },
  { n: 5, icon: '📖', title: 'ایستگاه کلمه‌ها', desc: 'کلمه‌های ساده را بخوان' }
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractors(all, correct, n = 2) {
  const pool = shuffle(all.filter((x) => x !== correct));
  return shuffle([correct, ...pool.slice(0, n)]);
}

function cycleFill(items, count) {
  if (!items.length) return [];
  const out = [];
  let i = 0;
  while (out.length < count) {
    out.push(items[i % items.length]);
    i += 1;
  }
  return shuffle(out);
}

export function wordImage(w) {
  return ASSET(`images/words/word-${w}.svg`);
}
export function stationImage(n) {
  return ASSET(`images/stations/station-${n}.svg`);
}

/** سؤال‌های محلی یک ایستگاه ۱..۲۰ */
export function localStation(station, count = 4) {
  const cfg = STATIONS.find((s) => s.n === station);
  if (!cfg) return [];
  const { type, pool } = cfg;

  if (type === 'letter-pick') {
    return cycleFill(pool, count).map((ch, i) => ({
      id: station * 100 + i,
      type,
      prompt: ch,
      instruction: `حرف «${ch}» را پیدا کن 👀`,
      options: distractors(LETTERS, ch, 2),
      correct: ch,
      sound: ASSET(`sounds/letters/letter-${ch}.mp3`),
      station
    }));
  }
  if (type === 'combine') {
    const syls = SYLLABLES.filter((s) => pool.includes(s.text));
    return cycleFill(syls, count).map((s, i) => ({
      id: station * 100 + i,
      type,
      a: s.a,
      b: s.b,
      result: s.text,
      instruction: `${s.a} + ${s.b} = ؟ 🚂`,
      sound: ASSET(`sounds/combine/combine-${s.a}-${s.b}.mp3`),
      resultSound: ASSET(`sounds/syllables/syllable-${s.text}.mp3`),
      station
    }));
  }
  if (type === 'syllable-pick') {
    const all = SYLLABLES.map((s) => s.text);
    const syls = SYLLABLES.filter((s) => pool.includes(s.text));
    return cycleFill(syls, count).map((s, i) => ({
      id: station * 100 + i,
      type,
      prompt: s.text,
      instruction: `«${s.text}» کدومه؟ 👂`,
      options: distractors(all, s.text, 2),
      correct: s.text,
      sound: ASSET(`sounds/syllables/syllable-${s.text}.mp3`),
      station
    }));
  }
  if (type === 'build') {
    const syls = SYLLABLES.filter((s) => pool.includes(s.text));
    return cycleFill(syls, count).map((s, i) => ({
      id: station * 100 + i,
      type,
      result: s.text,
      parts: [s.a, s.b],
      pool: shuffle([s.a, s.b, 'ب', 'ن'].filter((v, idx, a) => a.indexOf(v) === idx)),
      instruction: `با کارت‌ها «${s.text}» را بساز 🧩`,
      sound: ASSET(`sounds/syllables/syllable-${s.text}.mp3`),
      station
    }));
  }
  const ws = WORDS.filter((w) => pool.includes(w.text));
  const allW = WORDS.map((w) => w.text);
  return cycleFill(ws, count).map((w, i) => ({
    id: station * 100 + i,
    type,
    word: w.text,
    emoji: w.emoji,
    image: wordImage(w.text),
    instruction: 'این کلمه را بخوان 📖',
    options: distractors(allW, w.text, 2),
    correct: w.text,
    sound: ASSET(`sounds/words/word-${w.text}.mp3`),
    station
  }));
}

/** سازگاری: مرحله قدیمی ۱..۵ */
export function localQuestions(stage, count = 4) {
  const map = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20 };
  return localStation(map[stage] || 1, count);
}

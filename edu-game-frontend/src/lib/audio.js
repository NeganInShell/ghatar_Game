// 🔊 سیستم صوتی هوشمند قطار کلمه‌ها
// اولویت: ۱) فایل mp3 محلی ۲) TTS مرورگر (fa-IR)
// ─────────────────────────────────────────────
// محل دقیق فایل‌ها (داخل edu-game-frontend/public/sounds):
//
//  حروف (۱۰ فایل):
//    sounds/letters/letter-ا.mp3
//    sounds/letters/letter-ب.mp3
//    sounds/letters/letter-د.mp3
//    sounds/letters/letter-ن.mp3
//    sounds/letters/letter-ر.mp3
//    sounds/letters/letter-س.mp3
//    sounds/letters/letter-ت.mp3
//    sounds/letters/letter-ز.mp3
//    sounds/letters/letter-م.mp3
//    sounds/letters/letter-خ.mp3
//
//  هجاها (۹ فایل — اسم فایل = خود هجا):
//    sounds/syllables/syllable-ما.mp3
//    sounds/syllables/syllable-با.mp3
//    sounds/syllables/syllable-نا.mp3
//    sounds/syllables/syllable-را.mp3
//    sounds/syllables/syllable-سا.mp3
//    sounds/syllables/syllable-تا.mp3
//    sounds/syllables/syllable-دا.mp3
//    sounds/syllables/syllable-زا.mp3
//    sounds/syllables/syllable-خا.mp3
//
//  ترکیب دو حرف (۹ فایل — مثال ز + ا):
//    sounds/combine/combine-م-ا.mp3  (می‌خواند: «م + ا»)
//    sounds/combine/combine-ب-ا.mp3
//    sounds/combine/combine-ن-ا.mp3
//    sounds/combine/combine-ر-ا.mp3
//    sounds/combine/combine-س-ا.mp3
//    sounds/combine/combine-ت-ا.mp3
//    sounds/combine/combine-د-ا.mp3
//    sounds/combine/combine-ز-ا.mp3
//    sounds/combine/combine-خ-ا.mp3
//
//  کلمات (۴۴ فایل یونیک — اسم فایل = خود کلمه، صفر تکرار بین ایستگاه‌ها):
//    ایستگاه ۱۷: word-آب.mp3، word-بابا.mp3، word-نان.mp3، word-باد.mp3، word-در.mp3، word-سر.mp3، word-خر.mp3، word-بز.mp3، word-نام.mp3، word-ابر.mp3، word-من.mp3
//    ایستگاه ۱۸: word-مادر.mp3، word-برادر.mp3، word-دختر.mp3، word-باران.mp3، word-مار.mp3، word-درخت.mp3، word-آسمان.mp3، word-خزان.mp3، word-انار.mp3، word-ماست.mp3، word-خرما.mp3
//    ایستگاه ۱۹: word-خرس.mp3، word-اسب.mp3، word-سبز.mp3، word-سرخ.mp3، word-زرد.mp3، word-مداد.mp3، word-درس.mp3، word-سبد.mp3، word-تمبر.mp3، word-تاب.mp3، word-ساز.mp3، word-تار.mp3
//    ایستگاه ۲۰: word-زن.mp3، word-مرد.mp3، word-دست.mp3، word-راز.mp3، word-دبستان.mp3، word-درست.mp3، word-آسان.mp3، word-داستان.mp3، word-دندان.mp3، word-نترس.mp3
//
//  تشویق (۴ فایل):
//    sounds/praise/praise-آفرین.mp3
//    sounds/praise/praise-عالی-بود.mp3
//    sounds/praise/praise-درست-خوندی.mp3
//    sounds/praise/praise-فوق‌العاده‌ای.mp3
//
//  راهنما:
//    sounds/guide/try-again.mp3          (یک بار دیگه امتحان کن)
//    sounds/guide/station-done.mp3       (آفرین! ایستگاه تموم شد)
//    sounds/guide/train-move.mp3         (سو شو! قطار داره حرکت می‌کنه)
//
//  دستور هر نوع بازی (۵ فایل):
//    sounds/instructions/instruction-letter-pick.mp3
//    sounds/instructions/instruction-combine.mp3
//    sounds/instructions/instruction-syllable-pick.mp3
//    sounds/instructions/instruction-build.mp3
//    sounds/instructions/instruction-word-read.mp3
//
//  معرفی هر ایستگاه (۲۰ فایل):
//    sounds/stations/station-1-intro.mp3 ... station-20-intro.mp3
//
//  افکت‌ها (۶ فایل — اگر نباشند، سنتز WebAudio پخش می‌شود):
//    sounds/effects/effect-cheer.mp3
//    sounds/effects/effect-pop.mp3
//    sounds/effects/effect-choo.mp3
//    sounds/effects/effect-horn.mp3      (بوق قطار: آخر هر ایستگاه)
//    sounds/effects/effect-click.mp3
//    sounds/effects/effect-star.mp3
// ─────────────────────────────────────────────
// کافیست فایل mp3 را دقیقاً با همین اسم در پوشه درست بگذاری.
// اگر فایلی نباشد، بازی خودکار با صدای TTS می‌خواند (بدون خطا).

export const letterSound = (ch) => `/sounds/letters/letter-${ch}.mp3`;
export const syllableSound = (syl) => `/sounds/syllables/syllable-${syl}.mp3`;
export const combineSound = (a, b) => `/sounds/combine/combine-${a}-${b}.mp3`;
export const wordSound = (w) => `/sounds/words/word-${w}.mp3`;
export const stationSound = (n) => `/sounds/stations/station-${n}-intro.mp3`;

export const PRAISE_FILES = [
  '/sounds/praise/praise-آفرین.mp3',
  '/sounds/praise/praise-عالی-بود.mp3',
  '/sounds/praise/praise-درست-خوندی.mp3',
  '/sounds/praise/praise-فوق‌العاده‌ای.mp3'
];
export const TRY_SOUND = '/sounds/guide/try-again.mp3';
export const DONE_SOUND = '/sounds/guide/station-done.mp3';
export const TRAIN_SOUND = '/sounds/guide/train-move.mp3';

const fileCache = new Map(); // path -> true(موجود) | false(ناموجود)

async function fileExists(path) {
  if (fileCache.has(path)) return fileCache.get(path);
  try {
    const res = await fetch(path, { method: 'HEAD' });
    const ok = res.ok;
    fileCache.set(path, ok);
    return ok;
  } catch {
    fileCache.set(path, false);
    return false;
  }
}

let currentAudio = null;

function stopCurrent() {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = null;
  } catch { /* ignore */ }
  try {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } catch { /* ignore */ }
}

/** پخش یک فایل صوتی؛ true اگر پخش شد */
async function playFile(path) {
  try {
    const ok = await fileExists(path);
    if (!ok) return false;
    stopCurrent();
    await new Promise((resolve, reject) => {
      const el = new Audio(path);
      currentAudio = el;
      el.onended = () => resolve(true);
      el.onerror = () => reject(new Error('audio error'));
      const p = el.play();
      if (p && p.catch) p.catch(() => reject(new Error('play blocked')));
    });
    return true;
  } catch {
    return false;
  }
}

// ── سنتز WebAudio (fallback افکت‌ها) ──
let audioCtx = null;

function actx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

function tone(freq, start, dur, type = 'sine', vol = 0.22) {
  try {
    const c = actx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.05);
  } catch { /* ignore */ }
}

function synthCheer() {
  tone(523, 0, 0.18);
  tone(659, 0.12, 0.18);
  tone(784, 0.24, 0.2);
  tone(1047, 0.36, 0.4);
}
function synthPop() {
  tone(700, 0, 0.1, 'triangle', 0.18);
}
function synthChoo() {
  tone(392, 0, 0.25, 'triangle', 0.2);
  tone(523, 0.2, 0.35, 'triangle', 0.2);
}

/** بوق قطار: «پووو-پووو» دوتایی بم — مثل قطار واقعی */
function synthHorn() {
  // بوق اول: دو فرکانس بم هم‌زمان (فایف قطار)
  tone(311, 0, 0.55, 'sawtooth', 0.12);
  tone(370, 0, 0.55, 'sawtooth', 0.12);
  // بوق دوم کوتاه‌تر و کمی زیرتر
  tone(311, 0.65, 0.4, 'sawtooth', 0.12);
  tone(392, 0.65, 0.4, 'sawtooth', 0.1);
}

export async function cheer() {
  const played = await playFile('/sounds/effects/effect-cheer.mp3');
  if (!played) synthCheer();
}
export async function pop() {
  const played = await playFile('/sounds/effects/effect-pop.mp3');
  if (!played) synthPop();
}
export async function choo() {
  const played = await playFile('/sounds/effects/effect-choo.mp3');
  if (!played) synthChoo();
}

/** بوق بلند قطار آخر مرحله — اول فایل effect-horn.mp3، وگرنه سنتز */
export async function horn() {
  const played = await playFile('/sounds/effects/effect-horn.mp3');
  if (!played) synthHorn();
}

/** گفتار فارسی (TTS خام) */
export function speak(text, speed = 'normal') {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fa-IR';
    u.rate = speed === 'slow' ? 0.6 : speed === 'fast' ? 1.1 : 0.85;
    u.pitch = 1.15;
    const voices = window.speechSynthesis.getVoices();
    const fa = voices.find((v) => v.lang && v.lang.startsWith('fa'));
    if (fa) u.voice = fa;
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

/**
 * هوشمند: اول فایل محلی، اگر نبود TTS
 * @param {string} text متن برای TTS
 * @param {string|null} soundFile مسیر فایل mp3 (مثل syllableSound('زا'))
 * @param {string} speed slow|normal|fast
 */
export async function say(text, soundFile = null, speed = 'normal') {
  stopCurrent();
  if (soundFile) {
    const played = await playFile(soundFile);
    if (played) return;
  }
  speak(text, speed);
}

/** تشویق تصادفی: فایل praise دقیقِ همان جمله، وگرنه TTS */
export async function praiseSay(praiseText, praiseIndex, speed = 'normal') {
  const f = PRAISE_FILES[praiseIndex % PRAISE_FILES.length];
  await say(praiseText, f, speed);
}

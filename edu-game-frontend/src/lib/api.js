import { localStation, localQuestions } from './data.js';
import { ASSET } from './paths.js';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** سازگار با سافاری قدیمی که AbortSignal.timeout ندارد */
function timeoutSignal(ms) {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
  } catch { /* خطا مهم نیست */ }
  try {
    const c = new AbortController();
    setTimeout(() => {
      try { c.abort(); } catch { /* خطا مهم نیست */ }
    }, ms);
    return c.signal;
  } catch {
    return undefined;
  }
}

/** آدرس‌های بک‌اند مطلق‌اند (/sounds/...)؛ زیر ساب‌مسیر سایت نرمالشان می‌کنیم */
function fixAssets(list) {
  return (list || []).map((q) => {
    const out = { ...q };
    for (const k of ['sound', 'resultSound', 'image']) {
      if (typeof out[k] === 'string' && out[k].startsWith('/')) out[k] = ASSET(out[k]);
    }
    return out;
  });
}

/** ایستگاه ۱..۲۰ — اول بک‌اند، اگر نبود محلی */
export async function fetchStation(station, count = 4) {
  try {
    const res = await fetch(`${BASE}/api/game/station/${station}?count=${count}`, {
      signal: timeoutSignal(2500)
    });
    if (!res.ok) throw new Error('api');
    const json = await res.json();
    if (json?.questions?.length) return fixAssets(json.questions);
    throw new Error('empty');
  } catch {
    return localStation(station, count);
  }
}

/** سازگاری با مرحله ۱..۵ */
export async function fetchStage(stage, count = 4) {
  try {
    const res = await fetch(`${BASE}/api/game/stage/${stage}?count=${count}`, {
      signal: timeoutSignal(2500)
    });
    if (!res.ok) throw new Error('api');
    const json = await res.json();
    if (json?.questions?.length) return fixAssets(json.questions);
    throw new Error('empty');
  } catch {
    return localQuestions(stage, count);
  }
}

export async function saveProgress(childId, stage, score, completed) {
  try {
    await fetch(`${BASE}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: childId, stage, score, completed })
    });
  } catch { /* آفلاین: فقط محلی */ }
  try {
    const key = `train-progress-${childId}`;
    const prev = JSON.parse(localStorage.getItem(key) || '{}');
    prev[stage] = { score, completed };
    localStorage.setItem(key, JSON.stringify(prev));
  } catch { /* خطا مهم نیست */ }
}

export async function saveAnswer(childId, questionId, stage, isCorrect) {
  try {
    await fetch(`${BASE}/api/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id: childId,
        question_id: questionId,
        stage,
        is_correct: isCorrect
      })
    });
  } catch { /* خطا مهم نیست */ }
}

export function loadLocalProgress(childId) {
  try {
    return JSON.parse(localStorage.getItem(`train-progress-${childId}`) || '{}');
  } catch {
    return {};
  }
}

/** پاک‌کردن کامل تاریخچه: سرور + محلی */
export async function clearHistory(childId) {
  try {
    await fetch(`${BASE}/api/history/${encodeURIComponent(childId)}`, {
      method: 'DELETE',
      signal: timeoutSignal(3000)
    });
  } catch { /* آفلاین: فقط محلی پاک می‌شود */ }
  try {
    localStorage.removeItem(`train-progress-${childId}`);
  } catch { /* خطا مهم نیست */ }
}

// 📲 کمک‌کننده نصب PWA — اندروید (beforeinstallprompt) + iOS (دفترچه راهنما)

let deferredPrompt = null;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => {
    try { fn(state()); } catch { /* ignore */ }
  });
}

export function state() {
  const standalone =
    (typeof window !== 'undefined' &&
      (window.matchMedia?.('(display-mode: standalone)').matches ||
        window.navigator?.standalone === true)) ||
    false;
  const ios =
    typeof navigator !== 'undefined' &&
    (/iphone|ipad|ipod/i.test(navigator.userAgent || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  return {
    canInstall: !!deferredPrompt,
    isIOS: ios,
    isStandalone: standalone,
    showIOSGuide: ios && !standalone
  };
}

export function onPWAChange(fn) {
  listeners.add(fn);
  try { fn(state()); } catch { /* ignore */ }
  return () => listeners.delete(fn);
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

/** فراخوانی دیالوگ نصب اندروید؛ true اگر دیالوگ باز شد */
export async function promptInstall() {
  try {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => null);
    deferredPrompt = null;
    notify();
    return !!choice;
  } catch {
    return false;
  }
}

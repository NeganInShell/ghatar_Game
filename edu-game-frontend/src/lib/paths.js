// 🛤️ آدرس‌دهی دارایی‌ها با احترام به base سایت
// لوکال: BASE_URL = '/' → «/images/...»
// گیت‌هاب پیجز: BASE_URL = '/ghatar_Game/' → «/ghatar_Game/images/...»
const BASE = import.meta.env.BASE_URL || '/';

/** «/sounds/x.mp3» یا «sounds/x.mp3» را به آدرس درست زیر base تبدیل می‌کند */
export function ASSET(p) {
  return `${BASE}${String(p).replace(/^\/+/, '')}`;
}

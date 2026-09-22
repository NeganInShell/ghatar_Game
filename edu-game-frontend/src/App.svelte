<script>
  import { cheer, pop, choo, horn, say as saySmart, praiseSay, letterSound, syllableSound, combineSound, wordSound, stationSound, TRY_SOUND, DONE_SOUND, TRAIN_SOUND } from './lib/audio.js';
  import { fetchStation, saveProgress, saveAnswer, loadLocalProgress, clearHistory } from './lib/api.js';
  import { PRAISE, TRY_AGAIN, STATIONS, stationImage, wordImage } from './lib/data.js';
  import { onPWAChange, promptInstall } from './lib/pwa.js';
  import { ASSET } from './lib/paths.js';

  let screen = $state('home');
  let station = $state(1);
  let questions = $state([]);
  let qi = $state(0);
  let loading = $state(false);
  let stars = $state(0);
  let feedback = $state(null);
  let celebrate = $state(null);
  let speed = $state('normal');
  let theme = $state('light');
  let childId = $state('دوست من');
  let progress = $state({});
  let picked = $state(null);
  let combinePlay = $state(false);
  let combineShown = $state(false);
  let built = $state([]);
  let qkey = $state(0);
  let praiseIdx = $state(0);

  let q = $derived(questions[qi]);
  let cfg = $derived(STATIONS.find((s) => s.n === station));
  let doneCount = $derived(Object.values(progress).filter((p) => p?.completed).length);
  let totalStars = $derived(
    Object.values(progress).reduce((sum, p) => sum + (Number(p?.score) || 0), 0)
  );
  let confirmClear = $state(false);
  let clearing = $state(false);
  let trainPass = $state(false);
  let pwa = $state({ canInstall: false, isIOS: false, isStandalone: false, showIOSGuide: false });
  let online = $state(true);
  let swUpdate = $state(false);

  function delay() {
    return speed === 'slow' ? 2200 : speed === 'fast' ? 900 : 1500;
  }

  // تم + اسم — فقط در مرورگر
  if (typeof localStorage !== 'undefined') {    const savedTheme = localStorage.getItem('train-theme');
    const savedChild = localStorage.getItem('train-child');
    const savedSpeed = localStorage.getItem('train-speed');
    if (savedChild) childId = savedChild;
    if (savedSpeed === 'slow' || savedSpeed === 'fast' || savedSpeed === 'normal') speed = savedSpeed;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      theme = savedTheme;
    } else if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
    refreshProgress();
  }

  function refreshProgress() {
    try {
      progress = loadLocalProgress(childId || 'دوست من');
    } catch { progress = {}; }
  }

  function applyTheme() {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('train-theme', theme);
    } catch { /* خطا مهم نیست */ }
  }
  $effect(() => {
    applyTheme();
  });
  $effect(() => {
    try {
      localStorage.setItem('train-child', childId);
      localStorage.setItem('train-speed', speed);
    } catch { /* خطا مهم نیست */ }
  });

  // 📲 نصب + وضعیت شبکه + آپدیت سرویس‌ورکر — فقط مرورگر
  if (typeof window !== 'undefined') {
    onPWAChange((s) => { pwa = s; });
    try {
      online = navigator.onLine !== false;
      window.addEventListener('online', () => { online = true; });
      window.addEventListener('offline', () => { online = false; });
      window.addEventListener('pwa:update', () => { swUpdate = true; });
    } catch { /* خطا مهم نیست */ }
  }

  async function installApp() {
    const opened = await promptInstall();
    if (!opened) void pop();
  }

  function reloadApp() {
    try { window.location.reload(); } catch { /* خطا مهم نیست */ }
  }

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    void pop();
  }

  async function speakQ(text, file) {
    await saySmart(text, file ?? null, speed);
  }

  function startMap() {
    void pop();
    refreshProgress();
    screen = 'map';
    void speakQ('سو شو! قطار داره حرکت می‌کنه', TRAIN_SOUND);
  }

  async function startStation(n) {
    station = n;
    qi = 0;
    stars = 0;
    feedback = null;
    celebrate = null;
    trainPass = false;
    picked = null;
    built = [];
    combinePlay = false;
    combineShown = false;
    loading = true;
    screen = 'game';
    qkey += 1;
    await choo();
    questions = await fetchStation(n, 4);
    loading = false;
    qkey += 1;
    const first = questions[0];
    if (first) {
      await speakQ(`ایستگاه ${n}`, stationSound(n));
      setTimeout(() => announce(first), 500);
    }
  }

  function announce(item) {
    if (!item) return;
    if (item.instruction) void speakQ(item.instruction, null);
    const t = setTimeout(() => {
      if (item.prompt) void speakQ(item.prompt, item.sound ?? syllableSound(item.prompt));
      else if (item.word) void speakQ(item.word, item.sound ?? wordSound(item.word));
      else if (item.result && item.type === 'combine') void speakQ(`${item.a} و ${item.b}`, item.sound ?? combineSound(item.a, item.b));
      else if (item.result) void speakQ(item.result, item.sound ?? syllableSound(item.result));
      clearTimeout(t);
    }, 700);
  }

  function nextPraise() {
    praiseIdx = (praiseIdx + 1) % PRAISE.length;
    return { text: PRAISE[praiseIdx], idx: praiseIdx };
  }

  async function correct(item) {
    stars += 1;
    await cheer();
    const p = nextPraise();
    feedback = { kind: 'good', text: p.text };
    await praiseSay(p.text, p.idx, speed);
    try {
      await saveAnswer(childId, item?.id ?? qi, station, true);
    } catch { /* خطا مهم نیست */ }
    setTimeout(next, delay());
  }

  async function wrong(item) {
    await pop();
    feedback = { kind: 'try', text: TRY_AGAIN };
    await speakQ('یک بار دیگه امتحان کن', TRY_SOUND);
    try {
      await saveAnswer(childId, item?.id ?? qi, station, false);
    } catch { /* خطا مهم نیست */ }
    picked = null;
    built = [];
  }

  function next() {
    feedback = null;
    picked = null;
    built = [];
    combinePlay = false;
    combineShown = false;
    qkey += 1;
    if (qi + 1 >= questions.length) {
      void finishStation();
    } else {
      qi += 1;
      announce(questions[qi]);
    }
  }

  async function finishStation() {
    try {
      await saveProgress(childId, station, stars, true);
    } catch { /* خطا مهم نیست */ }
    refreshProgress();
    // 🚂 قطار تندرو با بوق رد می‌شود، بعد جشن
    trainPass = true;
    try {
      await horn();
    } catch { /* خطا مهم نیست */ }
    await new Promise((r) => setTimeout(r, 2100));
    trainPass = false;
    const p = nextPraise();
    celebrate = p.text;
    await cheer();
    await speakQ('آفرین! ایستگاه تموم شد', DONE_SOUND);
  }

  function closeCelebrate() {
    celebrate = null;
    screen = 'map';
    refreshProgress();
  }

  function goNextStation() {
    celebrate = null;
    if (station < 20) void startStation(station + 1);
    else closeCelebrate();
  }

  function choose(opt) {
    if (!q || feedback?.kind === 'good') return;
    picked = opt;
    if (opt === q.correct) void correct(q);
    else void wrong(q);
  }

  async function playCombine() {
    if (!q) return;
    combinePlay = true;
    await pop();
    await speakQ(`${q.a} و ${q.b}`, q.sound ?? combineSound(q.a, q.b));
    setTimeout(async () => {
      combineShown = true;
      await cheer();
      await speakQ(q.result, q.resultSound ?? syllableSound(q.result));
      feedback = { kind: 'good', text: `«${q.result}» 🎉` };
      try {
        await saveAnswer(childId, q.id, station, true);
      } catch { /* خطا مهم نیست */ }
      stars += 1;
    }, speed === 'slow' ? 1400 : speed === 'fast' ? 600 : 900);
  }

  async function tapCard(c) {
    if (!q || feedback?.kind === 'good' || built.length >= 2) return;
    await pop();
    built = [...built, c];
    await speakQ(c, letterSound(c));
    if (built.length === 2) {
      const a = q.parts?.[0];
      const b = q.parts?.[1];
      if (built.join('') === q.result || (built[0] === a && built[1] === b)) {
        await correct(q);
      } else {
        setTimeout(() => void wrong(q), 500);
      }
    }
  }

  function clearBuilt() {
    built = [];
    picked = null;
    void pop();
  }

  function repeatQ() {
    if (!q) return;
    void pop();
    announce(q);
  }

  function goHome() {
    void pop();
    confirmClear = false;
    refreshProgress();
    screen = 'home';
  }

  function replay() {
    if (screen === 'game') void startStation(station);
  }

  function hearPrompt() {
    if (!q) return;
    if (q.prompt) void speakQ(q.prompt, q.sound ?? syllableSound(q.prompt));
    else if (q.word) void speakQ(q.word, q.sound ?? wordSound(q.word));
  }

  function askClear() {
    confirmClear = true;
    void pop();
  }

  function cancelClear() {
    confirmClear = false;
    void pop();
  }

  async function confirmClearHistory() {
    if (clearing) return;
    clearing = true;
    try {
      await clearHistory(childId || 'دوست من');
    } catch { /* خطا مهم نیست */ }
    progress = {};
    stars = 0;
    confirmClear = false;
    clearing = false;
    await cheer();
    await speakQ('تاریخچه پاک شد! از اول شروع می‌کنیم 🌱', null);
  }

  function stationStars(n) {
    const p = progress[n];
    if (!p || !p.completed) return null;
    return Number(p.score) || 0;
  }
</script>

<svelte:head>
  <title>قطار کلمه‌ها 🚂 | {doneCount} از ۲۰ ایستگاه</title>
</svelte:head>

<div class="topbar">
  <button type="button" class="icon-btn" onclick={goHome} aria-label="خانه">🏠</button>
  <div class="stars" aria-live="polite">⭐ {stars}</div>
  <button type="button" class="icon-btn" onclick={repeatQ} aria-label="تکرار صدا">🔊</button>
  <button type="button" class="icon-btn" onclick={replay} aria-label="تکرار تمرین">🔁</button>
  <button type="button" class="icon-btn" onclick={toggleTheme} aria-label={theme === 'light' ? 'حالت تیره' : 'حالت روشن'}>{theme === 'light' ? '🌙' : '☀️'}</button>
</div>

{#if swUpdate}
  <div class="pwa-banner update" role="status">
    <span>نسخه جدید بازی اومد! 🎉</span>
    <button type="button" class="pwa-btn" onclick={reloadApp}>به‌روز کن 🔄</button>
  </div>
{/if}
{#if !online}
  <div class="pwa-banner offline" role="status">آفلاین هستی ولی بازی کار می‌کنه ✅🚂</div>
{/if}

{#if screen === 'home'}
  <div class="card">
    <img class="hero-img" src={ASSET("images/train.svg")} alt="قطار کودکانه بازی" />
    <h1 class="title">قطار کلمه‌ها</h1>
    <p class="subtitle">بازی ترکیب‌خوانی برای کلاس اولی‌های گل 🌸</p>
    <div class="rail" aria-hidden="true"></div>

    <label class="hint" for="name">اسم قشنگت چیه؟</label>
    <input id="name" class="name-input" bind:value={childId} placeholder="مثلاً سارا" maxlength="20" autocomplete="off" />

    <div class="instruction">🔊 هر جا بلندگو دیدی بزن تا برات بخونم!</div>

    <button type="button" class="btn green" onclick={startMap}>بزن بریم! 🚂</button>

    <div class="score-card" role="status" aria-live="polite">
      <div><b>⭐ مجموع ستاره‌ها: {totalStars}</b></div>
      <div class="hint">✅ {doneCount} از ۲۰ ایستگاه تموم شده</div>
      {#if doneCount > 0}
        <div class="mini-grid">
          {#each STATIONS as s (s.n)}
            {@const sc = stationStars(s.n)}
            {#if sc !== null}
              <span class="mini-star" title={`ایستگاه ${s.n}: ${sc} ستاره`}>{s.n}⭐{sc}</span>
            {/if}
          {/each}
        </div>
      {:else}
        <div class="hint">هنوز ستاره‌ای نگرفتی — قطار منتظرته! 🚂</div>
      {/if}
    </div>

    {#if !confirmClear}
      <button type="button" class="btn danger-ghost" onclick={askClear} aria-label="پاک کردن تاریخچه بازی">🧹 پاک کردن تاریخچه</button>
    {:else}
      <div class="clear-zone" role="alert">
        <div><b>همه ستاره‌ها و تاریخچه «{childId}» پاک بشه؟ 🧹</b></div>
        <div class="clear-row">
          <button type="button" class="btn danger" onclick={confirmClearHistory} disabled={clearing}>{clearing ? 'صبر کن... 💨' : 'بله، پاک کن 🧹'}</button>
          <button type="button" class="btn secondary" onclick={cancelClear}>بیخیال ❌</button>
        </div>
      </div>
    {/if}

    <div class="speed-row" role="group" aria-label="سرعت بازی">
      <button type="button" class:on={speed === 'slow'} onclick={() => (speed = 'slow')}>🐢 آرام</button>
      <button type="button" class:on={speed === 'normal'} onclick={() => (speed = 'normal')}>🚶 معمولی</button>
      <button type="button" class:on={speed === 'fast'} onclick={() => (speed = 'fast')}>🐇 سریع</button>
    </div>
    <p class="hint">حروف: ا، ب، د، ن، ر، س، ت، ز، م، خ — بدون تایمر و بدون استرس 💛</p>
    <p class="theme-hint">۲۰ ایستگاه از ساده به سخت + حالت شب 🌙</p>

    {#if pwa.canInstall}
      <div class="install-card" role="group" aria-label="نصب بازی">
        <div><b>📲 بازی رو نصب کن تا آفلاین هم داشته باشیش!</b></div>
        <button type="button" class="btn green" onclick={installApp}>نصب قطار کلمه‌ها 📲</button>
      </div>
    {:else if pwa.showIOSGuide}
      <div class="install-card ios" role="note" aria-label="راهنمای نصب آیفون">
        <div><b>📲 نصب روی آیفون:</b></div>
        <div class="hint">دکمه <b>Share ⎙</b> سافاری → <b>Add to Home Screen</b> → <b>Add</b> ✅</div>
      </div>
    {/if}
  </div>
{:else if screen === 'map'}
  <div class="card">
    <img class="mascot-img" src={ASSET("images/mascot-fox.svg")} alt="روباه مهربان راهنما" />
    <h1 class="title" style="font-size:2rem;">سلام {childId}! 👋</h1>
    <p class="subtitle">سوار قطار شو، {doneCount} از ۲۰ ایستگاه رو رفتی! ⭐ {totalStars} 🚂</p>
    <div class="rail" aria-hidden="true"></div>
    <div class="stations">
      {#each STATIONS as s (s.n)}
        {@const st = progress[s.n]}
        {@const sc = stationStars(s.n)}
        <button type="button" class="station {st?.completed ? 'done' : ''} {s.n === station ? 'active' : ''}" onclick={() => void startStation(s.n)} aria-label={`ایستگاه ${s.n}: ${s.title}${sc !== null ? `، ${sc} ستاره` : ''}`}>
          <img class="thumb" src={stationImage(s.n)} alt="" loading="lazy" />
          <span class="info"><b>ایستگاه {s.n}: {s.title}</b><span>{s.desc}</span>
            {#if sc !== null}
              <span class="star-badge" aria-hidden="false">⭐ {sc} از ۴</span>
            {:else}
              <span class="star-badge empty">☆ هنوز بازی نشده</span>
            {/if}
          </span>
          <span style="font-size:1.6rem;" aria-hidden="true">{st?.completed ? '✅' : '▶️'}</span>
        </button>
      {/each}
    </div>
    <p class="hint">هر ایستگاه فقط ۴ تا سؤال کوتاه داره 🌱</p>
  </div>
{:else}
  {#key qkey}
  <div class="card">
    {#if loading}
      <img class="hero-img" src={ASSET("images/train.svg")} alt="قطار در حال آمدن" />
      <p class="subtitle">قطار داره میاد... صبر کن! 💨</p>
    {:else if q}
      <p class="subtitle">🚂 ایستگاه {station} ({cfg?.title}) — سؤال {qi + 1} از {questions.length}</p>
      <div class="dots" aria-hidden="true">
        {#each questions as _, i (i)}
          <span>{i < qi ? '⭐' : i === qi ? '🔵' : '⚪'}</span>
        {/each}
      </div>

      <div class="instruction">
        <span>{q.instruction}</span>
        <button type="button" class="icon-btn" style="width:48px;height:48px;font-size:1.2rem;" onclick={repeatQ} aria-label="پخش دوباره دستور">🔊</button>
      </div>

      {#if q.type === 'letter-pick'}
        <div class="big-letter" aria-live="polite">{q.prompt}</div>
        <div class="options">
          {#each q.options as opt (opt)}
            <button
              type="button"
              class="opt {picked === opt && opt === q.correct ? 'correct' : picked === opt ? 'wrong' : ''}"
              onclick={() => choose(opt)}
              disabled={feedback?.kind === 'good'}
              aria-label={`حرف ${opt}`}
            >{opt}</button>
          {/each}
        </div>
      {:else if q.type === 'combine'}
        <div class="combine-row {combinePlay ? 'play' : ''}">
          <span class="mini left">{q.a}</span>
          <span class="plus" aria-hidden="true">➕</span>
          <span class="mini right">{q.b}</span>
        </div>
        {#if !combineShown}
          <button type="button" class="btn secondary" onclick={playCombine}>بچسبون! 🧲</button>
        {:else}
          <div class="result-pop" aria-live="polite">{q.result}</div>
          <div><button type="button" class="btn green" onclick={next}>آفرین! بعدی ⏭️</button></div>
        {/if}
      {:else if q.type === 'syllable-pick'}
        <div style="font-size:1.2rem;">🔊 خوب گوش کن بعد انتخاب کن!</div>
        <button type="button" class="btn secondary" onclick={hearPrompt}>بشنو 🔊</button>
        <div class="options">
          {#each q.options as opt (opt)}
            <button
              type="button"
              class="opt {picked === opt && opt === q.correct ? 'correct' : picked === opt ? 'wrong' : ''}"
              style="font-size:2.4rem;"
              onclick={() => choose(opt)}
              disabled={feedback?.kind === 'good'}
              aria-label={`هجای ${opt}`}
            >{opt}</button>
          {/each}
        </div>
      {:else if q.type === 'build'}
        <div class="big-syllable">؟ {q.result} ؟</div>
        <div class="built" aria-live="polite">
          {#if built.length === 0}
            <span style="font-size:1.2rem;color:var(--faint);">کارت‌ها رو بزن تا بیان اینجا 👇</span>
          {:else}
            {#each built as b, i (`${i}-${b}`)}<span>{b}</span>{/each}
          {/if}
        </div>
        <div class="pool">
          {#each q.pool as c (c)}
            <button type="button" class="opt" style="font-size:2.6rem;min-width:80px;min-height:80px;" onclick={() => void tapCard(c)} aria-label={`کارت ${c}`}>{c}</button>
          {/each}
        </div>
        <div><button type="button" class="btn secondary" style="font-size:1.1rem;padding:10px 22px;min-height:48px;" onclick={clearBuilt}>پاک کن 🧹</button></div>
      {:else if q.type === 'word-read'}
        <img class="word-img" src={q.image ?? wordImage(q.word)} alt={`تصویر ${q.word}`} />
        <div><button type="button" class="btn secondary" style="font-size:1.2rem;" onclick={hearPrompt}>🔊 گوش بده</button></div>
        <div class="word-text">{q.word}</div>
        <div style="font-size:1.2rem;">کلمه «{q.word}» کدومه؟ 👆</div>
        <div class="options">
          {#each q.options as opt (opt)}
            <button
              type="button"
              class="opt {picked === opt && opt === q.correct ? 'correct' : picked === opt ? 'wrong' : ''}"
              style="font-size:2rem;"
              onclick={() => choose(opt)}
              disabled={feedback?.kind === 'good'}
              aria-label={`کلمه ${opt}`}
            >{opt}</button>
          {/each}
        </div>
      {/if}

      {#if feedback}
        <div class="feedback {feedback.kind === 'good' ? 'good' : 'try'}" role="status">{feedback.text}</div>
      {/if}
    {/if}
  </div>
  {/key}
{/if}

{#if trainPass}
  <div class="train-pass" role="status" aria-label="قطار با سرعت رد می‌شود">
    <div class="tp-smoke" aria-hidden="true"><span>💨</span><span>💨</span><span>💨</span></div>
    <img class="tp-train" src={ASSET("images/train.svg")} alt="" />
    <div class="tp-text">بوق بوق! 🚂💨</div>
    <div class="tp-track" aria-hidden="true"></div>
  </div>
{/if}

{#if celebrate}
  <div class="celebrate">
    <div class="celebrate-inner" role="dialog" aria-modal="true" aria-label="پایان ایستگاه">
      <span class="confetti" style="right:12%;animation-delay:0s;" aria-hidden="true">⭐</span>
      <span class="confetti" style="right:32%;animation-delay:0.5s;" aria-hidden="true">💖</span>
      <span class="confetti" style="right:55%;animation-delay:0.9s;" aria-hidden="true">🎉</span>
      <span class="confetti" style="right:75%;animation-delay:0.3s;" aria-hidden="true">🌈</span>
      <span class="emojis" aria-hidden="true">⭐💖🎉</span>
      <br />
      <span>{celebrate}</span>
      <br />
      <span style="font-size:1.2rem;color:var(--muted);">ایستگاه {station} تموم شد! ⭐ {stars} از ۴</span>
      <br />
      <span class="celebrate-row">
        {#if station < 20}
          <button type="button" class="btn green" onclick={goNextStation}>ایستگاه بعدی ⏭️</button>
        {/if}
        <button type="button" class="btn secondary" onclick={closeCelebrate}>نقشه 🗺️</button>
      </span>
    </div>
  </div>
{/if}

// "Will you be mine?" — a cat asks, and there is only one correct answer.
// The No button dodges (mouse, touch, and keyboard), the Yes button grows,
// and saying yes bursts hearts. Accessible + reduced-motion aware.

const card      = document.querySelector('.card');
const catAsk    = document.getElementById('cat-ask');
const catYes    = document.getElementById('cat-yes');
const question  = document.getElementById('question');
const subtitle  = document.getElementById('subtitle');
const btnGroup  = document.getElementById('btn-group');
const yesBtn    = document.getElementById('yes-btn');
const noBtn     = document.getElementById('no-btn');
const again     = document.getElementById('again');
const hearts    = document.getElementById('hearts');
const soundBtn  = document.getElementById('sound-toggle');

// Bail out gracefully if the markup ever changes out from under us.
if (!yesBtn || !noBtn) throw new Error('love: required buttons missing');

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ *
 * Escalating "No"
 * ------------------------------------------------------------------ */
const NO_PHRASES = [
  'No',
  'Are you sure?',
  'Think again 🥺',
  'Last chance!',
  'Pretty please? 🙏',
  'Just say Yes!',
  'Meow?',
];
let step = 0;
let won = false;

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

// Current animated `translate` (interpolated mid-transition), in px.
function currentTranslate() {
  const v = getComputedStyle(noBtn).translate;
  if (!v || v === 'none') return { x: 0, y: 0 };
  const [x, y] = v.split(' ');
  return { x: parseFloat(x) || 0, y: parseFloat(y ?? x) || 0 };
}

// Move No to a fresh random spot, always keeping it fully on screen and reachable.
// We work in CENTERS: scaling is centred, so the natural centre is invariant to
// `--shrink`, and subtracting the live `translate` from the current rect centre
// yields the transform-free home — correct even mid-transition and even as the
// label ("Just say Yes!") makes the button wider than the "No" it started as.
function dodge() {
  const margin = 26;
  const r = noBtn.getBoundingClientRect();
  const tr = currentTranslate();
  const cx0 = r.left + r.width / 2 - tr.x;      // natural centre (translate-free, scale-invariant)
  const cy0 = r.top + r.height / 2 - tr.y;

  const shrink = clamp(1 - step * 0.085, 0.6, 1);
  const w = noBtn.offsetWidth * shrink;         // effective size (offsetWidth ignores transforms)
  const h = noBtn.offsetHeight * shrink;

  const minCx = margin + w / 2, maxCx = window.innerWidth - margin - w / 2;
  const minCy = margin + h / 2, maxCy = window.innerHeight - margin - h / 2;
  const cx = minCx + Math.random() * Math.max(0, maxCx - minCx);
  const cy = minCy + Math.random() * Math.max(0, maxCy - minCy);

  noBtn.style.translate = `${Math.round(cx - cx0)}px ${Math.round(cy - cy0)}px`;
}

function escalate() {
  step = Math.min(step + 1, NO_PHRASES.length - 1);
  noBtn.textContent = NO_PHRASES[step];
  // Yes grows, No shrinks — the deck stacks itself. Tuned so the 4-step arc
  // still reaches a big-Yes / tiny-No climax on the last phrase.
  yesBtn.style.setProperty('--grow', String(clamp(1 + step * 0.19, 1, 1.9)));
  noBtn.style.setProperty('--shrink', String(clamp(1 - step * 0.085, 0.6, 1)));
}

function taunt(e) {
  if (won) return;
  if (e) e.preventDefault();
  escalate();   // update label + shrink FIRST so dodge() bounds use the new width
  dodge();
  blip();
}

// Hover (mouse/pen) AND tap/keyboard activation both make it flee, so "No"
// is impossible on every input while staying focusable for a11y.
noBtn.addEventListener('pointerenter', taunt);
noBtn.addEventListener('click', taunt);

/* ------------------------------------------------------------------ *
 * Saying yes
 * ------------------------------------------------------------------ */
function win() {
  if (won) return;
  won = true;

  catAsk.classList.remove('is-visible');
  catYes.classList.add('is-visible');
  catYes.currentTime = 0;
  catYes.play?.().catch(() => {});

  question.textContent = "I knew it! You're mine now 😻";
  subtitle.textContent = 'purr-fect decision.';
  card.classList.add('is-won');

  btnGroup.hidden = true;
  again.hidden = false;

  burstHearts();
  chime();
}

yesBtn.addEventListener('click', win);

/* ------------------------------------------------------------------ *
 * Reset — "ask me again"
 * ------------------------------------------------------------------ */
again.addEventListener('click', () => {
  won = false;
  step = 0;

  catYes.classList.remove('is-visible');
  catAsk.classList.add('is-visible');
  catAsk.play?.().catch(() => {});

  question.textContent = 'Will you be mine? 🐾';
  subtitle.textContent = 'asked by a very small, very serious cat';
  card.classList.remove('is-won');

  noBtn.textContent = NO_PHRASES[0];
  noBtn.style.translate = '0px 0px';
  noBtn.style.setProperty('--shrink', '1');
  yesBtn.style.setProperty('--grow', '1');

  btnGroup.hidden = false;
  again.hidden = true;
  yesBtn.focus();
});

/* ------------------------------------------------------------------ *
 * Heart burst (Web Animations API — transform + opacity only)
 * ------------------------------------------------------------------ */
const HEART_GLYPHS = ['💕', '💖', '💗', '😻', '🐾', '❤️'];

function burstHearts() {
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height * 0.4;
  const count = reduce ? 8 : 28;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'heart';
    el.textContent = HEART_GLYPHS[i % HEART_GLYPHS.length];
    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;
    hearts.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const dist  = 120 + Math.random() * 220;
    const dx    = Math.cos(angle) * dist;
    const dy    = Math.sin(angle) * dist - 80; // bias upward, like they float
    const rot   = (Math.random() - 0.5) * 120;
    const scale = 0.7 + Math.random() * 0.9;
    const dur   = reduce ? 500 : 900 + Math.random() * 700;

    el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale}) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
    ).onfinish = () => el.remove();
  }
}

/* ------------------------------------------------------------------ *
 * Tiny sound design (Web Audio) — gesture-gated, user-mutable
 * ------------------------------------------------------------------ */
let audioCtx = null;
let soundOn = true;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx?.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, start, dur, gain = 0.14, type = 'sine') {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function blip() {
  if (!soundOn) return;
  tone(220 + Math.min(step, 8) * 45, 0, 0.14, 0.1, 'triangle'); // rises as it panics
}

function chime() {
  if (!soundOn) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.5, 0.13));
}

soundBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundBtn.setAttribute('aria-pressed', String(soundOn));
  soundBtn.setAttribute('aria-label', soundOn ? 'Mute sound effects' : 'Unmute sound effects');
  soundBtn.title = soundOn ? 'Sound on' : 'Sound off';
  soundBtn.querySelector('span').textContent = soundOn ? '🔊' : '🔇';
  if (soundOn) tone(880, 0, 0.12, 0.1); // little confirmation chirp
});

// Some browsers pause muted autoplay after a tab switch; nudge it back.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    (won ? catYes : catAsk).play?.().catch(() => {});
  }
});

/* ------------------------------------------------------------------ *
 * Recording hook — ONLY when the page is opened with ?record.
 * The live site stays fully manual; the showcase rig drives these.
 * ------------------------------------------------------------------ */
if (new URLSearchParams(location.search).has('record')) {
  const centre = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  soundOn = false; // screencast captures no audio; keep the run silent
  window.loveRec = {
    noCentre: () => centre(noBtn),
    yesCentre: () => centre(yesBtn),
    poke: () => taunt(),   // one dodge + escalation, as if the cursor reached "No"
    yes: () => win(),      // accept → hearts + happy cat
    won: () => won,
  };
}

/* =========================================================
   PERSONALIZE HERE: this is the only part you need to edit
   ========================================================= */
const CONFIG = {
  name: "Bhavneet",           // shows in the big title and the browser tab
  fullName: "Bhavneet Kaur",  // shows on the sketchbook cover
  age: 23,                    // becomes number candles in the bhatura (set to null for plain candles)
  candles: 5,                 // plain candles, only used when age is null (1 to 9)
  from: "Shivam",             // who it's from

  message: `Happy birthday to the person who roasts me the hardest and has my back the fastest.

You've judged my outfits, my playlists and most of my life decisions, and somehow you're still the first person I want to tell everything to. Mostly so we can gossip about it.

This year I hope you get unlimited chole bhature, a sketchbook that never runs out of pages, a badminton rematch, and at least one day where you don't hate on anything. Just one. I believe in you.

Happy 23rd. Love you. Don't make it weird.`,

  // Favourite memories. "doodle" picks a drawing: maths, badminton, jury, food or gossip.
  // You can use a real picture instead: { photo: "photos/court.jpg", title: "...", text: "..." }
  memories: [
    { doodle: "maths", title: "The maths competition", text: "Two brains, one pencil, absolutely no chill." },
    { doodle: "badminton", title: "Badminton", text: "Officially a friendly game. Unofficially, a war." },
    { doodle: "jury", title: "Being on the jury", text: "Finally, somewhere judging people was the actual job." },
    { doodle: "food", title: "Eating everything", text: "Every plan was secretly a food plan." },
    { doodle: "gossip", title: "Gossip sessions", text: "\"Five minutes,\" we said. Three hours later…" },
  ],

  // The awards ceremony. Add, remove or rewrite as many as you like.
  awards: [
    { title: "World's Best Part-Time Hater", why: "Hates my outfits, my music and my life choices. Still picks up every single call." },
    { title: "Fastest Hands at the Chole Bhature Table", why: "Second bhatura gone before anyone else has found the pickle." },
    { title: "Most Likely to Quote Kenny Sebastian at Dinner", why: "Has heard every bit at least four times. Still laughs first." },
    { title: "Sketchbook Hall of Fame", why: "Turns every margin, napkin and receipt into a gallery." },
    { title: "Most Office Reruns Watched Without Blinking", why: "Could recite every episode. Has, at least once, at me." },
  ],

  // Real photos make this page. Put them in a "photos" folder next to
  // index.html and list them here, for example:
  //   { src: "photos/goa.jpg", caption: "Goa, before the sunburn" },
  // The photo section stays hidden while this list is empty.
  photos: [],

  // Leave empty for the built-in music-box "Happy Birthday" tune,
  // or point to your own file, e.g. "music/song.mp3".
  music: "",
};

/* ========================================================= */

const INK = "#241A33";
const PAPER = "#F6F1FC";
const CONFETTI = ["#8E6CCB", "#B9A3E3", "#F2A33A", "#F6F1FC", "#E0B66F"];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (selector) => document.querySelector(selector);
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const fewer = (n) => (reduceMotion ? Math.ceil(n / 4) : n);

const soundBtn = $("#sound-btn");
const micBtn = $("#mic-btn");
const canUseMic = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
let soundOn = true;
let opened = false;

/* ---------- Confetti & fireworks (canvas) ---------- */
const FX = (() => {
  const canvas = $("#fx");
  const ctx = canvas.getContext("2d");
  const ROCKET_GRAVITY = 0.2;
  let particles = [];
  let width = 0;
  let height = 0;
  let last = 0;
  let running = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    const dt = Math.min((now - last) / 16.67, 3); // 1 = one frame at 60fps
    last = now;
    ctx.clearRect(0, 0, width, height);
    const current = particles;
    particles = []; // rockets add their sparks here while we loop
    for (const p of current) {
      if (update(p, dt)) {
        particles.push(p);
        draw(p);
      }
    }
    if (particles.length) requestAnimationFrame(frame);
    else running = false;
  }

  function update(p, dt) {
    p.age += dt;
    if (p.type === "confetti") {
      p.vx *= Math.pow(0.985, dt);
      p.vy = Math.min(p.vy * Math.pow(0.985, dt) + 0.13 * dt, 4);
      p.x += (p.vx + Math.sin(p.spin) * 0.6) * dt;
      p.y += p.vy * dt;
      p.spin += 0.12 * dt;
      p.rot += p.vr * dt;
      return p.y < height + 30 && p.age < 700;
    }
    if (p.type === "rocket") {
      p.vy += ROCKET_GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.vy >= -0.5) {
        explode(p);
        return false;
      }
      return true;
    }
    // spark
    p.vx *= Math.pow(0.96, dt);
    p.vy = p.vy * Math.pow(0.96, dt) + 0.05 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    return p.age < p.life;
  }

  function draw(p) {
    if (p.type === "confetti") {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.spin)); // flip like falling paper
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
      return;
    }
    const fade = p.type === "rocket" ? 1 : 1 - p.age / p.life;
    if (p.type === "spark" && fade < 0.4 && Math.random() < 0.3) return; // crackle
    ctx.globalAlpha = Math.max(fade, 0);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.type === "rocket" ? 3 : 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function confetto(x, y, vx, vy, colors) {
    particles.push({
      type: "confetti", x, y, vx, vy,
      w: rand(6, 11), h: rand(10, 16),
      round: Math.random() < 0.2,
      color: pick(colors),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      spin: rand(0, Math.PI * 2),
      age: 0,
    });
  }

  function explode(rocket) {
    const count = fewer(80);
    const colors = [rocket.burstColor, rocket.burstColor, PAPER];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand(-0.05, 0.05);
      const speed = rand(1.5, 5.5);
      particles.push({
        type: "spark",
        x: rocket.x, y: rocket.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        color: pick(colors), life: rand(55, 85), age: 0,
      });
    }
  }

  // A burst of confetti from one point
  function burst(x, y, { count = 120, colors = CONFETTI, power = 13 } = {}) {
    for (let i = 0; i < fewer(count); i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.3, 1) * power;
      confetto(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - power * 0.4, colors);
    }
    start();
  }

  // Confetti falling from the top of the screen
  function rain(duration = 2500) {
    const end = performance.now() + duration;
    const perFrame = reduceMotion ? 1 : Math.max(1, Math.min(3, Math.round(width / 480))); // lighter on phones
    (function drop() {
      for (let i = 0; i < perFrame; i++) {
        confetto(rand(0, width), -20, rand(-1, 1), rand(1, 3), CONFETTI);
      }
      start();
      if (performance.now() < end) requestAnimationFrame(drop);
    })();
  }

  function firework(x, y) {
    particles.push({
      type: "rocket",
      x, y: height + 10,
      vx: rand(-0.6, 0.6),
      vy: -Math.sqrt(2 * ROCKET_GRAVITY * (height + 10 - y)),
      color: "#FFE9B8",
      burstColor: pick(["#F2A33A", "#B9A3E3", "#8E6CCB", "#E0B66F"]),
      age: 0,
    });
    start();
  }

  function show(count = 6, gap = 380) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => firework(rand(0.15, 0.85) * width, rand(0.12, 0.42) * height), i * gap);
    }
  }

  return { burst, rain, show };
})();

/* ---------- Music & sound effects (Web Audio, no files needed) ---------- */
const Sound = (() => {
  const NOTES = { G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
  // "Happy Birthday to You" as [note, beats]
  const SONG = [
    ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
    ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
    ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
    ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
  ];
  const BEAT = 0.42; // seconds

  let ctx = null;
  let sfxBus = null;
  let musicBus = null;
  let songTimer = null;
  let nextStart = 0;
  let playing = false;
  let track = null; // <audio> element when CONFIG.music is set

  function init() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
      sfxBus = bus(0.2);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function bus(volume) {
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    return gain;
  }

  // One soft music-box note
  function note(freq, time, length, output) {
    const tone = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    const env = ctx.createGain();
    tone.type = "triangle";
    tone.frequency.value = freq;
    shimmer.type = "sine";
    shimmer.frequency.value = freq * 2;
    shimmerGain.gain.value = 0.25;
    tone.connect(env);
    shimmer.connect(shimmerGain).connect(env);
    env.connect(output);
    const end = time + Math.max(length, 0.3) + 0.6;
    env.gain.setValueAtTime(0.0001, time);
    env.gain.exponentialRampToValueAtTime(1, time + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    tone.start(time);
    shimmer.start(time);
    tone.stop(end);
    shimmer.stop(end);
  }

  function queueSong() {
    let t = nextStart;
    for (const [name, beats] of SONG) {
      note(NOTES[name], t, beats * BEAT, musicBus);
      t += beats * BEAT;
    }
    nextStart = t + BEAT * 4; // short pause, then play it again
    songTimer = setTimeout(queueSong, (nextStart - ctx.currentTime - 0.5) * 1000);
  }

  function startMusic() {
    if (CONFIG.music) {
      track = track || Object.assign(new Audio(CONFIG.music), { loop: true });
      track.play().catch(() => {});
      return;
    }
    if (!init() || playing) return;
    playing = true;
    musicBus = bus(0.12);
    nextStart = ctx.currentTime + 0.2;
    queueSong();
  }

  function stopMusic() {
    if (track) track.pause();
    if (!playing) return;
    playing = false;
    clearTimeout(songTimer);
    const old = musicBus; // silence the notes that are already queued
    old.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    setTimeout(() => old.disconnect(), 15000);
  }

  function noise(duration, filterType, freq, volume, swell) {
    if (!soundOn || !init()) return;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const env = swell ? Math.sin((Math.PI * i) / length) : (1 - i / length) ** 3;
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.value = freq;
    gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(sfxBus);
    source.start();
  }

  function chime() {
    if (!soundOn || !init()) return;
    const t = ctx.currentTime + 0.05;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => note(freq, t + i * 0.1, 0.4, sfxBus));
  }

  return {
    startMusic,
    stopMusic,
    chime,
    pop: () => noise(0.12, "highpass", 1200, 1.5, false),
    whoosh: () => noise(0.5, "bandpass", 600, 1.5, true),
    context: init,
  };
})();

/* ---------- Balloons ---------- */
const Balloons = (() => {
  const layer = $("#balloons");
  const COLORS = ["#B9A3E3", "#8E6CCB", "#F2A33A", "#F6F1FC"];
  const SHAPE = `<svg viewBox="0 0 60 132"><g stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 4C50 4 58 22 56 38C53 58 38 72 30 74C22 72 7 58 4 38C2 22 10 4 30 4Z" style="fill: var(--c)"/>
    <path d="M25 81L30 74L35 81Z" style="fill: var(--c)" stroke-width="2"/>
    <path d="M30 81C22 93 38 105 28 128" fill="none" stroke-width="2"/>
    <path d="M15 24C17 17 21 13 26 11" fill="none" stroke="${PAPER}" stroke-width="4"/>
  </g></svg>`;

  function spawn() {
    if (layer.childElementCount >= 14) return;
    const balloon = document.createElement("div");
    const color = pick(COLORS);
    balloon.className = "balloon";
    balloon.innerHTML = SHAPE;
    balloon.style.left = `${rand(0, 92)}%`;
    balloon.style.setProperty("--c", color);
    balloon.style.setProperty("--w", `${Math.round(rand(54, 80))}px`);
    balloon.style.setProperty("--dur", `${rand(9, 14).toFixed(1)}s`);
    balloon.addEventListener("animationend", (e) => {
      if (e.animationName === "rise") balloon.remove();
    });
    balloon.addEventListener("pointerdown", () => pop(balloon, color));
    layer.append(balloon);
  }

  function pop(balloon, color) {
    if (balloon.classList.contains("popped")) return;
    const box = balloon.getBoundingClientRect();
    // freeze it where it is, then play the pop animation
    balloon.style.transform = getComputedStyle(balloon).transform;
    balloon.style.animation = "none";
    balloon.classList.add("popped");
    setTimeout(() => balloon.remove(), 250);
    FX.burst(box.left + box.width / 2, box.top + box.height * 0.28, { count: 40, colors: [color, PAPER, INK], power: 7 });
    Sound.pop();
  }

  function wave(count) {
    const scaled = Math.max(3, Math.round(count * Math.min(1, window.innerWidth / 1000))); // fewer on small screens
    for (let i = 0; i < scaled; i++) setTimeout(spawn, i * 260);
  }

  return { wave };
})();

/* ---------- Drawing pad ---------- */
const Pad = (() => {
  const canvas = $("#pad");
  const ctx = canvas.getContext("2d");
  const prompt = $("#pad-prompt");
  const swatches = document.querySelectorAll(".swatch");
  let pen = INK;
  let last = null;

  function clear() {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    prompt.classList.remove("hide");
  }

  function toCanvas(e) {
    const box = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) * canvas.width) / box.width,
      y: ((e.clientY - box.top) * canvas.height) / box.height,
    };
  }

  function penWidth() {
    return pen === PAPER ? 40 : 9;
  }

  function line(from, to) {
    ctx.strokeStyle = pen;
    ctx.lineWidth = penWidth();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    last = toCanvas(e);
    ctx.fillStyle = pen;
    ctx.beginPath();
    ctx.arc(last.x, last.y, penWidth() / 2, 0, Math.PI * 2);
    ctx.fill();
    prompt.classList.add("hide");
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!last) return;
    const coalesced = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const event of coalesced.length ? coalesced : [e]) {
      const point = toCanvas(event);
      line(last, point);
      last = point;
    }
  });

  ["pointerup", "pointercancel"].forEach((type) => canvas.addEventListener(type, () => (last = null)));

  swatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      pen = swatch.dataset.color;
      swatches.forEach((s) => s.setAttribute("aria-pressed", String(s === swatch)));
    });
  });

  $("#pad-clear").addEventListener("click", clear);
  $("#pad-save").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "birthday-doodle.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  clear();
})();

/* ---------- Page pieces ---------- */
function buildTitle() {
  const title = $("#title");
  title.textContent = "";
  title.setAttribute("aria-label", `Happy birthday, ${CONFIG.name}`);
  let index = 0;
  ["Happy birthday,", CONFIG.name].forEach((text, lineNo) => {
    const line = document.createElement("span");
    line.className = "line";
    line.setAttribute("aria-hidden", "true");
    text.split(" ").forEach((word, wordNo) => {
      if (wordNo) line.append(" ");
      const wordEl = document.createElement("span");
      wordEl.className = "word";
      for (const ch of word) {
        const charEl = document.createElement("span");
        charEl.className = "char";
        charEl.textContent = ch;
        charEl.style.setProperty("--d", `${500 + index * 60}ms`);
        charEl.style.setProperty("--rot", `${rand(-4, 4).toFixed(1)}deg`);
        wordEl.append(charEl);
        index++;
      }
      line.append(wordEl);
    });
    title.append(line);
  });
}

// Where the top edge of the drawn bhatura sits, in the drawing's 400x300 units
const BHATURA_TOP = [[101, 111], [146, 104], [180, 88], [220, 86], [259, 97]];
const FLAME = `<svg viewBox="0 0 20 32"><path d="M10 1C14 8 19 13 19 20C19 26 15 31 10 31C5 31 1 26 1 20C1 13 6 8 10 1Z" fill="#F2A33A" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M10 13C12 17 14 19 14 23C14 26 12 28 10 28C8 28 6 26 6 23C6 19 8 17 10 13Z" fill="#FFE38A"/></svg>`;

function topOfBhatura(x) {
  for (let i = 1; i < BHATURA_TOP.length; i++) {
    const [x1, y1] = BHATURA_TOP[i];
    const [x0, y0] = BHATURA_TOP[i - 1];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return BHATURA_TOP[BHATURA_TOP.length - 1][1];
}

function digitCandle(digit, color) {
  return `<svg class="digit-wax" viewBox="0 8 44 52" aria-hidden="true"><text x="22" y="54" text-anchor="middle" font-family="Figtree, sans-serif" font-weight="800" font-size="64" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${digit}</text></svg>`;
}

function buildCandles() {
  const holder = $("#candles");
  holder.innerHTML = "";
  const digits = CONFIG.age ? String(CONFIG.age).split("") : null;
  const count = digits ? digits.length : Math.max(1, Math.min(CONFIG.candles || 5, 9));
  const colors = digits ? ["#8E6CCB", PAPER] : ["#8E6CCB", "#F2A33A", PAPER];
  for (let i = 0; i < count; i++) {
    const x = digits
      ? 185 + (i - (count - 1) / 2) * 46
      : count === 1 ? 190 : 112 + (138 * i) / (count - 1);
    const y = topOfBhatura(x) + (digits ? 20 : 14);
    const candle = document.createElement("button");
    candle.type = "button";
    candle.className = digits ? "candle digit" : "candle";
    candle.setAttribute("aria-label", digits ? `Blow out the ${digits[i]} candle` : "Blow out candle");
    candle.style.left = `${(x / 400) * 100}%`;
    candle.style.top = `${(y / 300) * 100}%`;
    candle.style.setProperty("--c", colors[i % colors.length]);
    candle.style.setProperty("--h", `${11 + (i % 3) * 1.6}cqw`);
    candle.innerHTML = `<span class="flame">${FLAME}</span>${digits ? digitCandle(digits[i], colors[i % colors.length]) : ""}`;
    candle.addEventListener("click", () => blowOut(candle));
    holder.append(candle);
  }
  const hint = $("#cake-hint");
  hint.textContent = "Tap a candle to blow it out.";
  hint.classList.remove("done");
  micBtn.hidden = !canUseMic;
  micBtn.disabled = false;
  micBtn.textContent = "Blow into your mic instead";
}

function blowOut(candle) {
  if (candle.classList.contains("out")) return;
  candle.classList.add("out");
  candle.setAttribute("aria-label", "Candle blown out");
  const smoke = document.createElement("span");
  smoke.className = "smoke";
  smoke.style.setProperty("--dx", `${rand(-2, 3).toFixed(1)}cqw`);
  smoke.addEventListener("animationend", () => smoke.remove());
  candle.append(smoke);
  Sound.whoosh();
  if (!document.querySelector(".candle:not(.out)")) setTimeout(wishMade, 500);
}

function wishMade() {
  const hint = $("#cake-hint");
  hint.textContent = "Wish received. Processing time: about a year.";
  hint.classList.add("done");
  micBtn.hidden = true;
  FX.show(7);
  FX.rain(2500);
  Sound.chime();
}

// Listen to the microphone and blow out a candle whenever it hears a strong puff
async function listenForBlow() {
  const ctx = Sound.context();
  if (!ctx) return;
  micBtn.disabled = true;
  micBtn.textContent = "Listening… blow!";
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    micBtn.textContent = "No mic, tap the candles instead";
    return;
  }
  const analyser = ctx.createAnalyser();
  const mute = ctx.createGain();
  analyser.fftSize = 1024;
  mute.gain.value = 0; // keeps the graph running in every browser without playing the mic back
  ctx.createMediaStreamSource(stream).connect(analyser).connect(mute).connect(ctx.destination);
  const samples = new Uint8Array(analyser.fftSize);
  let loudFrames = 0;

  (function check() {
    const lit = document.querySelectorAll(".candle:not(.out)");
    if (!lit.length) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (const s of samples) sum += ((s - 128) / 128) ** 2;
    const level = Math.sqrt(sum / samples.length);
    loudFrames = level > 0.12 ? loudFrames + 1 : 0;
    if (loudFrames > 4) {
      blowOut(pick([...lit]));
      loudFrames = 0;
    }
    requestAnimationFrame(check);
  })();
}

function buildAwards() {
  const list = $("#awards");
  (CONFIG.awards || []).forEach((award) => {
    const item = document.createElement("li");
    item.className = "award reveal";
    const name = document.createElement("p");
    name.className = "award-name";
    name.textContent = award.title;
    const why = document.createElement("p");
    why.className = "award-why";
    why.textContent = award.why;
    item.append(name, why);
    list.append(item);
  });
}

// Drawings for the memories section, picked by name in CONFIG.memories
const DOODLES = {
  maths: `<svg viewBox="0 0 240 200"><g stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M34 24L190 12L204 176L48 188Z" fill="${PAPER}"/>
    <g fill="${INK}" stroke="none" font-family="Kalam, cursive" font-size="22" transform="rotate(-4 120 100)">
      <text x="58" y="62">a² + b² = c²</text><text x="58" y="100">∫ x dx = ?</text><text x="58" y="138">x = 23</text>
    </g>
    <ellipse cx="96" cy="134" rx="42" ry="19" fill="none" stroke="#F2A33A" stroke-width="3.5" transform="rotate(-6 96 134)"/>
    <g transform="rotate(-40 185 150)"><path d="M150 142H210V158H150Z" fill="#F2A33A"/><path d="M150 142L134 150L150 158Z" fill="#F2D9B0"/><path d="M210 142H222V158H210Z" fill="#B9A3E3"/></g>
  </g></svg>`,
  badminton: `<svg viewBox="0 0 240 200"><defs><clipPath id="racket-head"><ellipse rx="36" ry="46"/></clipPath></defs>
    <g stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
      <g transform="translate(86 86) rotate(-28)">
        <path d="M0 46V90" stroke-width="5"/>
        <rect x="-8" y="86" width="16" height="34" rx="4" fill="#8E6CCB" stroke-width="3"/>
        <ellipse rx="36" ry="46" fill="${PAPER}" stroke="none"/>
        <path clip-path="url(#racket-head)" d="M-24 -50V50M-12 -50V50M0 -50V50M12 -50V50M24 -50V50M-40 -36H40M-40 -24H40M-40 -12H40M-40 0H40M-40 12H40M-40 24H40M-40 36H40" stroke-width="1.5" opacity=".6"/>
        <ellipse rx="36" ry="46" fill="none" stroke-width="5"/>
      </g>
      <path d="M118 34C140 12 162 14 172 30" fill="none" stroke-width="3" stroke-dasharray="2 9"/>
      <g transform="translate(178 62) rotate(35)">
        <path d="M-16 -2L-24 -46H24L16 -2Z" fill="${PAPER}" stroke-width="3"/>
        <path d="M-8 -2L-11 -46M0 -2V-46M8 -2L11 -46" stroke-width="1.5"/>
        <path d="M-16 -2H16C16 12 8 18 0 18C-8 18 -16 12 -16 -2Z" fill="#F2A33A" stroke-width="3"/>
      </g>
    </g></svg>`,
  jury: `<svg viewBox="0 0 240 200"><g stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <g font-family="Figtree, sans-serif" font-weight="800" font-size="44" text-anchor="middle">
      <g transform="rotate(-8 50 110)"><path d="M50 120V192" stroke-width="5"/><rect x="18" y="40" width="64" height="80" rx="6" fill="${PAPER}"/><text x="50" y="96" fill="${INK}" stroke="none">9</text></g>
      <g transform="rotate(2 120 100)"><path d="M120 110V192" stroke-width="5"/><rect x="88" y="26" width="64" height="84" rx="6" fill="#F2A33A"/><text x="120" y="84" fill="${INK}" stroke="none">10</text></g>
      <g transform="rotate(10 190 110)"><path d="M190 120V192" stroke-width="5"/><rect x="158" y="40" width="64" height="80" rx="6" fill="#B9A3E3"/><text x="190" y="96" fill="${INK}" stroke="none">2</text></g>
    </g>
  </g></svg>`,
  food: `<svg viewBox="0 0 240 200"><g stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M88 42C80 32 96 24 88 12M150 66C142 56 158 48 150 36" fill="none"/>
    <ellipse cx="120" cy="156" rx="112" ry="34" fill="${PAPER}"/>
    <path d="M40 156C36 124 68 70 92 58C112 76 134 124 132 158C106 168 64 168 40 156Z" fill="#E7B566"/>
    <path d="M58 146C70 128 84 104 92 80" fill="none" stroke-width="2"/>
    <path d="M112 162C120 132 156 90 178 84C192 106 202 138 196 164C170 174 134 172 112 162Z" fill="#F2CF8F"/>
    <path d="M132 156C146 134 162 112 178 98" fill="none" stroke-width="2"/>
    <ellipse cx="208" cy="166" rx="24" ry="9" fill="#C9C3D6"/>
    <ellipse cx="208" cy="164" rx="18" ry="5" fill="#5DAA5E" stroke-width="2"/>
  </g></svg>`,
  gossip: `<svg viewBox="0 0 240 200"><g stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 26H150C158 26 164 32 164 40V92C164 100 158 106 150 106H70L44 128L50 106H20C12 106 6 100 6 92V40C6 32 12 26 20 26Z" fill="${PAPER}"/>
    <text x="85" y="74" font-family="Kalam, cursive" font-size="21" text-anchor="middle" fill="${INK}" stroke="none">did you hear…</text>
    <path d="M96 102H220C228 102 234 108 234 116V158C234 166 228 172 220 172H206L212 192L186 172H96C88 172 82 166 82 158V116C82 108 88 102 96 102Z" fill="#B9A3E3"/>
    <text x="158" y="148" font-family="Kalam, cursive" font-weight="700" font-size="30" text-anchor="middle" fill="${INK}" stroke="none">NO WAY</text>
  </g></svg>`,
};

function buildMemories() {
  const list = $("#hits");
  const memories = CONFIG.memories || [];
  if (!memories.length) {
    $("#memories").remove();
    return;
  }
  memories.forEach((memory, i) => {
    const item = document.createElement("li");
    item.className = "hit reveal";
    const art = document.createElement("div");
    art.className = "hit-art";
    art.style.setProperty("--tilt", `${i % 2 ? 3 : -3}deg`);
    if (memory.photo) {
      const img = document.createElement("img");
      img.src = memory.photo;
      img.alt = memory.title || "";
      img.loading = "lazy";
      art.append(img);
    } else {
      art.innerHTML = DOODLES[memory.doodle] || "";
      art.setAttribute("aria-hidden", "true");
    }
    const words = document.createElement("div");
    const title = document.createElement("p");
    title.className = "hit-title";
    title.textContent = memory.title || "";
    const text = document.createElement("p");
    text.className = "hit-text";
    text.textContent = memory.text || "";
    words.append(title, text);
    item.append(art, words);
    list.append(item);
  });
}

function buildPhotos() {
  const photos = CONFIG.photos || [];
  if (!photos.length) return;
  const grid = $("#photo-grid");
  photos.forEach((photo) => {
    const figure = document.createElement("figure");
    figure.className = "photo reveal";
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption || "";
    img.loading = "lazy";
    figure.append(img);
    if (photo.caption) {
      const caption = document.createElement("figcaption");
      caption.textContent = photo.caption;
      figure.append(caption);
    }
    grid.append(figure);
  });
  $("#photos").hidden = false;
}

function typeMessage() {
  const text = CONFIG.message.trim();
  const box = $("#message");
  const signature = $("#signature");
  $("#message-ghost").textContent = text; // reserves the space so the page doesn't jump
  signature.textContent = `With love and mild judgement,\n${CONFIG.from}`;
  if (reduceMotion) {
    box.textContent = text;
    signature.classList.add("show");
    return;
  }
  const chars = Array.from(text);
  let shown = 0;
  box.classList.add("typing");
  (function type() {
    box.textContent = chars.slice(0, ++shown).join("");
    if (shown < chars.length) {
      const ch = chars[shown - 1];
      setTimeout(type, ch === "\n" ? 300 : /[.!?,]/.test(ch) ? 240 : 26);
    } else {
      box.classList.remove("typing");
      signature.classList.add("show");
    }
  })();
}

// Fade things in as they scroll into view; things arriving together are staggered
function watchReveals() {
  const observer = new IntersectionObserver((entries) => {
    let order = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (!el.style.getPropertyValue("--stagger")) el.style.setProperty("--stagger", `${order++ * 80}ms`);
      el.classList.add("visible");
      observer.unobserve(el);
      if (el.id === "card") typeMessage();
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
const ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';

function setSound(on) {
  soundOn = on;
  soundBtn.innerHTML = on ? ICON_ON : ICON_OFF;
  soundBtn.setAttribute("aria-label", on ? "Mute music" : "Play music");
  if (on) Sound.startMusic();
  else Sound.stopMusic();
}

function openBook() {
  if (opened) return;
  opened = true;
  Sound.startMusic(); // browsers only allow audio after a tap, so start it here
  buildTitle();
  document.body.classList.add("opened");
  document.body.classList.remove("locked");
  $("#intro").classList.add("open");
  soundBtn.hidden = false;
  watchReveals();
  setTimeout(() => {
    $("#intro").remove();
    $("#title").focus({ preventScroll: true });
    FX.rain(2500);
    Balloons.wave(fewer(10));
  }, reduceMotion ? 300 : 1000);
}

function celebrateAgain() {
  buildCandles();
  FX.rain(3000);
  Balloons.wave(fewer(8));
  Sound.chime();
  $("#wish").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}

/* ---------- Start ---------- */
document.title = `Happy birthday, ${CONFIG.name}`;
document.querySelectorAll(".js-name").forEach((el) => (el.textContent = CONFIG.fullName || CONFIG.name));
$("#feast-line").textContent = CONFIG.age
  ? `We thought about a cake. Then we remembered who we're dealing with. So here's a bhatura with a ${CONFIG.age} in it.`
  : "We thought about a cake. Then we remembered who we're dealing with.";
$("#credit").textContent = `Made by ${CONFIG.from}, for ${CONFIG.name}, ${new Date().getFullYear()}.`;
soundBtn.innerHTML = ICON_ON;
buildCandles();
buildAwards();
buildMemories();
buildPhotos();

$("#cover").addEventListener("click", openBook);
soundBtn.addEventListener("click", () => setSound(!soundOn));
micBtn.addEventListener("click", listenForBlow);
$("#again-btn").addEventListener("click", celebrateAgain);

// Pause the music while the tab is in the background
document.addEventListener("visibilitychange", () => {
  if (!opened || !soundOn) return;
  if (document.hidden) Sound.stopMusic();
  else Sound.startMusic();
});

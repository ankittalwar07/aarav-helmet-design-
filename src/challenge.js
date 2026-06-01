// The Design Challenge: Aarav's guided problem-solving lab.
//
// The point is NOT to hand him a finished helmet. It's to:
//   1) break the big problem into smaller ones,
//   2) work inside real constraints (weight, airflow, budget),
//   3) make his OWN design choices and see the trade-offs live,
//   4) crash-test it and learn from the result,
//   5) iterate until the mission is solved.

import { shells, gels, liners, scenarios, config } from "../data/components.js";

const layerDefs = [
  { key: "shell", title: "1️⃣ Outer shell", help: "Spreads the hit over a wide area. Hard = protective but heavy & hot.", options: shells, min: 1, max: 6, def: 4, unit: "mm" },
  { key: "gel",   title: "2️⃣ Smart layer", help: "The clever bit: soft when worn, hard on impact. This does most of the protecting.", options: gels, min: 0, max: 26, def: 10, unit: "mm" },
  { key: "liner", title: "3️⃣ Comfort liner", help: "Touches the hair. Should be airy so Aarav doesn't get sweaty.", options: liners, min: 2, max: 16, def: 8, unit: "mm" },
];

export function initChallenge(root) {
  const state = {
    shell: { mat: shells[0].id, mm: 4 },
    gel: { mat: gels[2].id, mm: 10 },
    liner: { mat: liners[2].id, mm: 8 },
    speed: 20,
  };

  root.innerHTML = template();

  // ---- populate the layer pickers ----
  const pickers = root.querySelector("#picker-grid");
  pickers.innerHTML = layerDefs.map(pickerCard).join("");

  // ---- scenario buttons ----
  const scenWrap = root.querySelector("#scenarios");
  scenWrap.innerHTML = scenarios
    .map(
      (s) =>
        `<button class="scenario" data-speed="${s.speed}" title="${s.desc}">
           ${s.emoji} ${s.name}<small>${s.speed} km/h</small>
         </button>`
    )
    .join("");

  // ---- wiring ----
  layerDefs.forEach((def) => {
    const sel = root.querySelector(`#sel-${def.key}`);
    const rng = root.querySelector(`#rng-${def.key}`);
    sel.value = state[def.key].mat;
    rng.value = state[def.key].mm;
    sel.addEventListener("change", () => { state[def.key].mat = sel.value; compute(); });
    rng.addEventListener("input", () => { state[def.key].mm = +rng.value; compute(); });
  });

  scenWrap.querySelectorAll(".scenario").forEach((b) => {
    b.addEventListener("click", () => {
      state.speed = +b.dataset.speed;
      root.querySelector("#speed-input").value = state.speed;
      scenWrap.querySelectorAll(".scenario").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      compute();
    });
  });

  const speedInput = root.querySelector("#speed-input");
  speedInput.addEventListener("input", () => {
    state.speed = +speedInput.value || 1;
    scenWrap.querySelectorAll(".scenario").forEach((x) => x.classList.remove("active"));
    compute();
  });

  const crashBtn = root.querySelector("#crash-btn");
  const canvas = root.querySelector("#challenge-canvas");
  crashBtn.addEventListener("click", () => {
    const r = evaluate(state, state.speed);
    runCrashAnimation(canvas, state, r);
  });

  // ---------- the live engineering model ----------
  function partsOf() {
    return {
      shell: { ...shells.find((m) => m.id === state.shell.mat), mm: state.shell.mm },
      gel: { ...gels.find((m) => m.id === state.gel.mat), mm: state.gel.mm },
      liner: { ...liners.find((m) => m.id === state.liner.mat), mm: state.liner.mm },
    };
  }

  function compute() {
    const p = partsOf();
    const layers = [p.shell, p.gel, p.liner];

    // weight = density * volume   (volume = area * thickness)
    const weight = layers.reduce((s, L) => s + L.density * config.AREA_CM2 * (L.mm / 10), 0);
    // cost = $/cm^3 * volume
    const cost = layers.reduce((s, L) => s + L.cost * config.AREA_CM2 * (L.mm / 10), 0);
    // airflow: each layer adds breathing resistance; thicker + less permeable = worse
    const resistance = layers.reduce((s, L) => s + L.mm / (L.permeability || 0.1), 0);
    const airflow = Math.round(100 / (1 + resistance / 10));
    // crush distance: the effective squish that gentles the stop
    const stopMm = layers.reduce((s, L) => s + L.mm * L.crush, 0);

    // update layer captions (live per-part feedback)
    layerDefs.forEach((def) => {
      const L = p[def.key];
      root.querySelector(`#mm-${def.key}`).textContent = `${L.mm} ${def.unit}`;
      root.querySelector(`#note-${def.key}`).textContent = L.note || "";
    });

    // gauges
    setGauge(root, "weight", weight, config.limits.maxWeight, "g", true);
    setGauge(root, "airflow", airflow, config.limits.minAirflow, "", false);
    setGauge(root, "cost", cost, config.limits.maxCost, "$", true, true);

    // crash prediction at the chosen speed
    const r = evaluate(state, state.speed);
    const pred = root.querySelector("#prediction");
    pred.className = `prediction ${r.level}`;
    pred.innerHTML =
      `At <b>${state.speed} km/h</b>: brain feels <b>${r.g} g</b> → ` +
      `<b>${r.label}</b> ${r.emoji}<br><small>${r.advice}</small>`;

    // mission checklist
    const checks = {
      weight: weight <= config.limits.maxWeight,
      airflow: airflow >= config.limits.minAirflow,
      cost: cost <= config.limits.maxCost,
      crash: r.g <= config.limits.safeG,
    };
    renderChecklist(root, checks, stopMm);
  }

  compute();
}

// ---------- physics: does the brain survive? ----------
function evaluate(state, speedKmh) {
  const p = {
    shell: shells.find((m) => m.id === state.shell.mat),
    gel: gels.find((m) => m.id === state.gel.mat),
    liner: liners.find((m) => m.id === state.liner.mat),
  };
  const stopMm =
    p.shell.crush * state.shell.mm +
    p.gel.crush * state.gel.mm +
    p.liner.crush * state.liner.mm;
  const d = Math.max(stopMm, 0.5) / 1000; // metres (min 0.5mm so we never divide by ~0)

  const v = speedKmh / 3.6; // m/s
  const KE = 0.5 * config.headMass * v * v; // joules
  const F = KE / d; // average force, N
  const g = Math.round(F / (config.headMass * 9.81)); // g-force

  const { safeG, greatG } = config.limits;
  let level, label, emoji, advice;
  if (g <= greatG) {
    level = "great"; label = "WELL PROTECTED"; emoji = "🟢";
    advice = "Excellent! The smart layer soaked up the hit.";
  } else if (g <= safeG) {
    level = "ok"; label = "PROTECTED"; emoji = "🟡";
    advice = "Safe, but a bit more cushioning would be even better.";
  } else {
    level = "bad"; label = "CRASH — NOT SAFE"; emoji = "🔴";
    advice = "Too much force! Add a thicker/better smart layer to squish for longer.";
  }
  return { g, level, label, emoji, advice, KE: Math.round(KE), stopMm: stopMm.toFixed(1) };
}

// ---------- UI helpers ----------
function pickerCard(def) {
  const opts = def.options.map((o) => `<option value="${o.id}">${o.emoji} ${o.name}</option>`).join("");
  return `
  <div class="picker">
    <h4>${def.title}</h4>
    <p class="picker-help">${def.help}</p>
    <select id="sel-${def.key}">${opts}</select>
    <div class="thick">
      <label>Thickness</label>
      <input type="range" id="rng-${def.key}" min="${def.min}" max="${def.max}" step="1" value="${def.def}" />
      <span class="thick-val" id="mm-${def.key}">${def.def} ${def.unit}</span>
    </div>
    <p class="picker-note" id="note-${def.key}"></p>
  </div>`;
}

function setGauge(root, key, value, limit, unit, lowerIsBetter, isMoney) {
  const ok = lowerIsBetter ? value <= limit : value >= limit;
  const valEl = root.querySelector(`#g-${key}-val`);
  const fillEl = root.querySelector(`#g-${key}-fill`);
  const pct = Math.max(4, Math.min(100, lowerIsBetter ? (value / limit) * 100 : (value / (limit * 1.6)) * 100));
  const shown = isMoney ? `$${value.toFixed(0)}` : `${Math.round(value)}${unit}`;
  valEl.textContent = shown;
  valEl.className = `gauge-val ${ok ? "good" : "bad"}`;
  fillEl.style.width = pct + "%";
  fillEl.className = `gauge-fill ${ok ? "good" : "bad"}`;
}

function renderChecklist(root, checks, stopMm) {
  const items = [
    ["weight", `Light enough (≤ ${config.limits.maxWeight} g)`],
    ["airflow", `Airy enough (≥ ${config.limits.minAirflow})`],
    ["cost", `Within budget (≤ $${config.limits.maxCost})`],
    ["crash", `Passes the crash test (≤ ${config.limits.safeG} g)`],
  ];
  const list = items
    .map(([k, label]) => `<li class="${checks[k] ? "done" : "todo"}">${checks[k] ? "✅" : "⬜"} ${label}</li>`)
    .join("");
  const all = Object.values(checks).every(Boolean);
  root.querySelector("#checklist").innerHTML = list;
  const badge = root.querySelector("#mission-badge");
  badge.style.display = all ? "block" : "none";
  root.querySelector("#stop-readout").textContent =
    `Your design squishes ${stopMm.toFixed(1)} mm on impact — that's the cushion that saves the brain.`;
}

// ---------- crash animation ----------
function runCrashAnimation(canvas, state, result) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const groundY = H - 30;
  const startY = 60;
  let t = 0;
  const fall = 55; // frames falling
  const squish = 18; // frames compressing
  const total = fall + squish + 50;

  function frame() {
    t++;
    ctx.clearRect(0, 0, W, H);

    // ground
    ctx.fillStyle = "#0a1026";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#2a3a6b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // speed label
    ctx.fillStyle = "#9fb0d8";
    ctx.font = "14px 'Space Grotesk', sans-serif";
    ctx.fillText(`Crash test @ ${state.speed} km/h`, 16, 24);

    // motion
    let headY, compress = 0;
    if (t <= fall) {
      const k = t / fall;
      headY = startY + (groundY - startY - 70) * (k * k); // accelerate down
    } else if (t <= fall + squish) {
      headY = groundY - 70;
      compress = ((t - fall) / squish) * 14 * (result.level === "bad" ? 0.4 : 1);
    } else {
      headY = groundY - 70 - (result.level === "bad" ? 0 : (t - fall - squish) * 0.6);
      compress = 14 * (result.level === "bad" ? 0.4 : 1);
    }

    const cx = W / 2;
    // helmet shells (outer ring) — colored by result after impact
    const impacted = t > fall;
    const shellColor = impacted ? (result.level === "bad" ? "#ff5d6c" : result.level === "ok" ? "#ffd166" : "#43e0a0") : "#6fa8ff";

    // smart-gel ring
    ctx.fillStyle = impacted ? shellColor : "#43e0a0";
    ctx.beginPath();
    ctx.arc(cx, headY + compress, 46, Math.PI, 0);
    ctx.fill();
    // outer shell arc
    ctx.strokeStyle = shellColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, headY + compress, 50, Math.PI, 0);
    ctx.stroke();

    // head
    ctx.fillStyle = "#c9a7ff";
    ctx.beginPath();
    ctx.arc(cx, headY + compress, 34, 0, Math.PI * 2);
    ctx.fill();
    // simple face
    ctx.fillStyle = "#2a1f4a";
    ctx.beginPath(); ctx.arc(cx - 10, headY + compress - 4, 3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 10, headY + compress - 4, 3, 0, 7); ctx.fill();

    // impact flash + verdict
    if (impacted) {
      const a = Math.max(0, 1 - (t - fall) / 25);
      if (a > 0) {
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang) * (60 + (1 - a) * 30), groundY - 10 + Math.sin(ang) * 10, 4, 0, 7);
          ctx.fill();
        }
      }
      ctx.font = "bold 22px 'Fredoka', sans-serif";
      ctx.fillStyle = shellColor;
      ctx.textAlign = "center";
      ctx.fillText(`${result.g} g  ${result.emoji}`, cx, 56);
      ctx.font = "15px 'Space Grotesk', sans-serif";
      ctx.fillText(result.label, cx, 78);
      ctx.textAlign = "left";
    }

    if (t < total) requestAnimationFrame(frame);
  }
  frame();
}

function template() {
  return `
  <div class="mission">
    <h2>🎯 The Mission</h2>
    <p>Design a helmet that is <b>airy &amp; light</b> to wear, but <b>protects the brain</b> in a crash.
       Here's the tricky part: those two goals <i>fight each other</i>. Your job is to find the smart balance.</p>
    <div class="steps">
      <div class="step"><span>🧩</span><b>1. Break it down</b><p>Split the big problem into 3 layers: shell, smart layer, liner.</p></div>
      <div class="step"><span>📏</span><b>2. Know the limits</b><p>Stay light, stay airy, stay on budget. Real designers always have constraints.</p></div>
      <div class="step"><span>🛠️</span><b>3. Make choices</b><p>Pick materials &amp; thickness. Watch every choice change the results live.</p></div>
      <div class="step"><span>💥</span><b>4. Test it</b><p>Crash it at a chosen speed. Did the brain survive?</p></div>
      <div class="step"><span>🔁</span><b>5. Improve</b><p>Didn't pass? Change one thing, test again. That's problem solving!</p></div>
    </div>
  </div>

  <div class="design-layout">
    <div class="design-left">
      <h3>🛠️ Build your helmet</h3>
      <div id="picker-grid" class="picker-grid"></div>
    </div>

    <div class="design-right">
      <h3>📊 Your design, live</h3>
      <div class="gauges">
        ${gaugeHTML("weight", "⚖️ Weight", "lighter is comfier")}
        ${gaugeHTML("airflow", "🌬️ Airflow", "higher = less sweaty")}
        ${gaugeHTML("cost", "💰 Build cost", "stay on budget")}
      </div>
      <div id="prediction" class="prediction">—</div>
      <p id="stop-readout" class="muted"></p>

      <h3>✅ Mission checklist</h3>
      <ul id="checklist" class="checklist"></ul>
      <div id="mission-badge" class="mission-badge">🏆 Mission solved! All constraints met. Now try a faster crash!</div>
    </div>
  </div>

  <div class="crash-zone">
    <h3>💥 Crash simulator</h3>
    <p class="muted">Pick how bad the crash is, then drop it. Tip: a design that passes a tip-over might fail downhill — just like real life.</p>
    <div id="scenarios" class="scenarios"></div>
    <div class="speed-row">
      <label>Custom speed: <input type="number" id="speed-input" value="20" min="1" max="80" /> km/h</label>
      <button class="big-btn" id="crash-btn">💥 Run crash test</button>
    </div>
    <canvas id="challenge-canvas" width="720" height="320"></canvas>
  </div>`;
}

function gaugeHTML(key, label, sub) {
  return `
  <div class="gauge">
    <div class="gauge-top"><span>${label}</span><span class="gauge-val" id="g-${key}-val">—</span></div>
    <div class="gauge-bar"><div class="gauge-fill" id="g-${key}-fill"></div></div>
    <small class="muted">${sub}</small>
  </div>`;
}

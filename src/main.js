import { initHelmet } from "./helmet.js";
import { initSimulator } from "./simulator.js";
import { materials } from "../data/materials.js";

/* ---------------- Tabs ---------------- */
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
let helmetStarted = false;

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    const id = tab.dataset.tab;
    document.getElementById(id).classList.add("active");
    // (re)size the 3D canvas when its tab becomes visible
    window.dispatchEvent(new Event("resize"));
  });
});

/* ---------------- 3D Helmet ---------------- */
const helmet = initHelmet(document.getElementById("helmet-canvas"));
helmetStarted = true;

const bind = (id, key) => {
  const el = document.getElementById(id);
  el.addEventListener("change", () => {
    helmet.state[key] = el.checked;
    helmet.applyToggles();
  });
};
bind("toggle-gel", "showGel");
bind("toggle-vents", "showVents");
bind("toggle-section", "section");
bind("toggle-spin", "spin");

const impactReadout = document.getElementById("impact-readout");
document.getElementById("impact-btn").addEventListener("click", () => {
  helmet.triggerImpact();
  const g = (Math.random() * 80 + 40).toFixed(0);
  impactReadout.innerHTML =
    `💥 Impact! The smart gel flashed <b style="color:#ff5d6c">HARD</b> at the hit point, ` +
    `spreading ~${g}g of force across the shell instead of into the skull. Then it goes soft again.`;
});

/* ---------------- Smart Material Simulator ---------------- */
const simState = document.getElementById("sim-state");
const stiffFill = document.getElementById("stiffness-fill");
const sim = initSimulator(document.getElementById("molecule-canvas"), ({ jam, locked }) => {
  stiffFill.style.width = `${Math.round(10 + jam * 90)}%`;
  simState.innerHTML = locked
    ? 'State: <b style="color:#ff5d6c">HARD</b> (particles jammed!)'
    : 'State: <b style="color:#43e0a0">SOFT</b> (liquid-like)';
});

const speedSlider = document.getElementById("speed-slider");
speedSlider.addEventListener("input", () => sim.setShear(speedSlider.value / 100));
document.getElementById("poke-btn").addEventListener("click", () => sim.punch());

/* ---------------- Physics Calculator ---------------- */
const massEl = document.getElementById("calc-mass");
const speedEl = document.getElementById("calc-speed");
const distEl = document.getElementById("calc-dist");
const distOut = document.getElementById("calc-dist-out");
const resNo = document.getElementById("res-nohelmet");
const resYes = document.getElementById("res-helmet");
const verdict = document.getElementById("calc-verdict");
const keLine = document.getElementById("ke-line");

function fmtForce(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + " kN";
  return Math.round(n) + " N";
}
function fmtG(force, mass) {
  return (force / (mass * 9.81)).toFixed(0);
}

function recalc() {
  const m = parseFloat(massEl.value) || 1;
  const vKmh = parseFloat(speedEl.value) || 1;
  const v = vKmh / 3.6; // m/s
  const dHelmet = parseFloat(distEl.value) / 100; // cm -> m
  const dSkull = 0.002; // skull squish ~2 mm

  distOut.textContent = parseFloat(distEl.value).toFixed(1) + " cm";

  const KE = 0.5 * m * v * v; // Joules
  // Work-energy: F = KE / stopping distance (average force)
  const fNo = KE / dSkull;
  const fYes = KE / dHelmet;

  resNo.textContent = fmtForce(fNo);
  resYes.textContent = fmtForce(fYes);

  const reduction = (1 - fYes / fNo) * 100;
  verdict.innerHTML =
    `Aarav's helmet cuts the peak force by <b>${reduction.toFixed(0)}%</b> ` +
    `(${fmtG(fNo, m)}g → <b style="color:#43e0a0">${fmtG(fYes, m)}g</b>). ` +
    `Longer squish = gentler stop. 🧠✅`;

  keLine.innerHTML =
    `Kinetic energy at impact: <b>${KE.toFixed(0)} J</b>. ` +
    `The smart gel turns this into heat and tiny particle friction instead of into your skull.`;
}
[massEl, speedEl, distEl].forEach((el) => el.addEventListener("input", recalc));
recalc();

/* ---------------- Materials Guide ---------------- */
const grid = document.getElementById("materials-grid");
grid.innerHTML = materials
  .map(
    (m) => `
  <div class="mat-card">
    <div class="mat-emoji">${m.emoji}</div>
    <h3>${m.name}</h3>
    <span class="mat-tag">${m.tag}</span>
    <p class="mat-desc">${m.desc}</p>
    <div class="bars">
      ${bar("Airy / light", m.airy, "airy")}
      ${bar("Protection", m.safe, "safe")}
      ${bar("Easy for a kid", m.easy, "easy")}
    </div>
  </div>`
  )
  .join("");

function bar(label, val, cls) {
  return `<div class="bar-row">${label} — ${val}%
    <div class="bar ${cls}"><span style="width:${val}%"></span></div>
  </div>`;
}

// The "parts box" Aarav designs from. Every choice is a real trade-off:
// lighter & airier usually means less protection, and better protection
// usually costs more or weighs more. That tension is the whole lesson.
//
// Properties (kept simple but physically sensible):
//   density      g/cm^3  -> drives weight
//   permeability higher = more air flows through (less sweaty)
//   crush        0..1    = how much of its thickness actually cushions a hit
//                          (foam crushes a lot; hard plastic barely crushes)
//   cost         $/cm^3  -> drives build cost
//   note         a real-world catch, so Aarav learns constraints aren't just numbers

export const config = {
  AREA_CM2: 450, // approx surface area of the helmet shell
  headMass: 5, // kg of head + neck that actually stops at the impact point
  // Design budget / targets Aarav must respect:
  limits: {
    maxWeight: 650, // grams  - heavier than this feels "cumbersome"
    minAirflow: 38, // score  - lower than this feels "sweaty"
    maxCost: 80, // dollars   - the build budget
    safeG: 300, // g-force    - above this, the brain is in danger
    greatG: 180, // g-force   - below this, it's a really good helmet
  },
};

export const shells = [
  { id: "lattice", emoji: "🌬️", name: "3D-printed lattice", density: 0.15, permeability: 9, crush: 0.25, cost: 0.04, note: "Super light and airy, but on its own it won't stop a hard hit." },
  { id: "abs",     emoji: "🧱", name: "ABS plastic",        density: 1.05, permeability: 1, crush: 0.15, cost: 0.05, note: "Cheap and tough, but heavy and it traps heat." },
  { id: "pc",      emoji: "🛡️", name: "Polycarbonate",      density: 1.20, permeability: 0.8, crush: 0.20, cost: 0.12, note: "What many real helmets use for the hard outer skin." },
  { id: "carbon",  emoji: "🪶", name: "Carbon composite",   density: 1.50, permeability: 0.5, crush: 0.30, cost: 0.40, note: "Amazing strength for the weight — but expensive." },
];

export const gels = [
  { id: "none",    emoji: "🚫", name: "No smart layer",     density: 0,    permeability: 99, crush: 0,    cost: 0,    note: "Airy and light... but you removed the part that protects you!" },
  { id: "oobleck", emoji: "🥣", name: "Oobleck (DIY)",      density: 1.00, permeability: 0.5, crush: 0.45, cost: 0.01, note: "Great for the experiment, but it dries out — not a real helmet." },
  { id: "d3o",     emoji: "🟧", name: "D3O smart foam",     density: 0.40, permeability: 3.5, crush: 0.80, cost: 0.05, note: "Soft when worn, locks hard on impact. The real deal." },
  { id: "stf",     emoji: "🍯", name: "STF liquid armor",   density: 0.55, permeability: 5, crush: 0.70, cost: 0.07, note: "Light and breathable liquid armor, but pricey to make." },
];

export const liners = [
  { id: "eps",    emoji: "🧊", name: "EPS foam",        density: 0.05, permeability: 2, crush: 0.60, cost: 0.01, note: "Classic helmet foam: light and cushiony, but not very breathable." },
  { id: "memory", emoji: "🛏️", name: "Memory foam",     density: 0.25, permeability: 3, crush: 0.50, cost: 0.08, note: "Comfy and hugs your head, a little heavier." },
  { id: "mesh",   emoji: "🕸️", name: "Airy mesh pad",   density: 0.10, permeability: 9, crush: 0.20, cost: 0.06, note: "Maximum airflow for the hair — but thin on cushioning." },
];

// Crash scenarios Aarav can test against.
export const scenarios = [
  { id: "tip",      emoji: "🚲", name: "Tip-over",      speed: 12, desc: "Slow wobble and fall onto grass." },
  { id: "normal",   emoji: "🛣️", name: "Normal fall",   speed: 20, desc: "A regular fall off the bike on a path." },
  { id: "fast",     emoji: "💨", name: "Fast road",     speed: 30, desc: "Falling at speed on a road." },
  { id: "downhill", emoji: "⛰️", name: "Downhill",      speed: 45, desc: "A serious high-speed downhill crash." },
];

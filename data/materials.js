// Real materials Aarav could use for his smart helmet.
// Each rating is 0-100: airy = how light/breathable, safe = impact protection,
// easy = how easy it is for a kid to experiment with at home/school.
export const materials = [
  {
    emoji: "🧫",
    name: "Oobleck (cornstarch + water)",
    tag: "DIY · proof of concept",
    desc: "The classic shear-thickening fluid. Perfect to PROVE the science, but it dries out — not a real helmet, just the experiment that shows the effect works.",
    airy: 40, safe: 35, easy: 100,
  },
  {
    emoji: "🛡️",
    name: "D3O (engineered polymer)",
    tag: "Real armor · pro",
    desc: "Soft, squishy orange pads used in real bike & motorbike armor. Flows when you wear it, locks solid on impact. Sealed so it never dries. This is the dream material.",
    airy: 70, safe: 95, easy: 20,
  },
  {
    emoji: "🕳️",
    name: "Auxetic foam",
    tag: "Clever geometry",
    desc: "A foam with a special structure that gets THICKER when stretched and squeezes inward to protect a hit point. Very breathable because it's full of holes.",
    airy: 85, safe: 75, easy: 35,
  },
  {
    emoji: "🧽",
    name: "PORON XRD / memory foam",
    tag: "Comfy liner",
    desc: "Soft and breathable normally, stiffens a bit when squashed quickly. Great as the comfort layer that touches Aarav's hair and wicks sweat.",
    airy: 80, safe: 60, easy: 45,
  },
  {
    emoji: "🍯",
    name: "STF-soaked fabric (Kevlar + silica)",
    tag: "Liquid armor",
    desc: "Real 'liquid body armor': fabric dipped in a silica shear-thickening fluid. Stays flexible and light, turns stiff on a fast hit. Used in research labs.",
    airy: 75, safe: 90, easy: 15,
  },
  {
    emoji: "🌬️",
    name: "3D-printed lattice shell",
    tag: "Outer skin",
    desc: "A printed honeycomb/lattice outer shell — tons of airflow channels, very light, and spreads the impact over a wide area before it reaches the smart gel.",
    airy: 95, safe: 70, easy: 50,
  },
];

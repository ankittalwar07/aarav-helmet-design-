# 🪖⚡ Aarav's Smart Helmet Lab

**Soft & airy when you wear it — rock hard the instant you crash.**

This is an interactive web lab built for Aarav's science experiment. It explores a
real idea: a bike helmet that feels light and breathable (so you can almost feel
your hair and don't get sweaty), but turns solid and protective the moment you fall.

That's not science fiction — it's a **shear-thickening (non-Newtonian) material**,
the same physics as kitchen "oobleck" and the real motorbike armor brand **D3O**.

---

## 🚀 How to run it

You need [Node.js](https://nodejs.org) installed (any recent version).

```bash
npm start
```

Then open the link it prints (usually <http://localhost:5173>) in a web browser.

> No build step, no installing big libraries. It loads Three.js from the internet
> the first time, so stay online for the first run.

You can also just open `index.html` directly in a browser, but using `npm start`
avoids browser security blocks on ES modules.

---

## 🧠 The big idea (explain it like Aarav would at the science fair)

A normal helmet is hard **all the time**, which makes it heavy and hot. Aarav's
helmet is soft **almost all the time** and only becomes hard for the split-second
of a crash.

The trick is a **shear-thickening fluid**: a liquid packed with tiny solid
particles.

- 🐢 **Push it slowly** → the particles slide past each other → it flows like a gel.
- ⚡ **Hit it fast** → the particles jam into "log-jams" (called *hydroclusters*)
  → it acts like a solid.
- 🔁 **It's reversible** → after the hit, it relaxes back to soft.

A helmet's real job is **physics**: it makes the crash *last longer*. The same
crash energy spread over more time means a much smaller force on your skull:

```
F = Δp / Δt        (bigger stopping time  → smaller force)
KE = ½ · m · v²    (the energy that must go somewhere)
```

The smart gel turns that energy into heat and particle friction instead of into
your head.

---

## 🧩 What's inside the app

| Tab | What it does |
|-----|--------------|
| 🎯 **Design Challenge** | The heart of the app. Aarav **breaks the problem into 3 layers**, designs his *own* helmet under real **constraints** (weight, airflow, budget), watches every choice change the results live, then **crash-tests** it at a chosen speed to see if the brain survives — and iterates until the mission is solved. |
| 🧊 **3D Helmet** | Rotate Aarav's helmet, toggle the airy shell / smart-gel layer / comfort liner, see a cut-away, and run a **crash test** that flashes the gel hard at the hit point. |
| 🔬 **Smart Material** | A live particle simulation. Drag slowly = stays soft; click **Punch it!** = particles jam and it goes hard. |
| 📐 **The Physics** | The real equations + an **impact calculator** comparing "no helmet" vs. Aarav's helmet (peak force and g-forces). |
| 🧪 **Materials Guide** | Real materials he could build it from (oobleck, D3O, auxetic foam, STF fabric…) rated for airiness, protection, and how kid-friendly they are. |
| 🥣 **Build It Yourself** | A 5-minute **oobleck experiment** to prove the science by hand, with science-fair questions to investigate. |

---

## 🧠 For the grown-up: how this teaches problem-solving

The **Design Challenge** tab is built to teach *how to think*, not just *what to build*:

1. **Break the big problem into small ones.** The impossible-sounding goal ("airy
   AND protective") becomes three solvable sub-problems: shell, smart layer, liner.
2. **Constraints are the point, not the enemy.** Aarav can't just "make it safe" —
   he must stay under a weight, keep airflow up, and stay on budget. Real engineers
   *always* design inside limits.
3. **Every choice has a trade-off.** Thicker smart layer = safer but heavier, less
   airy, and pricier. The live gauges make the trade-off visible and immediate.
4. **Test, fail, learn, iterate.** The crash simulator gives instant, honest
   feedback. A design that survives a tip-over may fail a downhill crash — so he
   learns to change *one variable at a time* and re-test.
5. **There isn't always a perfect answer.** At extreme speeds he'll discover you
   can't max out *everything* at once — the deepest engineering lesson of all.

Good questions to ask him while he plays:
- "Why did that change make it heavier?"
- "What's the *one* thing you'd change to pass the next crash?"
- "Can you pass the downhill test? What did you have to give up to do it?"

## 🛠️ The 3-layer design

1. **Airy outer shell** — a light, breathable lattice/mesh with ventilation
   channels. Spreads an impact over a wide area.
2. **Smart-gel layer** — the shear-thickening core. Soft and flexible normally,
   instantly stiff on impact. *(This is the part that makes the idea special.)*
3. **Comfort liner** — a soft, sweat-wicking layer that touches the hair so it
   feels cool and not cumbersome.

---

## 🔬 Next steps for the experiment

1. Make **oobleck** and prove the soft→hard effect (Build It Yourself tab).
2. Test variables: does more cornstarch harden more easily? Higher drops?
3. Try protecting an **egg** with an oobleck-filled pouch dropped from a height. 🥚
4. Read about **D3O** and **liquid body armor (STF)** to see how the pros seal the
   fluid so it never dries out.
5. Sketch the final 3-layer helmet and compare its weight & airflow to a normal one.

---

## 📁 Project structure

```
index.html         # The whole UI / layout
styles.css         # Styling
src/main.js        # Wires everything together (tabs, calculator, etc.)
src/challenge.js   # The Design Challenge: constraints, live model + crash sim
src/helmet.js      # The 3D helmet model (Three.js)
src/simulator.js   # The shear-thickening particle simulation (2D canvas)
data/components.js # The "parts box": materials + properties + crash limits
data/materials.js  # The materials shown in the guide
```

Made for Aarav — keep experimenting! 🧪

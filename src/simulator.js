// 2D particle simulator showing WHY a shear-thickening fluid hardens.
// Slow shear -> particles flow past each other. Fast shear -> they jam into
// "hydroclusters" (drawn as bonded, locked particles).
export function initSimulator(canvas, onState) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const N = 140;
  const particles = [];
  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 8 + Math.random() * 4,
    });
  }

  // shear = how fast we're pushing (0..1). High shear = jammed/hard.
  let shear = 0.1;
  let jam = 0; // smoothed "how locked" value 0..1
  let mouse = { x: W / 2, y: H / 2, active: false, lastX: 0, lastY: 0 };

  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);
    if (mouse.active) {
      const speed = Math.hypot(x - mouse.lastX, y - mouse.lastY);
      shear = Math.min(1, shear * 0.6 + (speed / 40) * 0.6);
    }
    mouse.x = x; mouse.y = y;
    mouse.lastX = x; mouse.lastY = y;
  });
  canvas.addEventListener("pointerdown", (e) => {
    mouse.active = true;
    const rect = canvas.getBoundingClientRect();
    mouse.lastX = (e.clientX - rect.left) * (W / rect.width);
    mouse.lastY = (e.clientY - rect.top) * (H / rect.height);
  });
  window.addEventListener("pointerup", () => (mouse.active = false));

  function setShear(v) { shear = Math.max(0, Math.min(1, v)); }
  function punch() { shear = 1; } // a sudden fast hit

  function step() {
    // shear decays back toward soft over time (reversible!)
    shear *= 0.96;
    // jam follows shear but with momentum
    jam += (shear - jam) * 0.2;

    const locked = jam > 0.45;

    for (const p of particles) {
      // when jammed, movement is heavily damped (acts solid)
      const damp = locked ? 0.6 : 0.995;
      p.x += p.vx * (locked ? 0.2 : 1);
      p.y += p.vy * (locked ? 0.2 : 1);
      p.vx *= damp;
      p.vy *= damp;

      // gentle drift when soft
      if (!locked) {
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
      }

      // walls
      if (p.x < p.r) { p.x = p.r; p.vx *= -0.5; }
      if (p.x > W - p.r) { p.x = W - p.r; p.vx *= -0.5; }
      if (p.y < p.r) { p.y = p.r; p.vy *= -0.5; }
      if (p.y > H - p.r) { p.y = H - p.r; p.vy *= -0.5; }
    }

    // simple collision separation (stronger when jammed = log-jam)
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const a = particles[i], b = particles[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const min = a.r + b.r;
        if (dist < min) {
          const push = ((min - dist) / dist) * (locked ? 0.5 : 0.25);
          a.x -= dx * push; a.y -= dy * push;
          b.x += dx * push; b.y += dy * push;
        }
      }
    }

    draw(locked);
    if (onState) onState({ shear, jam, locked });
    requestAnimationFrame(step);
  }

  function draw(locked) {
    ctx.clearRect(0, 0, W, H);

    // background tint shifts green(soft) -> red(hard)
    const t = jam;
    ctx.fillStyle = `rgba(${20 + t * 40}, ${30 - t * 10}, ${45 - t * 15}, 1)`;
    ctx.fillRect(0, 0, W, H);

    // draw bonds between close particles when jammed (the hydroclusters)
    if (locked) {
      ctx.strokeStyle = `rgba(255, 93, 108, ${0.2 + t * 0.5})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d < a.r + b.r + 6) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    for (const p of particles) {
      const g = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 1, p.x, p.y, p.r);
      if (locked) {
        g.addColorStop(0, "#ff9aa2");
        g.addColorStop(1, "#ff5d6c");
      } else {
        g.addColorStop(0, "#9cffd9");
        g.addColorStop(1, "#43e0a0");
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  step();
  return { setShear, punch };
}

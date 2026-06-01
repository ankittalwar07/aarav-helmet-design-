// 3D helmet built procedurally with Three.js.
// Three layers: airy outer shell, smart-gel layer, comfort liner.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function initHelmet(container) {
  const width = container.clientWidth;
  const height = container.clientHeight || 520;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1026);

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(3.2, 2.0, 4.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 2.5;
  controls.maxDistance = 9;
  controls.target.set(0, 0.2, 0);

  // Lighting
  scene.add(new THREE.AmbientLight(0x88aaff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7c5cff, 0.8);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  // Ground glow disc
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 48),
    new THREE.MeshBasicMaterial({ color: 0x16224a, transparent: true, opacity: 0.5 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -1.25;
  scene.add(disc);

  // The helmet is a group of nested half-spheres.
  const helmet = new THREE.Group();
  scene.add(helmet);

  const phiStart = 0;
  const phiLength = Math.PI * 2;
  const thetaStart = 0;
  const thetaLength = Math.PI * 0.62; // open at the bottom like a helmet

  // ---- Comfort liner (innermost, touches hair) ----
  const comfort = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 48, 32, phiStart, phiLength, thetaStart, thetaLength),
    new THREE.MeshStandardMaterial({ color: 0xc9a7ff, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide })
  );
  helmet.add(comfort);

  // ---- Smart-gel layer (the star of the show) ----
  const gelMat = new THREE.MeshStandardMaterial({
    color: 0x43e0a0,
    roughness: 0.35,
    metalness: 0.1,
    transparent: true,
    opacity: 0.55,
    emissive: 0x0a3a28,
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide,
  });
  const gel = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 64, 40, phiStart, phiLength, thetaStart, thetaLength),
    gelMat
  );
  helmet.add(gel);

  // ---- Airy outer shell (with ventilation holes punched as cylinders) ----
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x6fa8ff,
    roughness: 0.4,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1.28, 64, 40, phiStart, phiLength, thetaStart, thetaLength),
    shellMat
  );
  helmet.add(shell);

  // ---- Ventilation channels: little tube rings on the shell ----
  const vents = new THREE.Group();
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x0a1026, roughness: 0.6 });
  const ventPositions = [
    [0, 0.0], [0, 0.9], [0, -0.9],
    [0.7, 0.5], [-0.7, 0.5], [0.7, -0.5], [-0.7, -0.5],
    [1.2, 0], [-1.2, 0],
  ];
  for (const [phi, theta] of ventPositions) {
    const t = 0.5 + theta * 0.4; // vertical position
    const p = phi;
    const r = 1.29;
    const v = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 12, 20), ventMat);
    const dir = new THREE.Vector3(
      Math.sin(t) * Math.cos(p),
      Math.cos(t),
      Math.sin(t) * Math.sin(p)
    );
    v.position.copy(dir.clone().multiplyScalar(r));
    v.lookAt(dir.clone().multiplyScalar(r * 2));
    vents.add(v);
  }
  helmet.add(vents);

  // ---- A little chin strap hint ----
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.03, 8, 40, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x2a3a6b })
  );
  strap.rotation.x = Math.PI / 2;
  strap.rotation.z = Math.PI;
  strap.position.y = -0.1;
  helmet.add(strap);

  // ---- Impact flash marker (where a crash lands) ----
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xff5d6c, emissive: 0xff5d6c, emissiveIntensity: 1, transparent: true, opacity: 0 })
  );
  helmet.add(flash);

  // State controlled from main.js
  const state = {
    showGel: true,
    showVents: true,
    section: false,
    spin: true,
    impactT: 0, // 0..1 animation progress, 0 = idle
  };

  function applyToggles() {
    gel.visible = state.showGel;
    vents.visible = state.showVents;
    // Cross-section: clip everything with a plane through the middle.
    const clip = state.section ? [new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)] : [];
    renderer.localClippingEnabled = state.section;
    for (const m of [comfort.material, gelMat, shellMat]) {
      m.clippingPlanes = clip;
      m.needsUpdate = true;
    }
  }
  applyToggles();

  // Trigger a crash test: pick a random spot, flash the gel hard there.
  function triggerImpact() {
    const phi = (Math.random() - 0.5) * Math.PI;
    const theta = 0.5 + Math.random() * 0.7;
    flash.userData.dir = new THREE.Vector3(
      Math.sin(theta) * Math.cos(phi),
      Math.cos(theta),
      Math.sin(theta) * Math.sin(phi)
    );
    flash.position.copy(flash.userData.dir.clone().multiplyScalar(1.28));
    state.impactT = 0.0001;
  }

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();

    if (state.spin) helmet.rotation.y += dt * 0.35;

    // Impact animation: gel flashes from green -> hard red and back.
    if (state.impactT > 0) {
      state.impactT += dt * 1.2;
      const t = state.impactT;
      // intensity pulse 0->1->0
      const pulse = Math.sin(Math.min(t, 1) * Math.PI);
      gelMat.color.setRGB(0.26 + pulse * 0.74, 0.88 - pulse * 0.6, 0.63 - pulse * 0.4);
      gelMat.emissiveIntensity = 0.4 + pulse * 1.2;
      gelMat.opacity = 0.55 + pulse * 0.35;
      flash.material.opacity = pulse;
      flash.scale.setScalar(1 + pulse * 1.5);
      if (t >= 1) {
        state.impactT = 0;
        gelMat.color.setHex(0x43e0a0);
        gelMat.emissiveIntensity = 0.4;
        gelMat.opacity = 0.55;
        flash.material.opacity = 0;
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight || 520;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  return { state, applyToggles, triggerImpact };
}

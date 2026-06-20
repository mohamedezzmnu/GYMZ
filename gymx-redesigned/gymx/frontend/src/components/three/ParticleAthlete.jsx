import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ── build a humanoid point-cloud silhouette via rejection sampling ──
function sampleHuman(count) {
  function ellipsoid(cx, cy, cz, rx, ry, rz) {
    let x, y, z;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
    } while (x * x + y * y + z * z > 1);
    return [cx + x * rx, cy + y * ry, cz + z * rz];
  }
  const parts = [
    { fn: () => ellipsoid(0, 3.05, 0, 0.42, 0.5, 0.42), w: 0.10 }, // head
    { fn: () => ellipsoid(0, 1.85, 0, 0.95, 1.05, 0.55), w: 0.26 }, // chest
    { fn: () => ellipsoid(0, 0.65, 0, 0.62, 0.85, 0.45), w: 0.14 }, // hips
    { fn: () => ellipsoid(-1.15, 1.95, 0, 0.32, 0.85, 0.32), w: 0.10 }, // L upper arm
    { fn: () => ellipsoid(-1.55, 0.75, 0.05, 0.26, 0.85, 0.26), w: 0.08 }, // L forearm
    { fn: () => ellipsoid(1.15, 1.95, 0, 0.32, 0.85, 0.32), w: 0.10 }, // R upper arm
    { fn: () => ellipsoid(1.55, 0.75, 0.05, 0.26, 0.85, 0.26), w: 0.08 }, // R forearm
    { fn: () => ellipsoid(-0.42, -0.9, 0, 0.4, 1.3, 0.4), w: 0.12 }, // L leg
    { fn: () => ellipsoid(0.42, -0.9, 0, 0.4, 1.3, 0.4), w: 0.12 }, // R leg
  ];
  const pts = [];
  for (let i = 0; i < count; i++) {
    let r = Math.random(), acc = 0, chosen = parts[0];
    for (const p of parts) { acc += p.w; if (r <= acc) { chosen = p; break; } }
    pts.push(chosen.fn());
  }
  return pts;
}

function makeDumbbell() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, emissive: 0xff3b1e, emissiveIntensity: 0.6, metalness: 0.6, roughness: 0.35,
  });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 12), mat);
  bar.rotation.z = Math.PI / 2;
  g.add(bar);
  [-0.5, 0.5].forEach((x) => {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), mat);
    ball.position.x = x;
    g.add(ball);
  });
  return g;
}

/**
 * Full-bleed canvas: a particle-cloud athlete silhouette + floating glowing
 * dumbbells. Meant to sit absolutely positioned behind hero copy (zIndex 0).
 */
export default function ParticleAthlete({ className = '', style = {} }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.4, 9);

    function resize() {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    const COUNT = 9000;
    const positions = new Float32Array(COUNT * 3);
    const basePositions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const human = sampleHuman(COUNT);
    const cOrange = new THREE.Color('#FF7A1A');
    const cRed = new THREE.Color('#FF2B30');
    for (let i = 0; i < COUNT; i++) {
      const [x, y, z] = human[i];
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
      basePositions[i * 3] = x; basePositions[i * 3 + 1] = y; basePositions[i * 3 + 2] = z;
      const t = THREE.MathUtils.clamp((y + 1.2) / 4.2, 0, 1);
      const c = cOrange.clone().lerp(cRed, t);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.92,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    points.position.y = -0.4;
    scene.add(points);

    const dumbbells = [];
    const dbPositions = [[-3.2, 1.6, -1], [3.0, 2.4, -1.5], [-2.6, -1.6, 0.5], [2.8, -0.8, -0.5]];
    dbPositions.forEach((p) => {
      const d = makeDumbbell();
      d.position.set(...p);
      d.rotation.set(Math.random(), Math.random(), Math.random());
      d.scale.setScalar(0.85 + Math.random() * 0.3);
      scene.add(d);
      dumbbells.push({ mesh: d, speed: 0.4 + Math.random() * 0.4, offset: Math.random() * Math.PI * 2 });
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const key = new THREE.PointLight(0xff5a30, 2.2, 20); key.position.set(3, 4, 4); scene.add(key);
    const rim = new THREE.PointLight(0xff1e2e, 1.6, 20); rim.position.set(-4, -2, 3); scene.add(rim);

    let mouseX = 0, mouseY = 0;
    function onMouseMove(e) {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);
    resize();

    let raf;
    const clock = new THREE.Clock();
    function animate() {
      const t = clock.getElapsedTime();
      points.rotation.y = t * 0.15 + mouseX * 0.6;
      points.rotation.x = mouseY * 0.2;
      points.position.y = -0.4 + Math.sin(t * 0.6) * 0.12;

      const arr = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i += 7) {
        const idx = i * 3;
        arr[idx + 1] = basePositions[idx + 1] + Math.sin(t * 1.5 + i * 0.05) * 0.02;
      }
      geo.attributes.position.needsUpdate = true;

      dumbbells.forEach((d) => {
        d.mesh.rotation.x += 0.004 * d.speed;
        d.mesh.rotation.y += 0.006 * d.speed;
        d.mesh.position.y += Math.sin(t * d.speed + d.offset) * 0.0025;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    if (reduceMotion) {
      renderer.render(scene, camera); // single static frame, no rAF loop
    } else {
      animate();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      geo.dispose();
      mat.dispose();
      dumbbells.forEach((d) => d.mesh.traverse((o) => { if (o.material) o.material.dispose(); if (o.geometry) o.geometry.dispose(); }));
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} style={{ position: 'absolute', inset: 0, ...style }} />;
}

"use client";

import { useEffect, useRef } from "react";
import styles from "./client-map-3d.module.css";

/** Rough continent outlines on an 800×400 equirectangular canvas. */
const CONTINENTS = [
  "60 60 150 40 230 50 250 80 230 110 200 130 190 165 165 190 140 175 120 150 90 130 70 100",
  "190 205 230 200 260 225 265 265 245 310 220 345 205 340 195 300 180 260",
  "370 55 430 45 470 60 465 95 430 110 400 120 375 100",
  "380 130 440 125 480 150 490 195 470 245 445 285 420 290 400 250 380 205 370 165",
  "480 45 560 35 650 45 720 60 740 95 700 120 660 140 620 150 600 185 570 200 545 170 515 150 485 120 470 90",
  "640 195 690 195 720 215 700 235 660 230 640 215",
  "665 260 725 250 760 275 750 315 705 325 670 300",
].map((s) => {
  const n = s.split(" ").map(Number);
  const pts: [number, number][] = [];
  for (let i = 0; i < n.length; i += 2) pts.push([n[i], n[i + 1]]);
  return pts;
});

/** Client locations (lat, lon). OWNER: replace non-HQ entries with real client cities. */
const LOCATIONS = [
  { name: "India · HQ", lat: 22.5, lon: 78, hq: true },
  { name: "Delhi", lat: 28.6, lon: 77.2 },
  { name: "Mumbai", lat: 19.1, lon: 72.9 },
  { name: "Bengaluru", lat: 12.97, lon: 77.6 },
  { name: "Kolkata", lat: 22.6, lon: 88.4 },
];

function inside(x: number, y: number, poly: [number, number][]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Land dots as [lat, lon], sampled once. */
const LAND: [number, number][] = [];
for (let lat = -60; lat <= 80; lat += 3) {
  const step = 3 / Math.max(Math.cos((lat * Math.PI) / 180), 0.3);
  for (let lon = -180; lon < 180; lon += step) {
    const x = ((lon + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    if (CONTINENTS.some((p) => inside(x, y, p))) LAND.push([lat, lon]);
  }
}

const RAD = Math.PI / 180;
const TILT = -18 * RAD;
const BASE_ROT = -78 * RAD; // India faces the viewer

/** Round 3D globe with pulsing client pins, drawn on canvas. */
export function ClientMap3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = document.documentElement.dataset.motion === "reduce";
    let rot = BASE_ROT;
    let frame = 0;
    let t = 0;

    const project = (lat: number, lon: number, r: number) => {
      const la = lat * RAD;
      const lo = lon * RAD + rot;
      const x = Math.cos(la) * Math.sin(lo);
      const y0 = Math.sin(la);
      const z0 = Math.cos(la) * Math.cos(lo);
      const y = y0 * Math.cos(TILT) - z0 * Math.sin(TILT);
      const z = y0 * Math.sin(TILT) + z0 * Math.cos(TILT);
      return { x: x * r, y: -y * r, z };
    };

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = canvas.clientWidth;
      if (!size) return;
      if (canvas.width !== Math.round(size * dpr)) {
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const c = size / 2;
      const r = size * 0.42;

      const body = ctx.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.1, c, c, r);
      body.addColorStop(0, "#ffffff");
      body.addColorStop(0.7, "#eaf0fa");
      body.addColorStop(1, "#cfdaee");
      ctx.save();
      ctx.shadowColor = "rgba(19,40,90,0.25)";
      ctx.shadowBlur = 50;
      ctx.shadowOffsetY = 24;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fillStyle = body;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#7d8db0";
      for (const [lat, lon] of LAND) {
        const p = project(lat, lon, r);
        if (p.z <= 0) continue;
        ctx.globalAlpha = 0.25 + p.z * 0.75;
        ctx.beginPath();
        ctx.arc(c + p.x, c + p.y, 0.8 + p.z * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const hq = LOCATIONS[0];
      const hp = project(hq.lat, hq.lon, r);
      for (const l of LOCATIONS) {
        const p = project(l.lat, l.lon, r);
        if (p.z <= 0.05) continue;
        const x = c + p.x;
        const y = c + p.y;
        if (!l.hq && hp.z > 0) {
          ctx.strokeStyle = "rgba(48,121,234,0.7)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(c + hp.x, c + hp.y);
          ctx.quadraticCurveTo((c + hp.x + x) / 2, Math.min(c + hp.y, y) - 18, x, y);
          ctx.stroke();
        }
        const pulse = (t / 90 + (l.hq ? 0 : 0.4)) % 1;
        ctx.strokeStyle = `rgba(48,121,234,${1 - pulse})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 4 + pulse * 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = l.hq ? "#0d0f14" : "#3079ea";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, l.hq ? 5.5 : 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (hp.z > 0.2) {
        const x = c + hp.x;
        const y = c + hp.y - 24;
        ctx.font = "600 12px system-ui, sans-serif";
        const w = ctx.measureText(hq.name).width + 22;
        ctx.fillStyle = "#0d0f14";
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y - 13, w, 26, 13);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(hq.name, x, y);
      }

      const rim = ctx.createRadialGradient(c, c, r * 0.85, c, c, r);
      rim.addColorStop(0, "rgba(48,121,234,0)");
      rim.addColorStop(1, "rgba(48,121,234,0.18)");
      ctx.beginPath();
      ctx.arc(c, c, r, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();
    };

    const loop = () => {
      t += 1;
      rot = BASE_ROT + Math.sin(t / 400) * 0.9; // gentle sway, India stays in view
      draw();
      frame = requestAnimationFrame(loop);
    };
    if (reduce) draw();
    else loop();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.stage}>
      <canvas ref={canvasRef} className={styles.globe} role="img" aria-label="3D globe showing our client locations" />
      <div className={styles.legend}>
        <span><i className={styles.legendHq} /> Headquarters</span>
        <span><i className={styles.legendClient} /> Client locations</span>
      </div>
    </div>
  );
}

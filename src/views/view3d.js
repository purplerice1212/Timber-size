const COLORS = {
  post: '#f5dfe0',
  lintel: '#e8e8e8',
  rail: '#c9e1ff',
  support: '#f6c16c',
  bin: 'rgba(255,179,179,0.65)'
};

export const state3D = {yaw: 0.5, pitch: 0.3, zoom: 1};

function rgba(hex, alpha = 1) {
  if (hex.startsWith('rgba')) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeBoxFaces(x, y, z, w, h, d, color = '#ddd', alpha = 1, edge = '#333') {
  const v = [
    [x, y, z],
    [x + w, y, z],
    [x + w, y + h, z],
    [x, y + h, z],
    [x, y, z + d],
    [x + w, y, z + d],
    [x + w, y + h, z + d],
    [x, y + h, z + d]
  ];
  const q = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 4, 7, 3], [1, 5, 6, 2], [0, 1, 5, 4], [3, 2, 6, 7]];
  return q.map(idx => ({pts: idx.map(i => v[i]), color, alpha, edge}));
}

function sizeCanvas(cvs) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const r = cvs.getBoundingClientRect();
  const w = Math.max(1, Math.floor(r.width * dpr));
  const h = Math.max(1, Math.floor(r.height * dpr));
  if (cvs.width !== w || cvs.height !== h) {
    cvs.width = w;
    cvs.height = h;
    cvs.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

export function render3d(canvas, model) {
  sizeCanvas(canvas);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const faces = [];
  model.boxes.forEach(b => {
    const color = COLORS[b.type] || '#ddd';
    const alpha = b.type === 'bin' ? 0.65 : 1;
    makeBoxFaces(b.x, b.y, b.z, b.w, b.h, b.d, color, alpha, '#333').forEach(f => faces.push(f));
  });

  const cx = model.bounds.width / 2;
  const cy = model.bounds.height / 2;
  const cz = model.bounds.depth / 2;
  const radius = Math.sqrt(
    model.bounds.width ** 2 +
    model.bounds.height ** 2 +
    model.bounds.depth ** 2
  ) / 2;
  const viewport = Math.min(canvas.width, canvas.height);
  const f = 700, target = Math.max(1, viewport * 0.45);
  const camDist = Math.max(radius + 1, radius * (1 + f / target)) * state3D.zoom;

  const rotY = (p, a) => [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
  const rotX = (p, a) => [p[0], p[1] * Math.cos(a) - p[2] * Math.sin(a), p[1] * Math.sin(a) + p[2] * Math.cos(a)];
  const proj = pt => {
    const p0 = [pt[0] - cx, pt[1] - cy, pt[2] - cz];
    const p1 = rotY(p0, state3D.yaw);
    const p2 = rotX(p1, state3D.pitch);
    const z = camDist - p2[2];
    const s = f / z;
    return [canvas.width / 2 + p2[0] * s, canvas.height / 2 - p2[1] * s, z];
  };

  faces.forEach(f => {
    const tp = f.pts.map(proj);
    f.scr = tp.map(p => [p[0], p[1]]);
    f.avgZ = tp.reduce((a, b) => a + b[2], 0) / tp.length;
  });
  faces.sort((a, b) => b.avgZ - a.avgZ);

  ctx.lineWidth = 1.2;
  faces.forEach(f => {
    ctx.beginPath();
    f.scr.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fillStyle = rgba(f.color, f.alpha);
    ctx.strokeStyle = f.edge;
    ctx.fill();
    ctx.stroke();
  });
}

export function bind3dControls(canvas, render) {
  canvas.addEventListener('dblclick', () => {
    state3D.yaw = 0.5;
    state3D.pitch = 0.3;
    state3D.zoom = 1;
    render();
  });
  canvas.addEventListener('wheel', e => {
    state3D.zoom = Math.max(0.5, Math.min(3, state3D.zoom + (e.deltaY > 0 ? 0.1 : -0.1)));
    render();
  }, {passive: true});
  let dragging = false, lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    state3D.yaw += dx * 0.01;
    state3D.pitch = Math.max(-1.1, Math.min(1.1, state3D.pitch + dy * 0.01));
    lastX = e.clientX;
    lastY = e.clientY;
    render();
  });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointerleave', end);
  canvas.addEventListener('pointercancel', end);
}


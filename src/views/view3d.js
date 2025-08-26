import {drawPolygon} from '../utils/draw2d.js';
import {makeCamera, project} from '../utils/camera3d.js';
import {colorFor} from '../utils/colors.js';

export function render3d(canvas, model, opts = {}) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cam = makeCamera(model.bounds);
  cam.cx = canvas.width / 2;
  cam.cy = canvas.height * 0.8;
  const ox = model.bounds.min.x;
  const oy = model.bounds.min.y;
  const oz = model.bounds.min.z;
  model.boxes.forEach(box => {
    const pts = [
      {x: box.x - ox, y: box.y - oy, z: box.z - oz},
      {x: box.x + box.w - ox, y: box.y - oy, z: box.z - oz},
      {x: box.x + box.w - ox, y: box.y + box.h - oy, z: box.z - oz},
      {x: box.x - ox, y: box.y + box.h - oy, z: box.z - oz},
      {x: box.x - ox, y: box.y - oy, z: box.z + box.d - oz},
      {x: box.x + box.w - ox, y: box.y - oy, z: box.z + box.d - oz},
      {x: box.x + box.w - ox, y: box.y + box.h - oy, z: box.z + box.d - oz},
      {x: box.x - ox, y: box.y + box.h - oy, z: box.z + box.d - oz}
    ];
    const p = pts.map(pt => project(pt, cam));
    const color = colorFor(box);
    drawPolygon(ctx, [p[0], p[1], p[2], p[3]], color);
    drawPolygon(ctx, [p[4], p[5], p[6], p[7]], color);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(p[i].x, p[i].y);
      ctx.lineTo(p[i + 4].x, p[i + 4].y);
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  });
  if (opts.showDimensions) {
    const width = model.bounds.max.x - model.bounds.min.x;
    const height = model.bounds.max.y - model.bounds.min.y;
    const depth = model.bounds.max.z - model.bounds.min.z;
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`W:${width} H:${height} D:${depth}`, 10, 20);
    ctx.restore();
  }
}

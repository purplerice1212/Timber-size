import {drawPolygon} from '../utils/draw2d.js';
import {makeCamera, project} from '../utils/camera3d.js';
import {TYPE_COLORS} from '../utils/typeColors.js';

export function render3d(canvas, model) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const {min, max} = model.bounds;
  const width = max[0] - min[0];
  const height = max[1] - min[1];
  const depth = max[2] - min[2];
  const cam = makeCamera({width, height, depth});
  cam.cx = canvas.width / 2;
  cam.cy = canvas.height * 0.8;
  model.boxes.forEach(box => {
    const color = TYPE_COLORS[box.type] || '#fff';
    const pts = [
      {x: box.x - min[0], y: box.y - min[1], z: box.z - min[2]},
      {x: box.x + box.w - min[0], y: box.y - min[1], z: box.z - min[2]},
      {x: box.x + box.w - min[0], y: box.y + box.h - min[1], z: box.z - min[2]},
      {x: box.x - min[0], y: box.y + box.h - min[1], z: box.z - min[2]},
      {x: box.x - min[0], y: box.y - min[1], z: box.z + box.d - min[2]},
      {x: box.x + box.w - min[0], y: box.y - min[1], z: box.z + box.d - min[2]},
      {x: box.x + box.w - min[0], y: box.y + box.h - min[1], z: box.z + box.d - min[2]},
      {x: box.x - min[0], y: box.y + box.h - min[1], z: box.z + box.d - min[2]}
    ];
    const p = pts.map(pt => project(pt, cam));
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
}

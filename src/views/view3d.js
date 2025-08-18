import {drawPolygon} from '../utils/draw2d.js';
import {makeCamera, project} from '../utils/camera3d.js';

export function render3d(canvas, model) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cam = makeCamera(model.bounds);
  cam.cx = canvas.width / 2;
  cam.cy = canvas.height * 0.8;
  model.boxes.forEach(box => {
    const pts = [
      {x: box.x, y: box.y, z: box.z},
      {x: box.x + box.w, y: box.y, z: box.z},
      {x: box.x + box.w, y: box.y + box.h, z: box.z},
      {x: box.x, y: box.y + box.h, z: box.z},
      {x: box.x, y: box.y, z: box.z + box.d},
      {x: box.x + box.w, y: box.y, z: box.z + box.d},
      {x: box.x + box.w, y: box.y + box.h, z: box.z + box.d},
      {x: box.x, y: box.y + box.h, z: box.z + box.d}
    ];
    const p = pts.map(pt => project(pt, cam));
    drawPolygon(ctx, [p[0], p[1], p[2], p[3]]);
    drawPolygon(ctx, [p[4], p[5], p[6], p[7]]);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(p[i].x, p[i].y);
      ctx.lineTo(p[i + 4].x, p[i + 4].y);
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }
  });
}

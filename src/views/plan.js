import {drawRect, drawText, drawOverlayDimensions} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {typeColors} from '../utils/colors.js';

export function renderPlan(canvas, model, overlays = false) {
  const {min, max} = model.bounds;
  const ctx = fitCanvas(canvas, {min:[min[0], min[2]], max:[max[0], max[2]]});
  model.boxes.forEach(box => {
    const color = typeColors[box.type] || '#fff';
    drawRect(ctx, box.x, box.z, box.w, box.d, color);
  });
  if (overlays) {
    drawOverlayDimensions(ctx, model.bounds, [
      {label: 'W', axis: 0},
      {label: 'D', axis: 2}
    ]);
    const scale = ctx.getTransform().a;
    model.channels.forEach(c => {
      const cx = c.x + c.w / 2;
      drawText(ctx, Math.round(c.w).toString(), cx, max[2] + 12/scale, '#0f0');
      ctx.beginPath();
      ctx.moveTo(cx, min[2]);
      ctx.lineTo(cx, max[2]);
      ctx.strokeStyle = '#0f0';
      ctx.stroke();
    });
  }
}

import {drawRect, drawText} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {typeColors} from '../utils/colors.js';

export function renderSide(canvas, model, overlays = false) {
  const {min, max} = model.bounds;
  const ctx = fitCanvas(canvas, {min:[min[2], min[1]], max:[max[2], max[1]]});
  model.boxes.forEach(box => {
    const color = typeColors[box.type] || '#fff';
    drawRect(ctx, box.z, box.y, box.d, box.h, color);
  });
  if (overlays) {
    const scale = ctx.getTransform().a;
    drawText(
      ctx,
      `D:${Math.round(max[2]-min[2])} H:${Math.round(max[1]-min[1])}`,
      min[2] + 2/scale,
      max[1] + 12/scale,
      '#0f0',
      'left'
    );
  }
}

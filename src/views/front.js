import {drawRect, drawText} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {typeColors} from '../utils/colors.js';

export function renderFront(canvas, model, overlays = false) {
  const {min, max} = model.bounds;
  const ctx = fitCanvas(canvas, {min:[min[0], min[1]], max:[max[0], max[1]]});
  model.boxes.forEach(box => {
    const color = typeColors[box.type] || '#fff';
    drawRect(ctx, box.x, box.y, box.w, box.h, color);
  });
    if (overlays) {
      const scale = ctx.getTransform().a;
      drawText(
        ctx,
        `W:${Math.round(max[0]-min[0])} H:${Math.round(max[1]-min[1])}`,
        min[0] + 2/scale,
        max[1] + 12/scale,
        '#0f0',
        'left'
      );
    }
}

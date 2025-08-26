import {drawRect, drawLabel} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {TYPE_COLORS} from '../utils/typeColors.js';

export function renderFront(canvas, model, options = {}) {
  const {min, max} = model.bounds;
  const ctx = fitCanvas(canvas, {min: [min[0], min[1]], max: [max[0], max[1]]});
  model.boxes.forEach(box => {
    const color = TYPE_COLORS[box.type] || '#fff';
    drawRect(ctx, box.x, box.y, box.w, box.h, color);
    if (options.dimensions) {
      const label = `${Math.round(box.w)}×${Math.round(box.h)}`;
      drawLabel(ctx, box.x + box.w / 2, box.y + box.h / 2, label, color);
    }
  });
}

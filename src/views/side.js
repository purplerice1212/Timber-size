import {drawRect, drawLabel} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {TYPE_COLORS} from '../utils/typeColors.js';

export function renderSide(canvas, model, options = {}) {
  const {min, max} = model.bounds;
  const ctx = fitCanvas(canvas, {min: [min[2], min[1]], max: [max[2], max[1]]});
  model.boxes.forEach(box => {
    const color = TYPE_COLORS[box.type] || '#fff';
    drawRect(ctx, box.z, box.y, box.d, box.h, color);
    if (options.dimensions) {
      const label = `${Math.round(box.d)}×${Math.round(box.h)}`;
      drawLabel(ctx, box.z + box.d / 2, box.y + box.h / 2, label, color);
    }
  });
}

import {drawRect, drawLabel, drawCross} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {TYPE_COLORS} from '../utils/typeColors.js';

export function renderPlan(canvas, model, options = {}) {
  const {min, max} = model.bounds;
  const ctx = fitCanvas(canvas, {min: [min[0], min[2]], max: [max[0], max[2]]});
  model.boxes.forEach(box => {
    const color = TYPE_COLORS[box.type] || '#fff';
    drawRect(ctx, box.x, box.z, box.w, box.d, color);
    if (options.dimensions) {
      const label = `${Math.round(box.w)}×${Math.round(box.d)}`;
      drawLabel(ctx, box.x + box.w / 2, box.z + box.d / 2, label, color);
    }
    if (options.openings && box.type === 'bin') {
      drawCross(ctx, box.x, box.z, box.w, box.d, color);
    }
  });
}

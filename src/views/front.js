import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {colorFor} from '../utils/colors.js';

export function renderFront(canvas, model, opts = {}) {
  const ctx = fitCanvas(canvas, model.bounds, ['x', 'y']);
  model.boxes.forEach(box => {
    drawRect(ctx, box.x, box.y, box.w, box.h, colorFor(box));
  });
  if (opts.showDimensions) {
    const width = model.bounds.max.x - model.bounds.min.x;
    const height = model.bounds.max.y - model.bounds.min.y;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`W: ${width}`, 10, 20);
    ctx.fillText(`H: ${height}`, 10, 40);
    ctx.restore();
  }
}

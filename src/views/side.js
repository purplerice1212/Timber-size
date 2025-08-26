import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {colorFor} from '../utils/colors.js';

export function renderSide(canvas, model, opts = {}) {
  const ctx = fitCanvas(canvas, model.bounds, ['z', 'y']);
  model.boxes.forEach(box => {
    drawRect(ctx, box.z, box.y, box.d, box.h, colorFor(box));
  });
  if (opts.showDimensions) {
    const depth = model.bounds.max.z - model.bounds.min.z;
    const height = model.bounds.max.y - model.bounds.min.y;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`D: ${depth}`, 10, 20);
    ctx.fillText(`H: ${height}`, 10, 40);
    ctx.restore();
  }
}

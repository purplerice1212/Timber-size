import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {colorFor} from '../utils/colors.js';

export function renderPlan(canvas, model, opts = {}) {
  const ctx = fitCanvas(canvas, model.bounds, ['x', 'z']);
  model.boxes.forEach(box => {
    drawRect(ctx, box.x, box.z, box.w, box.d, colorFor(box));
  });
  if (opts.showOpenings) {
    model.boxes.filter(b => b.opening).forEach(box => {
      const cx = box.x + box.w / 2;
      const cz = box.z + box.d / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cz - 10);
      ctx.lineTo(cx + 10, cz + 10);
      ctx.moveTo(cx + 10, cz - 10);
      ctx.lineTo(cx - 10, cz + 10);
      ctx.strokeStyle = '#ff0';
      ctx.stroke();
    });
  }
  if (opts.showDimensions) {
    const width = model.bounds.max.x - model.bounds.min.x;
    const depth = model.bounds.max.z - model.bounds.min.z;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`W: ${width}`, 10, 20);
    ctx.fillText(`D: ${depth}`, 10, 40);
    ctx.restore();
  }
}

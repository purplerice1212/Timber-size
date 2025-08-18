import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';

export function renderPlan(canvas, model) {
  const ctx = fitCanvas(canvas, {width: model.bounds.width, height: model.bounds.depth});
  model.boxes.forEach(box => {
    drawRect(ctx, box.x, box.z, box.w, box.d);
  });
}

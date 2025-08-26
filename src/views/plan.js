import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';

export function renderPlan(canvas, model) {
  const {min, max} = model.bounds;
  const width = max[0] - min[0];
  const height = max[2] - min[2];
  const ctx = fitCanvas(canvas, {width, height});
  model.boxes.forEach(box => {
    drawRect(ctx, box.x - min[0], box.z - min[2], box.w, box.d);
  });
}

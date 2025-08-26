import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';

export function renderFront(canvas, model) {
  const {min, max} = model.bounds;
  const width = max[0] - min[0];
  const height = max[1] - min[1];
  const ctx = fitCanvas(canvas, {width, height});
  model.boxes.forEach(box => {
    drawRect(ctx, box.x - min[0], box.y - min[1], box.w, box.h);
  });
}

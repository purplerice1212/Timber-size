import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';

export function renderSide(canvas, model) {
  const {min, max} = model.bounds;
  const width = max[2] - min[2];
  const height = max[1] - min[1];
  const ctx = fitCanvas(canvas, {width, height});
  model.boxes.forEach(box => {
    drawRect(ctx, box.z - min[2], box.y - min[1], box.d, box.h);
  });
}

import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';

export function renderSide(canvas, model) {
  const ctx = fitCanvas(canvas, {width: model.bounds.depth, height: model.bounds.height});
  model.boxes.forEach(box => {
    drawRect(ctx, box.z, box.y, box.d, box.h);
  });
}

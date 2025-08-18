import {drawRect} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';

export function renderFront(canvas, model) {
  const ctx = fitCanvas(canvas, {width: model.bounds.width, height: model.bounds.height});
  model.boxes.forEach(box => {
    drawRect(ctx, box.x, box.y, box.w, box.h);
  });
}

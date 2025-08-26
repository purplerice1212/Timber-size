import {drawRect, drawOverlayDimensions} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {typeColors} from '../utils/colors.js';

export function renderFront(canvas, model, overlays = false) {
  const {min, max} = model.bounds;
  const ctx = fitCanvas(canvas, {min:[min[0], min[1]], max:[max[0], max[1]]});
  model.boxes.forEach(box => {
    const color = typeColors[box.type] || '#fff';
    drawRect(ctx, box.x, box.y, box.w, box.h, color);
  });
    if (overlays) {
      drawOverlayDimensions(
        ctx,
        {min:[min[0], min[1]], max:[max[0], max[1]]},
        [`W:${Math.round(max[0]-min[0])}`, `H:${Math.round(max[1]-min[1])}`]
      );
    }
}

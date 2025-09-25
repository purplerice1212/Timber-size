import {drawRect, drawOverlayDimensions} from '../utils/draw2d.js';
import {fitCanvas} from '../utils/fit.js';
import {getTypeColor} from '../utils/colors.js';

export function renderSide(canvas, model, overlays = false) {
  const {min, max} = model.bounds;
  const ctx = fitCanvas(canvas, {min:[min[2], min[1]], max:[max[2], max[1]]});
  model.boxes.forEach(box => {
    const color = getTypeColor(box.type);
    drawRect(ctx, box.z, box.y, box.d, box.h, color);
  });
  if (overlays) {
    drawOverlayDimensions(ctx, model.bounds, [
      {label: 'D', axis: 2},
      {label: 'H', axis: 1}
    ]);
  }
}

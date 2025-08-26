// Fit a canvas to model bounds. Bounds may include `min`/`max` pairs where
// width = max.x - min.x etc. `axes` selects which axes to render (eg. ['x','y']).
export function fitCanvas(canvas, bounds, axes = ['x', 'y']) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const [ax, ay] = axes;
  const width = bounds.max[ax] - bounds.min[ax];
  const height = bounds.max[ay] - bounds.min[ay];
  const scale = Math.min(canvas.width / width, canvas.height / height);
  const tx = -bounds.min[ax] * scale;
  const ty = -bounds.min[ay] * scale;

  // Flip vertical axis so positive values go upward.
  ctx.setTransform(scale, 0, 0, -scale, tx, canvas.height - ty);
  return ctx;
}
